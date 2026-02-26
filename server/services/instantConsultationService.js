import {
  analyzeSymptomsWithAI,
  generateMedicalChatReply,
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
