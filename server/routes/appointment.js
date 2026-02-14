import express from "express";

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

router.post(
  "/",
  verifyToken,
  validateRequest(appointmentSchemas.createAppointment),
  createAppointment
);
router.get(
  "/",
  verifyToken,
  validateRequest(appointmentSchemas.getUserAppointments),
  getUserAppointments
);
router.get(
  "/available-slots/doctor/:doctorId/date/:date",
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
  verifyToken,
  validateRequest(appointmentSchemas.appointmentIdParam),
  cancelAppointment
);
router.get(
  "/doctor/:doctorId",
  validateRequest(appointmentSchemas.doctorAppointmentsByDoctorId),
  getDoctorAppointments
);
export default router;
