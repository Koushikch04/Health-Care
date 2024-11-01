import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.PRIAD_API_KEY;
const secretKey = process.env.PRIAD_API_SECRET;
const authUrl = "https://sandbox-authservice.priaid.ch/login";

async function getAuthToken() {
  const uri = authUrl;
  const hmac = crypto.createHmac("md5", secretKey);
  const computedHash = hmac.update(uri).digest("base64");

  const headers = {
    Authorization: `Bearer ${apiKey}:${computedHash}`,
  };

  try {
    const response = await axios.post(uri, null, { headers });
    return response.data.Token; // The access token
  } catch (error) {
    console.error("Error obtaining token:", error.response);
    throw error; // Handle error as needed
  }
}

async function getSymptoms() {
  const token = await getAuthToken();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  //Symptoms can be either called to receive the full list of symptoms or a subset of symptoms
  //   const symptomsUrl = `https://sandbox-healthservice.priaid.ch/symptoms?token=${token}&symptoms=[179]&language=en-gb&gender=male&year_of_birth=1981`;

  // to compute the potential health issues based on a set of symptoms, gender and age.
  //   const symptomsUrl = `https://sandbox-healthservice.priaid.ch/diagnosis?token=${token}&symptoms=[179]&language=en-gb&gender=male&year_of_birth=1981`;

  //   const symptomsUrl = `https://sandbox-healthservice.priaid.ch/diagnosis/specialisations?token=${token}&symptoms=[179]&language=en-gb&gender=male&year_of_birth=1981`;
  //   const symptomsUrl = `https://sandbox-healthservice.priaid.ch/diagnosis/specialisations?token=${token}&symptoms=[179]&language=en-gb&gender=male&year_of_birth=1981`;
  //   const symptomsUrl = `https://sandbox-healthservice.priaid.ch/diagnosis/specialisations?token=${token}&symptoms=[179]&language=en-gb&gender=male&year_of_birth=1981`;
  const symptomsUrl = `https://sandbox-healthservice.priaid.ch/diagnosis/specialisations?token=${token}&symptoms=[179]&language=en-gb&gender=male&year_of_birth=1981`;

  //   const symptomsUrl = `https://sandbox-healthservice.priaid.ch/body/locations/16?token=${token}&language=en-gb`;
  // const symptomsUrl = `	https://sandbox-healthservice.priaid.ch/symptoms/16/man?token=${token}&language=en-gb`;
  try {
    const response = await axios.get(symptomsUrl, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching symptoms:", error.response);
    throw error;
  }
}

// console.log(await getSymptoms());

// console.log(await getAuthToken());

export default getAuthToken;
