import {
  resolveConsultationChatResponse,
  resolveSpecializationsFromSymptoms,
} from "../services/instantConsultationService.js";

export const getSpecializations = async (req, res) => {
  const { symptoms, gender, yearOfBirth } = req.query;
  console.log("Received symptoms:", symptoms, gender, yearOfBirth);

  if (!symptoms) {
    return res.status(400).json({ message: "Please describe your symptoms" });
  }

  try {
    const mappedResponse = await resolveSpecializationsFromSymptoms({
      symptoms,
    });
    return res.json(mappedResponse);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error fetching specializations:", errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
};

export const chatConsultation = async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  console.log("Received chat message:", message);
  console.log("Chat history:", history);

  try {
    const response = await resolveConsultationChatResponse({
      message: message.trim(),
      history,
    });
    return res.json(response);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error generating AI chat response:", errorMessage);
    return res.status(500).json({
      message: "Unable to process consultation right now.",
      error: errorMessage,
    });
  }
};
