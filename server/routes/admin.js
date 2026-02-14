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
import { validateRequest } from "../middleware/requestValidation.js";
import {
  createDoctor,
  deleteDoctor,
  updateDoctor,
} from "../controllers/doctor.js";
import { adminSchemas, doctorSchemas } from "../validation/schemas.js";

const router = express.Router();
router.post(
  "/user",
  isAdmin,
  authorizeAdmin("userManagement"),
  validateRequest(adminSchemas.createUser),
  createUser
);
router.get(
  "/users",
  isAdmin,
  authorizeAdmin("userManagement"),
  validateRequest(adminSchemas.noInput),
  getAllUsers
);
router.put(
  "/user/:id",
  isAdmin,
  authorizeAdmin("userManagement"),
  validateRequest(adminSchemas.editUserProfile),
  editUserProfile
);
router.delete(
  "/user/:id",
  isAdmin,
  authorizeAdmin("userManagement"),
  validateRequest(adminSchemas.userIdParam),
  deleteUser
);

// Doctor management routes
router.get(
  "/doctors",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  validateRequest(adminSchemas.noInput),
  getAllDoctors
);
router.put(
  "/doctor/:id/registration",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  validateRequest(adminSchemas.manageDoctorRegistration),
  manageDoctorRegistration
);

router.post(
  "/doctor",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  validateRequest(doctorSchemas.createDoctor),
  createDoctor
);
router.put(
  "/doctor/:id",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  validateRequest(doctorSchemas.updateDoctor),
  updateDoctor
);
router.delete(
  "/doctor/:id",
  isAdmin,
  authorizeAdmin("doctorManagement"),
  validateRequest(doctorSchemas.doctorIdParam),
  deleteDoctor
);

// Appointment management routes
router.get(
  "/appointments",
  isAdmin,
  authorizeAdmin("appointmentManagement"),
  validateRequest(adminSchemas.manageAppointments),
  manageAppointments
);
router.put(
  "/appointment/:id",
  isAdmin,
  authorizeAdmin("appointmentManagement"),
  validateRequest(adminSchemas.rescheduleOrCancelAppointment),
  rescheduleOrCancelAppointment
);

router.get(
  "/analytics",
  isAdmin,
  authorizeAdmin("analytics"),
  validateRequest(adminSchemas.noInput),
  viewReports
);

router.get(
  "/top-doctors",
  isAdmin,
  authorizeAdmin("analytics"),
  validateRequest(adminSchemas.noInput),
  getTopPerformingDoctors
);

// router.get(
//   "/support",
//   isAdmin,
//   authorizeAdmin("support"),
//   handleSupportTickets
// );

router.post(
  "/create",
  isAdmin,
  verifySuperAdmin,
  validateRequest(adminSchemas.createAdmin),
  createAdmin
);

router.get(
  "/",
  isAdmin,
  verifySuperAdmin,
  validateRequest(adminSchemas.noInput),
  getAdmins
);

router.delete(
  "/delete/:id",
  isAdmin,
  verifySuperAdmin,
  validateRequest(adminSchemas.userIdParam),
  deleteAdmin
);

router.put(
  "/:id/permissions",
  isAdmin,
  verifySuperAdmin,
  validateRequest(adminSchemas.updateAdminPermissions),
  updateAdminPermissions
);

export default router;
