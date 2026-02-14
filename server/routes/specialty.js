import express from "express";
import {
  getAllSpecialties,
  getSpecialityDetails,
} from "../controllers/specialty.js";
import { validateRequest } from "../middleware/requestValidation.js";
import { specialtySchemas } from "../validation/schemas.js";

const router = express.Router();

router.get("/", validateRequest(specialtySchemas.noInput), getAllSpecialties);
router.get(
  "/details",
  validateRequest(specialtySchemas.noInput),
  getSpecialityDetails
);
export default router;
