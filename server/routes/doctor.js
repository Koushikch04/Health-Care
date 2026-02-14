import express from "express";

import {
  getDoctorAppointments,
  getDoctorAppointmentStatistics,
  getDoctors,
  getDoctorsBySpecialty,
} from "../controllers/doctor.js";
import { verifyToken } from "../middleware/authVerification.js";
import { validateRequest } from "../middleware/requestValidation.js";
import { doctorSchemas } from "../validation/schemas.js";

const router = express.Router();
router.get("/", validateRequest(doctorSchemas.noInput), getDoctors);
router.get(
  "/specialty/:id",
  validateRequest(doctorSchemas.getDoctorsBySpecialty),
  getDoctorsBySpecialty
);
router.get(
  "/appointment",
  verifyToken,
  validateRequest(doctorSchemas.getDoctorAppointments),
  getDoctorAppointments
);
router.get(
  "/statistics",
  verifyToken,
  validateRequest(doctorSchemas.getDoctorAppointmentStatistics),
  getDoctorAppointmentStatistics
);
export default router;
