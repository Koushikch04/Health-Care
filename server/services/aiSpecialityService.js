import { HfInference } from "@huggingface/inference";
import Specialty from "../models/Specialty.js";

const HF_MODEL =
  process.env.HF_TRIAGE_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

const hf = process.env.HF_API_KEY ? new HfInference(process.env.HF_API_KEY) : null;

const DEFAULT_DISCLAIMER =
  "This is informational only and not a diagnosis. If symptoms are severe or worsening, seek urgent medical care.";

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

const callHfJson = async ({ systemPrompt, userPrompt, fallback }) => {
  if (!hf) {
    return fallback;
  }

  const response = await hf.chatCompletion({
    model: HF_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 900,
  });

  const content = response?.choices?.[0]?.message?.content || "";
  return safeJsonParse(content, fallback);
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

    const trimmedHistory = Array.isArray(history) ? history.slice(-8) : [];
    const formattedHistory = trimmedHistory
      .map((entry) => {
        const role = entry?.role === "assistant" ? "assistant" : "user";
        const text = typeof entry?.text === "string" ? entry.text.trim() : "";
        if (!text) {
          return null;
        }
        return `${role}: ${text}`;
      })
      .filter(Boolean)
      .join("\n");

    const parsed = await callHfJson({
      systemPrompt:
        "You are a healthcare triage assistant. Be concise, safe, and conversational. Never provide a definitive diagnosis.",
      userPrompt: `
Conversation history:
${formattedHistory || "No prior messages"}

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
      `,
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

    return {
      reply,
      recommended_specialties: normalizeRecommendedSpecialties(
        parsed.recommended_specialties,
        specialtyNames,
      ),
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
