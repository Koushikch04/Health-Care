import express from "express";

import {
  createAppointment,
  getUserAppointments,
} from "../controllers/appointment";
import { verifyToken } from "../middleware/authVerification";

const router = express.Router();

router.post("/", verifyToken, createAppointment);
router.get("/", verifyToken, getUserAppointments);

export default router;
