import axios from "axios";
import dotenv from "dotenv";

import getAuthToken from "../temp1.js";
import { specializationMapping } from "../data/specilizationMapping.js";

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
    // const symptomsArray = symptoms ? JSON.parse(symptoms) : [];
    const symptomsArray = JSON.parse(symptoms);
    // const symptomsArray = Array.isArray(symptoms) ? symptoms : [];

    const response = await axios.get(
      `${PRIAID_API_URL}/diagnosis/specialisations`,
      {
        params: {
          token,
          symptoms: symptoms.length > 0 ? symptoms : ["29"],
          gender: gender || "male",
          year_of_birth: yearOfBirth || 1981,
          language: "en-gb",
        },
      }
    );
    console.log(response.data);

    const mappedSpecializations = response.data.map((spec) => ({
      ...spec,
      doctor: specializationMapping[spec.Name] || spec.Name, // Map to local name or use original
    }));
    console.log(mappedSpecializations);

    res.json(mappedSpecializations);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error fetching specializations:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

export const getAllSpecialties = async (req, res) => {
  console.log("got request");

  const token = getAuthToken();
  try {
    const response = await fetch(
      `${PRIAID_API_URL}/specialisations?token=${token}&language=en-gb`
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
