import express from "express";

import { updateProfile } from "../controllers/profile.js";
import { verifyToken } from "../middleware/authVerification.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();
router.put("/update", verifyToken, uploadSingle("profileImage"), updateProfile);

export default router;
