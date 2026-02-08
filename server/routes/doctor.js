import express from "express";

import {
  getDoctorAppointments,
  getDoctorAppointmentStatistics,
  getDoctors,
  getDoctorsBySpecialty,
} from "../controllers/doctor.js";
import { verifyToken } from "../middleware/authVerification.js";

const router = express.Router();
router.get("/", getDoctors);
router.get("/specialty/:id", getDoctorsBySpecialty);
router.get("/appointment", verifyToken, getDoctorAppointments);
router.get("/statistics", getDoctorAppointmentStatistics);
export default router;
