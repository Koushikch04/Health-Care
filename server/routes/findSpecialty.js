import express from "express";
import {
  getBodySublocations,
  getBodyLocations,
  getSymptoms,
  getSpecializations,
  getAllSpecialties,
} from "../controllers/findSpecialty.js";

const router = express.Router();

// Route to get all body locations
router.get("/body-locations", getBodyLocations);

// Route to get sublocations for a given body location
router.get("/body-locations/:locationId", getBodySublocations);

// Route to get symptoms for a given location and status (man, woman, boy, girl)
router.get("/symptoms/:locationId/:selectorStatus", getSymptoms);

// Route to get specializations based on symptoms, gender, and birth year
router.get("/specializations", getSpecializations);

router.get("/all-specializations", getAllSpecialties);

export default router;
