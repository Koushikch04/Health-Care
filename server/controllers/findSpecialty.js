import axios from "axios";
import dotenv from "dotenv";

import getAuthToken from "../temp1.js";
import {
  analyzeSymptomsWithAI,
  generateMedicalChatReply,
} from "../services/aiSpecialityService.js";

dotenv.config();

const PRIAID_API_URL = "https://sandbox-healthservice.priaid.ch";
// const TOKEN = process.env.PRIAID_API_TOKEN;

// Function to retrieve body locations
export const getBodyLocations = async (req, res) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${PRIAID_API_URL}/body/locations`, {
      params: {
        token: token,
        language: "en-gb",
      },
    });
    res.json(response.data);
    console.log(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to retrieve body sublocations
export const getBodySublocations = async (req, res) => {
  const { locationId } = req.params;
  const token = await getAuthToken();

  try {
    const response = await axios.get(
      `${PRIAID_API_URL}/body/locations/${locationId}`,
      {
        params: {
          token: token,
          language: "en-gb",
        },
      },
    );
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.log(error.message);

    res.status(500).json({ error: error.message });
  }
};

// Function to retrieve symptoms based on body location
export const getSymptoms = async (req, res) => {
  const { locationId, selectorStatus } = req.params;
  const token = await getAuthToken();

  try {
    const response = await axios.get(
      `${PRIAID_API_URL}/symptoms/${locationId}/${selectorStatus}`,
      {
        params: {
          token: token,
          language: "en-gb",
        },
      },
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to retrieve specializations based on symptoms
export const getSpecializations = async (req, res) => {
  const { symptoms, gender, yearOfBirth } = req.query;
  console.log("Received symptoms:", symptoms, gender, yearOfBirth);

  if (!symptoms) {
    return res.status(400).json({ message: "Please describe your symptoms" });
  }

  try {
    // Call the AI Service
    const data = await analyzeSymptomsWithAI(symptoms);

    console.log("AI Service returned:", data);

    // The frontend expects a list, so we map the AI response to your frontend format
    const mappedResponse = data.recommended_specialties.map((item) => ({
      Name: item.specialty, // This matches your existing frontend logic
      Accuracy: item.confidence === "High" ? 90 : 70,
      Reason: item.reason,
    }));

    res.json(mappedResponse);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error fetching specializations:", errorMessage);
    res.status(500).json({ error: errorMessage });
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
    const data = await generateMedicalChatReply({
      message: message.trim(),
      history,
    });

    console.log("AI Chat Service returned:", data);

    const mappedSpecializations = data.recommended_specialties.map((item) => ({
      Name: item.specialty,
      Accuracy:
        item.confidence === "High" ? 90 : item.confidence === "Low" ? 55 : 75,
      Reason: item.reason,
    }));

    return res.json({
      reply: data.reply,
      disclaimer: data.disclaimer,
      specializations: mappedSpecializations,
    });
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error generating AI chat response:", errorMessage);
    return res.status(500).json({
      message: "Unable to process consultation right now.",
      error: errorMessage,
    });
  }
};

export const getAllSpecialties = async (req, res) => {
  console.log("got request");

  const token = await getAuthToken();
  try {
    const response = await fetch(
      `${PRIAID_API_URL}/specialisations?token=${token}&language=en-gb`,
    );
    // axios.get(`${PRIAID_API_URL}/specialisations`, {
    //   params: {
    //     token,
    //     language: "en-gb",
    //   },
    // });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error });

    // const errorMessage = error.response?.data || error.message;
    // console.error("Error fetching symptoms:", errorMessage);
  }
};
