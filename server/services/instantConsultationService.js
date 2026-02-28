import {
  analyzeSymptomsWithAI,
  generateMedicalChatMetadata,
  generateMedicalChatReply,
  streamMedicalChatReply,
} from "./aiSpecialityService.js";

const toAccuracyScore = (confidence, { high = 90, medium = 75, low = 55 } = {}) => {
  if (confidence === "High") {
    return high;
  }
  if (confidence === "Low") {
    return low;
  }
  return medium;
};

const mapSpecialtyRecommendations = (recommendedSpecialties, scorePreset) =>
  (recommendedSpecialties || []).map((item) => ({
    Name: item.specialty,
    Accuracy: toAccuracyScore(item.confidence, scorePreset),
    Reason: item.reason,
  }));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DEFAULT_MAX_STREAM_REPLY_LENGTH = 6000;
const MAX_STREAM_REPLY_LENGTH = (() => {
  const configured = Number(process.env.HF_STREAM_MAX_REPLY_CHARS);
  if (!Number.isFinite(configured)) {
    return DEFAULT_MAX_STREAM_REPLY_LENGTH;
  }
  return Math.max(500, Math.min(Math.floor(configured), 20000));
})();

const truncateReply = (text) => {
  if (typeof text !== "string") {
    return "";
  }
  if (text.length <= MAX_STREAM_REPLY_LENGTH) {
    return text;
  }
  return text.slice(0, MAX_STREAM_REPLY_LENGTH);
};

const splitTextForStreaming = (text) => {
  if (typeof text !== "string" || !text.trim()) {
    return [];
  }
  const pieces = text.match(/.{1,24}(\s|$)/g);
  if (Array.isArray(pieces) && pieces.length > 0) {
    return pieces.map((part) => part);
  }
  return [text];
};

export const resolveSpecializationsFromSymptoms = async ({ symptoms }) => {
  const aiResult = await analyzeSymptomsWithAI(symptoms);
  return mapSpecialtyRecommendations(aiResult.recommended_specialties, {
    high: 90,
    medium: 70,
    low: 70,
  });
};

export const resolveConsultationChatResponse = async ({ message, history = [] }) => {
  const aiResult = await generateMedicalChatReply({ message, history });
  return {
    reply: aiResult.reply,
    ai_summary: aiResult.clinical_summary || "",
    disclaimer: aiResult.disclaimer,
    suggested_followups: Array.isArray(aiResult.suggested_followups)
      ? aiResult.suggested_followups
      : [],
    specializations: mapSpecialtyRecommendations(
      aiResult.recommended_specialties,
      {
        high: 90,
        medium: 75,
        low: 55,
      },
      ),
  };
};

export const resolveConsultationChatResponseStream = async ({
  message,
  history = [],
  onToken,
  signal,
}) => {
  let reply = "";
  let mode = "external_stream";

  try {
    const streamed = await streamMedicalChatReply({
      message,
      history,
      onToken,
      signal,
    });
    reply = streamed.reply;
  } catch (_streamError) {
    mode = "fallback_fake_stream";
    const fallbackResponse = await resolveConsultationChatResponse({
      message,
      history,
    });
    reply = truncateReply(fallbackResponse.reply);

    const chunks = splitTextForStreaming(reply);
    for (const chunk of chunks) {
      if (signal?.aborted) {
        break;
      }
      if (typeof onToken === "function") {
        onToken(chunk);
      }
      await sleep(20);
    }

    return {
      ...fallbackResponse,
      reply,
      mode,
    };
  }

  reply = truncateReply(reply);

  const metadata = await generateMedicalChatMetadata({
    message,
    history,
    reply,
  });
  return {
    reply,
    ai_summary: metadata.clinical_summary || "",
    disclaimer: metadata.disclaimer,
    suggested_followups: Array.isArray(metadata.suggested_followups)
      ? metadata.suggested_followups
      : [],
    specializations: mapSpecialtyRecommendations(
      metadata.recommended_specialties,
      {
        high: 90,
        medium: 75,
        low: 55,
      },
    ),
    mode,
  };
};
