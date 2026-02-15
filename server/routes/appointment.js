import express from "express";
import rateLimit from "express-rate-limit";

import {
  cancelAppointment,
  createAppointment,
  getAppointmentDetails,
  getAvailableTimeSlots,
  getDoctorAppointments,
  getUserAppointments,
} from "../controllers/appointment.js";
import { verifyToken } from "../middleware/authVerification.js";
import { validateRequest } from "../middleware/requestValidation.js";
import { appointmentSchemas } from "../validation/schemas.js";

const router = express.Router();
const appointmentLimiter = rateLimit({
  windowMs:
    Number(process.env.APPOINTMENT_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.APPOINTMENT_RATE_LIMIT_MAX) || 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failure",
    msg: "Too many appointment requests from this IP, please try again later.",
  },
});

router.post(
  "/",
  appointmentLimiter,
  verifyToken,
  validateRequest(appointmentSchemas.createAppointment),
  createAppointment
);
router.get(
  "/",
  appointmentLimiter,
  verifyToken,
  validateRequest(appointmentSchemas.getUserAppointments),
  getUserAppointments
);
router.get(
  "/available-slots/doctor/:doctorId/date/:date",
  appointmentLimiter,
  verifyToken,
  validateRequest(appointmentSchemas.getAvailableTimeSlots),
  getAvailableTimeSlots
);
router.get(
  "/:appointmentId",
  verifyToken,
  validateRequest(appointmentSchemas.appointmentIdParam),
  getAppointmentDetails
);
router.delete(
  "/:appointmentId",
  appointmentLimiter,
  verifyToken,
  validateRequest(appointmentSchemas.appointmentIdParam),
  cancelAppointment
);
router.get(
  "/doctor/:doctorId",
  appointmentLimiter,
  validateRequest(appointmentSchemas.doctorAppointmentsByDoctorId),
  getDoctorAppointments
);
export default router;
