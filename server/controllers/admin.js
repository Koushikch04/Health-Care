import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import Admin from "../models/Admin.js";
// import SupportTicket from "../models/"; // Assuming you have a SupportTicket model

// User Management Controllers

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); // Fetch all users
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit user profile
export const editUserProfile = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doctor Management Controllers

// View all doctors (assuming doctors are users with 'role: doctor')
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}); // Find all doctors
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject doctor registration
export const manageDoctorRegistration = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Status can be 'approved' or 'rejected'
  try {
    const doctor = await User.findByIdAndUpdate(
      id,
      { registrationStatus: status },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Appointment Management Controllers

// View all appointments
export const manageAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({}); // Fetch all appointments
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reschedule or cancel an appointment
export const rescheduleOrCancelAppointment = async (req, res) => {
  const { id } = req.params;
  const { status, newDate } = req.body; // 'status' can be 'cancelled', 'rescheduled'
  try {
    let appointment;
    if (status === "canceled") {
      appointment = await Appointment.findByIdAndUpdate(
        id,
        { status: "canceled" },
        { new: true }
      );
    } else if (status === "rescheduled") {
      appointment = await Appointment.findByIdAndUpdate(
        id,
        { date: newDate },
        { new: true }
      );
    }

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Analytics and Reports Controllers

// View reports (e.g., user and doctor statistics)
export const viewReports = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const reviewsCount = await Review.countDocuments();

    const report = {
      userCount,
      doctorCount,
      appointmentCount,
      reviewsCount,
    };

    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Support Ticket Management Controllers

// View all support tickets
// export const handleSupportTickets = async (req, res) => {
//   try {
//     const tickets = await SupportTicket.find({}); // Fetch all support tickets
//     res.status(200).json(tickets);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Respond to a support ticket
// export const respondToSupportTicket = async (req, res) => {
//   const { ticketId } = req.params;
//   const { response } = req.body;
//   try {
//     const ticket = await SupportTicket.findByIdAndUpdate(
//       ticketId,
//       { response },
//       { new: true }
//     );
//     if (!ticket) {
//       return res.status(404).json({ error: "Support ticket not found" });
//     }
//     res.status(200).json(ticket);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Remove a support ticket (close a ticket)
// export const closeSupportTicket = async (req, res) => {
//   const { ticketId } = req.params;
//   try {
//     const ticket = await SupportTicket.findByIdAndDelete(ticketId);
//     if (!ticket) {
//       return res.status(404).json({ error: "Support ticket not found" });
//     }
//     res.status(200).json({ message: "Support ticket closed successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create a JWT token for the admin
    const token = jwt.sign(
      { id: admin._id, role: admin.role, permissions: admin.permissions },
      process.env.JWT_SECRET, // Make sure you store your secret in an env variable
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Admin logged in successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
