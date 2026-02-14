import express from "express";
import {
  getBodySublocations,
  getBodyLocations,
  getSymptoms,
  getSpecializations,
  getAllSpecialties,
} from "../controllers/findSpecialty.js";
import { validateRequest } from "../middleware/requestValidation.js";
import { findSpecialtySchemas } from "../validation/schemas.js";

const router = express.Router();

// Route to get all body locations
router.get(
  "/body-locations",
  validateRequest(findSpecialtySchemas.noInput),
  getBodyLocations
);

// Route to get sublocations for a given body location
router.get(
  "/body-locations/:locationId",
  validateRequest(findSpecialtySchemas.locationParam),
  getBodySublocations
);

// Route to get symptoms for a given location and status (man, woman, boy, girl)
router.get(
  "/symptoms/:locationId/:selectorStatus",
  validateRequest(findSpecialtySchemas.symptomsParams),
  getSymptoms
);

// Route to get specializations based on symptoms, gender, and birth year
router.get(
  "/specializations",
  validateRequest(findSpecialtySchemas.specializationsQuery),
  getSpecializations
);

router.get(
  "/all-specializations",
  validateRequest(findSpecialtySchemas.noInput),
  getAllSpecialties
);

export default router;
