import express from "express";
import { login, registerUser } from "../controllers/auth.js";
import {
  changePassword,
  validateAndOtpSender,
  validateOtp,
} from "../controllers/resetPassword.js";
import { verifyToken } from "../middleware/authVerification.js";

const router = express.Router();
router.post("/register/user", registerUser);
router.post("/login", login);
router.post("/forgotPassword", validateAndOtpSender);
router.post("/validateOtp", validateOtp);
router.put("/changePassword", verifyToken, changePassword);
// router.put("/resetPassword", resetPassword);

export default router;
