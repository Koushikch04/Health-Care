import { HfInference } from "@huggingface/inference";
import Specialty from "../models/Specialty.js";

const HF_MODEL = process.env.HF_TRIAGE_MODEL || "Qwen/Qwen2.5-7B-Instruct";

const hf = process.env.HF_API_KEY
  ? new HfInference(process.env.HF_API_KEY)
  : null;

const DEFAULT_DISCLAIMER =
  "This is informational only and not a diagnosis. If symptoms are severe or worsening, seek urgent medical care.";

const HF_MODEL_FALLBACKS = [
  "Qwen/Qwen2.5-7B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.2",
];

const safeJsonParse = (text, fallback) => {
  try {
    return JSON.parse(text);
  } catch (_error) {
    const fencedJsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
    if (fencedJsonMatch?.[1]) {
      try {
        return JSON.parse(fencedJsonMatch[1].trim());
      } catch (_nestedError) {
        return fallback;
      }
    }
    return fallback;
  }
};

const parseStructuredResponse = (text, fallback) => {
  const parsed = safeJsonParse(text, fallback);
  return parsed === fallback ? null : parsed;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isModelNotSupportedError = (error) => {
  const status = error?.httpResponse?.status;
  const code = error?.httpResponse?.body?.error?.code;
  return status === 400 && code === "model_not_supported";
};

const normalizeRecommendedSpecialties = (raw, specialtyNames) => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const specialtyMap = new Map(
    specialtyNames.map((name) => [name.toLowerCase(), name]),
  );
  const normalized = [];
  const used = new Set();

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const specialtyInput =
      typeof item.specialty === "string" ? item.specialty.trim() : "";
    const specialty = specialtyMap.get(specialtyInput.toLowerCase());

    if (!specialty || used.has(specialty)) {
      continue;
    }

    used.add(specialty);
    normalized.push({
      specialty,
      reason: typeof item.reason === "string" ? item.reason.trim() : "",
      confidence:
        typeof item.confidence === "string" ? item.confidence.trim() : "Medium",
    });
  }

  return normalized.slice(0, 4);
};

const inferSpecialtiesFromReply = (reply, specialtyNames) => {
  if (!reply || typeof reply !== "string") {
    return [];
  }

  const lowerReply = reply.toLowerCase();
  const inferred = [];

  for (const name of specialtyNames) {
    if (lowerReply.includes(name.toLowerCase())) {
      inferred.push({
        specialty: name,
        reason: "Mentioned in triage response",
        confidence: "Medium",
      });
    }
  }

  return inferred.slice(0, 3);
};

const toChatMessages = (history = []) =>
  history
    .slice(-12)
    .map((entry) => {
      const role = entry?.role === "assistant" ? "assistant" : "user";
      const content = typeof entry?.text === "string" ? entry.text.trim() : "";
      if (!content) {
        return null;
      }
      return { role, content };
    })
    .filter(Boolean);

const toProviderSafeHistory = (history = []) =>
  toChatMessages(history)
    // HF router can intermittently fail with assistant role messages on some providers.
    // Keeping user-only history preserves key context while improving reliability.
    .filter((message) => message.role === "user")
    .slice(-8);

const buildCondensedUserPrompt = ({
  systemPrompt,
  safeHistoryMessages,
  userPrompt,
}) => {
  const historyBlock = safeHistoryMessages
    .map((message, index) => `User(${index + 1}): ${message.content}`)
    .join("\n");

  return `${systemPrompt}

Known user context:
${historyBlock || "No prior user context"}

Task:
${userPrompt}`;
};

const getCandidateModels = () => {
  const models = [];
  const normalizedPrimary = (HF_MODEL || "").trim();

  if (normalizedPrimary) {
    if (normalizedPrimary === "mistralai/Mistral-7B") {
      models.push("mistralai/Mistral-7B-Instruct-v0.2");
    }
    models.push(normalizedPrimary);
  }

  for (const fallbackModel of HF_MODEL_FALLBACKS) {
    if (!models.includes(fallbackModel)) {
      models.push(fallbackModel);
    }
  }

  return models;
};

