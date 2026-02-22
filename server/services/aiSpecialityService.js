import { HfInference } from "@huggingface/inference";
import Specialty from "../models/Specialty.js";

const HF_MODEL =
  process.env.HF_TRIAGE_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

const hf = process.env.HF_API_KEY
  ? new HfInference(process.env.HF_API_KEY)
  : null;

const DEFAULT_DISCLAIMER =
  "This is informational only and not a diagnosis. If symptoms are severe or worsening, seek urgent medical care.";

const HF_MODEL_FALLBACKS = [
  "mistralai/Mistral-7B-Instruct-v0.2",
  "Qwen/Qwen2.5-7B-Instruct",
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

  const normalizedReply = reply
    .toLowerCase()
    .replace(/[*_`#]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const aliasToSpecialty = new Map();
  const addAlias = (alias, specialty) => {
    const normalizedAlias = alias.toLowerCase().trim();
    if (normalizedAlias) {
      aliasToSpecialty.set(normalizedAlias, specialty);
    }
  };

  for (const name of specialtyNames) {
    addAlias(name, name);
    const lowered = name.toLowerCase();
    if (lowered.includes("dermat")) {
      addAlias("dermatologist", name);
      addAlias("dermatology", name);
      addAlias("skin specialist", name);
    }
    if (lowered.includes("general physician") || lowered.includes("general")) {
      addAlias("gp", name);
      addAlias("general doctor", name);
      addAlias("family doctor", name);
      addAlias("primary care", name);
    }
    if (lowered.includes("ent")) {
      addAlias("ear nose throat specialist", name);
      addAlias("otolaryngologist", name);
    }
    if (lowered.includes("gyne")) {
      addAlias("obgyn", name);
      addAlias("gynaecologist", name);
      addAlias("obstetrician", name);
    }
    if (lowered.includes("orthopedic")) {
      addAlias("orthopaedic", name);
      addAlias("bone specialist", name);
    }
  }

  const inferred = [];
  const used = new Set();

  for (const [alias, mappedSpecialty] of aliasToSpecialty.entries()) {
    if (normalizedReply.includes(alias) && !used.has(mappedSpecialty)) {
      used.add(mappedSpecialty);
      inferred.push({
        specialty: mappedSpecialty,
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
    .map(
      (message, index) =>
        `${message.role}(${index + 1}): ${message.content}`,
    )
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

const modelState = new Map();
const MODEL_COOLDOWN_MS = 90 * 1000;
const PROVIDER_5XX_COOLDOWN_MS = 10 * 60 * 1000;

const markModelFailure = (model, status) => {
  const current = modelState.get(model) || {
    failedAt: 0,
    failures: 0,
    cooldownMs: MODEL_COOLDOWN_MS,
  };
  const cooldownMs = status >= 500 ? PROVIDER_5XX_COOLDOWN_MS : MODEL_COOLDOWN_MS;

  modelState.set(model, {
    failedAt: Date.now(),
    failures: current.failures + 1,
    cooldownMs,
  });
};

const isModelCoolingDown = (model) => {
  const state = modelState.get(model);
  if (!state) {
    return false;
  }
  return Date.now() - state.failedAt < (state.cooldownMs || MODEL_COOLDOWN_MS);
};

const markModelSuccess = (model) => {
  modelState.delete(model);
  console.log(`HF chatCompletion success model: ${model}`);
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

  // Keep full chat turns in text form and send as a single user prompt.
  // This avoids provider-side chat template crashes with some OSS models.
  const historyMessages = toChatMessages(history);
  const condensedPrompt = buildCondensedUserPrompt({
    systemPrompt: "",
    safeHistoryMessages: historyMessages,
    userPrompt,
  });

  const allCandidateModels = getCandidateModels();
  const warmedModels = allCandidateModels.filter(
    (model) => !isModelCoolingDown(model),
  );
  const candidateModels = warmedModels.length > 0 ? warmedModels : allCandidateModels;
  let lastError = null;
  let hadUnstructuredResponse = false;
  const maxAttemptsPerModel = 2;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt += 1) {
      try {
        const response = await hf.chatCompletion({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: condensedPrompt },
          ],
          temperature: 0.2,
          max_tokens: 500,
        });

        const content = response?.choices?.[0]?.message?.content || "";
        const parsed = parseStructuredResponse(content, fallback);
        if (parsed) {
          markModelSuccess(model);
          return parsed;
        }
        hadUnstructuredResponse = true;
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
          markModelFailure(model, status);
          break;
        }

        if (status >= 500) {
          // Provider-side outage/noise: cool this model down and move to next model immediately.
          markModelFailure(model, status);
          break;
        }

        if (attempt < maxAttemptsPerModel) {
          await sleep(200 * attempt);
          continue;
        }
      }
    }
  }

  if (lastError && !hadUnstructuredResponse) {
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
