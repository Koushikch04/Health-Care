import express from "express";
import {
  getAllSpecialties,
  getSpecialityDetails,
} from "../controllers/specialty.js";

const router = express.Router();

router.get("/", getAllSpecialties);
router.get("/details", getSpecialityDetails);
export default router;
