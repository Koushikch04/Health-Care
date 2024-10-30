import axios from "axios";
import dotenv from "dotenv";
import getAuthToken from "../temp1.js";

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
      }
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
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to retrieve specializations based on symptoms
export const getSpecializations = async (req, res) => {
  const { symptoms, gender, yearOfBirth } = req.query;
  const token = await getAuthToken();

  try {
    console.log("Received symptoms:", symptoms);
    const symptomsArray = symptoms ? JSON.parse(symptoms) : [];
    console.log("Symptoms array length:", symptomsArray.length);

    const response = await axios.get(
      `${PRIAID_API_URL}/diagnosis/specialisations`,
      {
        params: {
          token,
          symptoms: symptomsArray.length > 0 ? symptomsArray : [], // Send the symptoms array directly
          gender: gender || "male",
          year_of_birth: yearOfBirth || 1981,
          language: "en-gb",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error fetching specializations:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};
