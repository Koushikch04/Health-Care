import { HfInference } from "@huggingface/inference";
import { getCachedSpecialtyNames } from "./specialtyCatalogService.js";

const HF_MODEL =
  process.env.HF_TRIAGE_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

const hf = process.env.HF_API_KEY
  ? new HfInference(process.env.HF_API_KEY)
  : null;

const DEFAULT_DISCLAIMER =
  "This is informational only and not a diagnosis. If symptoms are severe or worsening, seek urgent medical care.";
const DEFAULT_SUGGESTED_FOLLOWUPS = [
  "What can I do at home right now to feel better?",
  "When should I seek urgent care for these symptoms?",
  "Should I book a doctor appointment now or monitor for a day?",
];
const SAFE_FOLLOWUP_POOL = [
  "What are the warning signs that mean I should not wait?",
  "Is it okay to monitor this at home for 24 hours?",
  "What over-the-counter options are usually used for this kind of symptom?",
  "Should I avoid any foods, activity, or medicine until I see a doctor?",
];
const FOLLOWUP_DIAGNOSIS_TERMS =
  /\b(diagnos(?:is|e|ed)|strep|pneumonia|bronchitis|tonsillitis|covid|flu|migraine|cancer|appendicitis)\b/i;
const FOLLOWUP_INTAKE_STYLE_PATTERNS = [
  /^have you\b/i,
  /^are you\b/i,
  /^did you\b/i,
  /^do you\b/i,
  /^can you\b/i,
  /^could you\b/i,
  /^how long have you\b/i,
  /^when did you\b/i,
];
const FOLLOWUP_USER_VOICE_PATTERNS = [
  /^what\b/i,
  /^when\b/i,
  /^should i\b/i,
  /^can i\b/i,
  /^is it okay\b/i,
  /^could i\b/i,
];

const HF_MODEL_FALLBACKS = [
  "mistralai/Mistral-7B-Instruct-v0.2",
  "Qwen/Qwen2.5-7B-Instruct",
];
const MAX_USER_TEXT_LENGTH = 1500;
const MAX_PROMPT_BLOCK_LENGTH = 12000;
const MAX_SPECIALTY_NAME_LENGTH = 120;
const DEFAULT_MAX_STREAM_REPLY_LENGTH = 6000;
const MAX_STREAM_REPLY_LENGTH = (() => {
  const configured = Number(process.env.HF_STREAM_MAX_REPLY_CHARS);
  if (!Number.isFinite(configured)) {
    return DEFAULT_MAX_STREAM_REPLY_LENGTH;
  }
  return Math.max(500, Math.min(Math.floor(configured), 20000));
})();

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  try {
    return value.normalize("NFKC");
  } catch (_error) {
    return value;
  }
};

const stripControlChars = (value) =>
  value
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, " ")
    .replace(/\r\n?/g, "\n");

const sanitizeUserText = (value, { maxLength = MAX_USER_TEXT_LENGTH } = {}) => {
  const normalized = stripControlChars(normalizeText(value))
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }
  return normalized.slice(0, maxLength);
};

const sanitizePromptBlock = (
  value,
  { maxLength = MAX_PROMPT_BLOCK_LENGTH } = {},
) => {
  const normalized = stripControlChars(normalizeText(value))
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!normalized) {
    return "";
  }
  return normalized.slice(0, maxLength);
};

const sanitizeSpecialtyName = (value) =>
  sanitizeUserText(value, { maxLength: MAX_SPECIALTY_NAME_LENGTH });

const truncateReply = (text, maxLength = MAX_STREAM_REPLY_LENGTH) => {
  if (typeof text !== "string") {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength);
};

const sanitizeHistory = (history = []) =>
  history
    .slice(-12)
    .map((entry) => {
      const role = entry?.role === "assistant" ? "assistant" : "user";
      const content = sanitizeUserText(entry?.text);
      if (!content) {
        return null;
      }
      return { role, text: content };
    })
    .filter(Boolean);

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