const callHfJson = async ({
  systemPrompt,
  userPrompt,
  fallback,
  history = [],
}) => {
  if (!hf) {
    return fallback;
  }

  const historyMessages = toProviderSafeHistory(history);
  const candidateModels = getCandidateModels();
  let lastError = null;
  const maxAttemptsPerModel = 2;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt += 1) {
      try {
        const response = await hf.chatCompletion({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...historyMessages,
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 500,
        });

        const content = response?.choices?.[0]?.message?.content || "";
        const parsed = parseStructuredResponse(content, fallback);
        if (parsed) {
          return parsed;
        }
      } catch (error) {
        lastError = error;
        const errorMessage = error?.message || "unknown error";
        const status = error?.httpResponse?.status;
        const body = error?.httpResponse?.body;
        console.warn(
          `HF chatCompletion failed (${model}, attempt ${attempt}): ${errorMessage}; status=${status}; body=${JSON.stringify(body)}`,
        );

        if (isModelNotSupportedError(error)) {
          // Model can never work on this provider setup; skip remaining attempts for this model.
          break;
        }

        if (status >= 500 && attempt < maxAttemptsPerModel) {
          await sleep(250 * attempt);
          continue;
        }
      }

      // Retry with a condensed, single-user prompt for provider stability.
      try {
        const condensedPrompt = buildCondensedUserPrompt({
          systemPrompt,
          safeHistoryMessages: historyMessages,
          userPrompt,
        });
        const retryResponse = await hf.chatCompletion({
          model,
          messages: [{ role: "user", content: condensedPrompt }],
          max_tokens: 400,
        });

        const retryContent =
          retryResponse?.choices?.[0]?.message?.content || "";
        const parsedRetry = parseStructuredResponse(retryContent, fallback);
        if (parsedRetry) {
          return parsedRetry;
        }
      } catch (retryError) {
        lastError = retryError;
        const retryMessage = retryError?.message || "unknown error";
        const retryStatus = retryError?.httpResponse?.status;
        const retryBody = retryError?.httpResponse?.body;
        console.warn(
          `HF condensed retry failed (${model}): ${retryMessage}; status=${retryStatus}; body=${JSON.stringify(retryBody)}`,
        );

        if (isModelNotSupportedError(retryError)) {
          break;
        }
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return fallback;
};

export const analyzeSymptomsWithAI = async (userSymptoms) => {
  try {
    const validSpecialties = await Specialty.find({}, "name");
    const specialtyNames = validSpecialties.map((item) => item.name);
    const specialtyList = specialtyNames.join(", ");

    const parsed = await callHfJson({
      systemPrompt:
        "You are a cautious medical triage assistant. Return valid JSON only.",
      userPrompt: `
User symptoms: "${userSymptoms}"

Available specialties (choose only from this list):
[${specialtyList}]

Return exactly this JSON format:
{
  "recommended_specialties": [
    {
      "specialty": "Exact name from list",
      "reason": "Brief reason",
      "confidence": "High/Medium/Low"
    }
  ]
}

If unclear, prefer General Physician if present in list, otherwise return an empty array.
      `,
      fallback: { recommended_specialties: [] },
    });

    return {
      recommended_specialties: normalizeRecommendedSpecialties(
        parsed.recommended_specialties,
        specialtyNames,
      ),
    };
  } catch (error) {
    console.error("HF Triage Error:", error);
    return {
      recommended_specialties: [
        {
          specialty: "General Physician",
          reason: "Fallback due to temporary triage issue",
          confidence: "Low",
        },
      ],
    };
  }
};

export const generateMedicalChatReply = async ({ message, history = [] }) => {
  if (!hf) {
    return {
      reply:
        "I can help with symptom triage, but AI chat is unavailable right now. Please try again shortly.",
      recommended_specialties: [],
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  try {
    const validSpecialties = await Specialty.find({}, "name");
    const specialtyNames = validSpecialties.map((item) => item.name);
    const specialtyList = specialtyNames.join(", ");

    const parsed = await callHfJson({
      systemPrompt: `You are a healthcare triage assistant.
        Rules:
        1) Be concise, safe, and conversational.
        2) Never provide a definitive diagnosis.
        3) Use previous chat context as source of truth. Do not ignore prior user facts.
        4) Do not ask for information already provided unless there is a real contradiction.
        5) Never reveal or volunteer model/provider/version details unless the user explicitly asks.
        6) Do not invent facts, durations, or symptoms not present in user messages.
        7) Keep focus on symptom triage and next best follow-up questions.`,
      userPrompt: `
        Latest user message:
        ${message}

        Available specialties (choose only from this list):
        [${specialtyList}]

        Return valid JSON only in this exact format:
        {
          "reply": "Concise conversational response",
          "recommended_specialties": [
            {
              "specialty": "Exact name from list",
              "reason": "Why this specialty fits",
              "confidence": "High/Medium/Low"
            }
          ],
          "disclaimer": "Short medical safety disclaimer"
        }

        If more details are needed, ask 1-2 follow-up questions and keep recommended_specialties empty.
        Before asking, check whether that detail is already present in prior user messages.
              `,
      history,
      fallback: {
        reply:
          "Thanks for sharing. How long have you had these symptoms, and how severe are they right now?",
        recommended_specialties: [],
        disclaimer: DEFAULT_DISCLAIMER,
      },
    });

    const reply =
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Thanks for sharing. Could you tell me more about your symptoms?";

    const normalizedSpecialties = normalizeRecommendedSpecialties(
      parsed.recommended_specialties,
      specialtyNames,
    );
    const inferredSpecialties =
      normalizedSpecialties.length > 0
        ? normalizedSpecialties
        : inferSpecialtiesFromReply(reply, specialtyNames);

    return {
      reply,
      recommended_specialties: inferredSpecialties,
      disclaimer:
        typeof parsed.disclaimer === "string" && parsed.disclaimer.trim()
          ? parsed.disclaimer.trim()
          : DEFAULT_DISCLAIMER,
    };
  } catch (error) {
    console.error("HF Chat Error:", error);
    return {
      reply:
        "I could not process that right now. Please try again in a moment, or contact a clinician for urgent concerns.",
      recommended_specialties: [],
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }
};
