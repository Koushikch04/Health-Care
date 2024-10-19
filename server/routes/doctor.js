import express from "express";
import { getDoctors, getDoctorsBySpecialty } from "../controllers/doctor.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/specialty/:id", getDoctorsBySpecialty);

export default router;
