import express from "express";
import {
  createReview,
  getReviewByAppointmentId,
  getReviewsByDoctor,
  getReviewsByUser,
} from "../controllers/review.js";
import { verifyToken } from "../middleware/authVerification.js";
import { validateRequest } from "../middleware/requestValidation.js";
import { reviewSchemas } from "../validation/schemas.js";

const router = express.Router();

router.get(
  "/:appointmentId",
  verifyToken,
  validateRequest(reviewSchemas.appointmentReviewParam),
  getReviewByAppointmentId
);
router.post(
  "/",
  verifyToken,
  validateRequest(reviewSchemas.createReview),
  createReview
);
router.get(
  "/doctor/:doctorId",
  verifyToken,
  validateRequest(reviewSchemas.doctorReviewParam),
  getReviewsByDoctor
);
router.get(
  "/user/:userId",
  verifyToken,
  validateRequest(reviewSchemas.userReviewParam),
  getReviewsByUser
);

export default router;