const normalizeSuggestedFollowups = (raw) => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const normalized = [];
  const used = new Set();

  for (const item of raw) {
    if (typeof item !== "string") {
      continue;
    }
    const text = item.replace(/\s+/g, " ").trim();
    if (!text) {
      continue;
    }
    const dedupeKey = text.toLowerCase();
    if (used.has(dedupeKey)) {
      continue;
    }
    used.add(dedupeKey);
    normalized.push(text);
    if (normalized.length >= 4) {
      break;
    }
  }

  return normalized;
};

const buildSafeSuggestedFollowups = (raw) => {
  const normalized = normalizeSuggestedFollowups(raw);
  const rewritten = normalized.map((item) => {
    if (/^how long have you been experiencing\b/i.test(item)) {
      return "When should I see a doctor if these symptoms continue?";
    }
    if (/^how long have you\b/i.test(item)) {
      return "How long is it usually safe to monitor this before seeing a doctor?";
    }
    return item;
  });
  const safe = rewritten.filter((item) => {
    if (FOLLOWUP_DIAGNOSIS_TERMS.test(item)) {
      return false;
    }
    if (item.length > 120 || !item.endsWith("?")) {
      return false;
    }
    if (FOLLOWUP_INTAKE_STYLE_PATTERNS.some((pattern) => pattern.test(item))) {
      return false;
    }
    return FOLLOWUP_USER_VOICE_PATTERNS.some((pattern) => pattern.test(item));
  });
  if (safe.length >= 2) {
    return safe.slice(0, 4);
  }

  const combined = [...safe];
  for (const item of SAFE_FOLLOWUP_POOL) {
    if (!combined.includes(item)) {
      combined.push(item);
    }
    if (combined.length >= 4) {
      break;
    }
  }
  return combined;
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
  sanitizeHistory(history)
    .map((entry) => {
      const role = entry.role === "assistant" ? "assistant" : "user";
      return { role, content: entry.text };
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
      (message, index) => `${message.role}(${index + 1}): ${message.content}`,
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
  const cooldownMs =
    status >= 500 ? PROVIDER_5XX_COOLDOWN_MS : MODEL_COOLDOWN_MS;

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

const extractStreamingToken = (chunk) => {
  const choice = chunk?.choices?.[0];
  if (!choice) {
    return "";
  }

  if (typeof choice?.delta?.content === "string") {
    return choice.delta.content;
  }
  if (typeof choice?.message?.content === "string") {
    return choice.message.content;
  }
  if (typeof choice?.text === "string") {
    return choice.text;
  }
  return "";
};

const streamHfText = async ({
  systemPrompt,
  userPrompt,
  history = [],
  onToken,
  signal,
}) => {
  if (!hf) {
    throw new Error("HF client unavailable");
  }

  const historyMessages = toChatMessages(history);
  const condensedPrompt = buildCondensedUserPrompt({
    systemPrompt: "",
    safeHistoryMessages: historyMessages,
    userPrompt,
  });
  const safeCondensedPrompt = sanitizePromptBlock(condensedPrompt);
  const allCandidateModels = getCandidateModels();
  const warmedModels = allCandidateModels.filter(
    (model) => !isModelCoolingDown(model),
  );
  const candidateModels =
    warmedModels.length > 0 ? warmedModels : allCandidateModels;
  let lastError = null;
  const maxAttemptsPerModel = 2;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt += 1) {
      try {
        const stream = hf.chatCompletionStream({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: safeCondensedPrompt },
          ],
          temperature: 0.2, //How much the model is allowed to take risks when picking the next word.
          max_tokens: 500, // The maximum number of words to generate in the completion.
          signal,
        });

        let reply = "";
        for await (const chunk of stream) {
          await sleep(200);
          if (signal?.aborted) {
            throw new Error("Request aborted");
          }
          const token = extractStreamingToken(chunk);
          if (!token) {
            continue;
          }
          const remaining = MAX_STREAM_REPLY_LENGTH - reply.length;
          if (remaining <= 0) {
            break;
          }
          const safeToken = token.slice(0, remaining);
          reply += safeToken;
          if (typeof onToken === "function") {
            onToken(safeToken);
          }
          if (safeToken.length < token.length) {
            break;
          }
        }

        if (reply.trim()) {
          markModelSuccess(model);
          return { reply: reply.trim(), model };
        }
      } catch (error) {
        lastError = error;
        const errorMessage = error?.message || "unknown error";
        const status = error?.httpResponse?.status;
        const body = error?.httpResponse?.body;
        console.warn(
          `HF chatCompletionStream failed (${model}, attempt ${attempt}): ${errorMessage}; status=${status}; body=${JSON.stringify(body)}`,
        );

        if (isModelNotSupportedError(error)) {
          markModelFailure(model, status);
          break;
        }
        if (status >= 500) {
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

  if (lastError) {
    throw lastError;
  }

  throw new Error("HF streaming response unavailable");
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
  const safeCondensedPrompt = sanitizePromptBlock(condensedPrompt);

  const allCandidateModels = getCandidateModels();
  const warmedModels = allCandidateModels.filter(
    (model) => !isModelCoolingDown(model),
  );
  const candidateModels =
    warmedModels.length > 0 ? warmedModels : allCandidateModels;
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
            { role: "user", content: safeCondensedPrompt },
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
    const sanitizedSymptoms = sanitizeUserText(userSymptoms);
    if (!sanitizedSymptoms) {
      return { recommended_specialties: [] };
    }

    const specialtyNames = (await getCachedSpecialtyNames())
      .map(sanitizeSpecialtyName)
      .filter(Boolean);
    const specialtyList = specialtyNames.join(", ");

    const parsed = await callHfJson({
      systemPrompt:
        "You are a cautious medical triage assistant. Return valid JSON only.",
      userPrompt: `
User symptoms: "${sanitizedSymptoms}"

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
      suggested_followups: DEFAULT_SUGGESTED_FOLLOWUPS,
      clinical_summary: "",
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  try {
    const sanitizedMessage = sanitizeUserText(message);
    const sanitizedHistory = sanitizeHistory(history);
    if (!sanitizedMessage) {
      return {
        reply: "Please describe your symptoms so I can help with triage.",
        recommended_specialties: [],
        suggested_followups: DEFAULT_SUGGESTED_FOLLOWUPS,
        clinical_summary: "",
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }

    const specialtyNames = (await getCachedSpecialtyNames())
      .map(sanitizeSpecialtyName)
      .filter(Boolean);
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
        7) Keep focus on symptom triage and next best follow-up questions.
        8) Do not provide or imply a diagnosis in reply or follow-up suggestions.
        9) suggested_followups must be written as user-to-assistant questions (first person), such as "What can I do now?".
        10) Never write clinician intake prompts in suggested_followups (avoid "Have you...", "Are you...", "Did you...").
        11) clinical_summary must be objective, clinical, and third-person (charting style).
        12) clinical_summary must only summarize facts explicitly provided by the user across current and prior user messages.
        13) Do not add diagnoses, probabilities, impressions, advice, or assumptions in clinical_summary.
        14) Start clinical_summary with "Patient reports..." and keep it concise.`,
      userPrompt: `
        Latest user message:
        ${sanitizedMessage}

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
          "suggested_followups": [
            "What can I do at home right now to reduce these symptoms?",
            "When should I seek urgent care for this?"
          ],
          "clinical_summary": "Patient reports ...",
          "disclaimer": "Short medical safety disclaimer"
        }

        If more details are needed, ask 1-2 follow-up questions and keep recommended_specialties empty.
        Before asking, check whether that detail is already present in prior user messages.
              `,
      history: sanitizedHistory,
      fallback: {
        reply:
          "Thanks for sharing. How long have you had these symptoms, and how severe are they right now?",
        recommended_specialties: [],
        suggested_followups: DEFAULT_SUGGESTED_FOLLOWUPS,
        clinical_summary: "",
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
    const normalizedFollowups = buildSafeSuggestedFollowups(
      parsed.suggested_followups,
    );
    const clinicalSummary =
      typeof parsed.clinical_summary === "string"
        ? parsed.clinical_summary.trim()
        : "";

    return {
      reply,
      recommended_specialties: inferredSpecialties,
      suggested_followups:
        normalizedFollowups.length > 0
          ? normalizedFollowups
          : DEFAULT_SUGGESTED_FOLLOWUPS,
      clinical_summary: clinicalSummary,
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
      suggested_followups: DEFAULT_SUGGESTED_FOLLOWUPS,
      clinical_summary: "",
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }
};

export const streamMedicalChatReply = async ({
  message,
  history = [],
  onToken,
  signal,
}) => {
  const sanitizedMessage = sanitizeUserText(message);
  const sanitizedHistory = sanitizeHistory(history);
  if (!sanitizedMessage) {
    return {
      reply: "Please describe your symptoms so I can help with triage.",
    };
  }

  const { reply } = await streamHfText({
    systemPrompt: `You are a healthcare triage assistant.
      Rules:
      1) Be concise, safe, and conversational.
      2) Never provide a definitive diagnosis.
      3) Use previous chat context as source of truth. Do not ignore prior user facts.
      4) Do not ask for information already provided unless there is a real contradiction.
      5) Keep focus on symptom triage and next best follow-up questions.
      6) Do not reveal JSON, code blocks, or internal formatting.
      7) Output only the assistant reply text in plain language.`,
    userPrompt: `
      Latest user message:
      ${sanitizedMessage}

      Write only a concise conversational reply to the user.
      If details are missing, ask 1-2 follow-up questions.
    `,
    history: sanitizedHistory,
    onToken,
    signal,
  });

  return { reply: truncateReply(reply) };
};

export const generateMedicalChatMetadata = async ({
  message,
  history = [],
  reply = "",
}) => {
  const sanitizedMessage = sanitizeUserText(message);
  const sanitizedHistory = sanitizeHistory(history);
  if (!sanitizedMessage) {
    return {
      recommended_specialties: [],
      suggested_followups: DEFAULT_SUGGESTED_FOLLOWUPS,
      clinical_summary: "",
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  try {
    const specialtyNames = (await getCachedSpecialtyNames())
      .map(sanitizeSpecialtyName)
      .filter(Boolean);
    const specialtyList = specialtyNames.join(", ");

    const parsed = await callHfJson({
      systemPrompt: `You are a healthcare triage metadata assistant.
        Rules:
        1) Never provide or imply diagnosis.
        2) suggested_followups must be user-to-assistant questions in first person.
        3) clinical_summary must be objective and start with "Patient reports...".
        4) Use only facts from user history, latest message, and assistant reply.`,
      userPrompt: `
        Latest user message:
        ${sanitizedMessage}

        Assistant reply already shown to user:
        ${sanitizePromptBlock(reply, { maxLength: 2500 })}

        Available specialties (choose only from this list):
        [${specialtyList}]

        Return valid JSON only:
        {
          "recommended_specialties": [
            {
              "specialty": "Exact name from list",
              "reason": "Why this specialty fits",
              "confidence": "High/Medium/Low"
            }
          ],
          "suggested_followups": [
            "What can I do at home right now to reduce these symptoms?",
            "When should I seek urgent care for this?"
          ],
          "clinical_summary": "Patient reports ...",
          "disclaimer": "Short medical safety disclaimer"
        }

        If uncertain, recommended_specialties can be empty.
      `,
      history: sanitizedHistory,
      fallback: {
        recommended_specialties: [],
        suggested_followups: DEFAULT_SUGGESTED_FOLLOWUPS,
        clinical_summary: "",
        disclaimer: DEFAULT_DISCLAIMER,
      },
    });

    const normalizedSpecialties = normalizeRecommendedSpecialties(
      parsed.recommended_specialties,
      specialtyNames,
    );
    const inferredSpecialties =
      normalizedSpecialties.length > 0
        ? normalizedSpecialties
        : inferSpecialtiesFromReply(reply, specialtyNames);

    return {
      recommended_specialties: inferredSpecialties,
      suggested_followups: buildSafeSuggestedFollowups(
        parsed.suggested_followups,
      ),
      clinical_summary:
        typeof parsed.clinical_summary === "string"
          ? parsed.clinical_summary.trim()
          : "",
      disclaimer:
        typeof parsed.disclaimer === "string" && parsed.disclaimer.trim()
          ? parsed.disclaimer.trim()
          : DEFAULT_DISCLAIMER,
    };
  } catch (error) {
    console.error("HF Metadata Error:", error);
    return {
      recommended_specialties: [],
      suggested_followups: DEFAULT_SUGGESTED_FOLLOWUPS,
      clinical_summary: "",
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }
};
