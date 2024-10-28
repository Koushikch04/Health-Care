import express from "express";

import {
  cancelAppointment,
  createAppointment,
  getAppointmentDetails,
  getAvailableTimeSlots,
  getUserAppointments,
} from "../controllers/appointment.js";
import { verifyToken } from "../middleware/authVerification.js";

const router = express.Router();

router.post("/", verifyToken, createAppointment);
router.get("/", verifyToken, getUserAppointments);
router.get(
  "/available-slots/doctor/:doctorId/date/:date",
  verifyToken,
  getAvailableTimeSlots
);
router.get("/:appointmentId", verifyToken, getAppointmentDetails);
router.delete("/:appointmentId", verifyToken, cancelAppointment);

export default router;
