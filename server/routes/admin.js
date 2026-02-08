import express from "express";
import {
  getAllUsers,
  editUserProfile,
  deleteUser,
  manageAppointments,
  viewReports,
  getAllDoctors,
  manageDoctorRegistration,
  rescheduleOrCancelAppointment,
  getTopPerformingDoctors,
  createUser,
  createAdmin,
  getAdmins,
  updateAdminPermissions,
  deleteAdmin,
  // handleSupportTickets,
} from "../controllers/admin.js";
import {
  isAdmin,
  authorizeAdmin,
  verifySuperAdmin,
} from "../middleware/authVerification.js";
import {
  createDoctor,
  deleteDoctor,
  updateDoctor,
} from "../controllers/doctor.js";

const router = express.Router();
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

router.post(
  "/doctor",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  createDoctor
);
router.put(
  "/doctor/:id",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  updateDoctor
);
router.delete(
  "/doctor/:id",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  deleteDoctor
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

router.post("/create", isAdmin, verifySuperAdmin, createAdmin);

router.get("/", isAdmin, verifySuperAdmin, getAdmins);

router.delete("/delete/:id", isAdmin, verifySuperAdmin, deleteAdmin);

router.put(
  "/:id/permissions",
  isAdmin,
  verifySuperAdmin,
  updateAdminPermissions
);

export default router;
