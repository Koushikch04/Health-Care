import express from "express";

import {
  createAppointment,
  getUserAppointments,
} from "../controllers/appointment.js";
import { verifyToken } from "../middleware/authVerification.js";

const router = express.Router();

router.post("/", verifyToken, createAppointment);
router.get("/", verifyToken, getUserAppointments);

export default router;
