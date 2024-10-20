import express from "express";
import {
  getDoctorAppointmentsForDate,
  getDoctors,
  getDoctorsBySpecialty,
} from "../controllers/doctor.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/specialty/:id", getDoctorsBySpecialty);
// router.get("/doctor/:doctorId/date/:date", getDoctorAppointmentsForDate);

export default router;
