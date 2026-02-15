import express from "express";
import rateLimit from "express-rate-limit";

import { login, registerUser } from "../controllers/auth.js";
import {
  changePassword,
  validateAndOtpSender,
  validateOtp,
} from "../controllers/resetPassword.js";
import { verifyToken } from "../middleware/authVerification.js";
import { validateRequest } from "../middleware/requestValidation.js";
import { authSchemas } from "../validation/schemas.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failure",
    msg: "Too many requests from this IP, please try again later.",
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failure",
    msg: "Too many password reset requests from this IP, please try again later.",
  },
});

const router = express.Router();
router.post(
  "/register/user",
  authLimiter,
  validateRequest(authSchemas.registerUser),
  registerUser
);
router.post("/login", authLimiter, validateRequest(authSchemas.login), login);
router.post(
  "/forgotPassword",
  passwordResetLimiter,
  validateRequest(authSchemas.forgotPassword),
  validateAndOtpSender
);
router.post(
  "/validateOtp",
  passwordResetLimiter,
  validateRequest(authSchemas.validateOtp),
  validateOtp
);
router.put(
  "/changePassword",
  verifyToken,
  validateRequest(authSchemas.changePassword),
  changePassword
);
// router.put("/resetPassword", resetPassword);

export default router;
