import express from "express";
import {
  getAllUsers,
  editUserProfile,
  deleteUser,
  manageAppointments,
  viewReports,
  login,
  getAllDoctors,
  manageDoctorRegistration,
  rescheduleOrCancelAppointment,
  getTopPerformingDoctors,
  createUser,
  // handleSupportTickets,
} from "../controllers/admin.js";
import { isAdmin, authorizeAdmin } from "../middleware/authVerification.js";

const router = express.Router();

router.post("/login", login);
router.post("/user", isAdmin, authorizeAdmin("userManagement"), createUser);
router.get("/users", isAdmin, authorizeAdmin("userManagement"), getAllUsers);
router.put(
  "/user/:id",
  isAdmin,
  authorizeAdmin("userManagement"),
  editUserProfile
);
router.delete(
  "/user/:id",
  isAdmin,
  authorizeAdmin("userManagement"),
  deleteUser
);

// Doctor management routes
router.get(
  "/doctors",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  getAllDoctors
);
router.put(
  "/doctor/:id/registration",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  manageDoctorRegistration
);

// Appointment management routes
router.get(
  "/appointments",
  isAdmin,
  authorizeAdmin("appointmentManagement"),
  manageAppointments
);
router.put(
  "/appointment/:id",
  isAdmin,
  authorizeAdmin("appointmentManagement"),
  rescheduleOrCancelAppointment
);

router.get("/analytics", isAdmin, authorizeAdmin("analytics"), viewReports);

router.get("/top-doctors", isAdmin, getTopPerformingDoctors);

// router.get(
//   "/support",
//   isAdmin,
//   authorizeAdmin("support"),
//   handleSupportTickets
// );

export default router;
