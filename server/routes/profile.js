import express from "express";

import { updateProfile } from "../controllers/profile.js";
import { verifyToken } from "../middleware/authVerification.js";
import { validateRequest } from "../middleware/requestValidation.js";
import { uploadSingle } from "../middleware/upload.js";
import { profileSchemas } from "../validation/schemas.js";

const router = express.Router();
router.put(
  "/update",
  verifyToken,
  uploadSingle("profileImage"),
  validateRequest(profileSchemas.updateProfile),
  updateProfile
);

export default router;
