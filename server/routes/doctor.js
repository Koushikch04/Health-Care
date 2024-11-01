import express from "express";

import {
  getDoctorAppointmentsForDate,
  getDoctors,
  getDoctorsBySpecialty,
  login,
} from "../controllers/doctor.js";

const router = express.Router();

router.post("/login", login);
router.get("/", getDoctors);
router.get("/specialty/:id", getDoctorsBySpecialty);
// router.get("/doctor/:doctorId/date/:date", getDoctorAppointmentsForDate);

export default router;
