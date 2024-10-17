import express from "express";
import rateLimit from "express-rate-limit";

import { login, registerUser } from "../controllers/auth.js";
import {
  changePassword,
  validateAndOtpSender,
  validateOtp,
} from "../controllers/resetPassword.js";
import { verifyToken } from "../middleware/authVerification.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    status: "failure",
    message: "Too many requests from this IP, please try again later.",
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: "failure",
    message:
      "Too many password reset requests from this IP, please try again later.",
  },
});
