import express from "express";
import {
  createReview,
  getReviewByAppointmentId,
  getReviewsByDoctor,
  getReviewsByUser,
} from "../controllers/review.js";
import { verifyToken } from "../middleware/authVerification.js";

const router = express.Router();

router.get("/:appointmentId", verifyToken, getReviewByAppointmentId);
router.post("/", verifyToken, createReview);
router.get("/doctor/:doctorId", verifyToken, getReviewsByDoctor);
router.get("/user/:userId", verifyToken, getReviewsByUser);

export default router;
