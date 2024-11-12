import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";

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
    const users = await User.aggregate([
      {
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "user",
          as: "appointments",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          dob: 1,
          gender: 1,
          profileImage: 1,
          contact: 1,
          appointmentCount: { $size: "$appointments" },
        },
      },
    ]);

    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    console.log(req.body);

    const { firstName, lastName, email, password, gender, dob, phone } =
      req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name: { firstName, lastName },
      contact: { phone },
      email,
      password: hashedPassword,
      gender,
      dob,
    });

    await newUser.save();

    res.status(201).json({
      newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Edit user profile
export const editUserProfile = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, gender, dob } = req.body;
  const toUpdate = {
    name: {
      firstName,
      lastName,
    },
    email,
    gender,
    dob,
  };

  try {
    const user = await User.findByIdAndUpdate(id, toUpdate, { new: true });
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
    // Step 1: Fetch all doctors with populated specialty name
    const doctors = await Doctor.find()
      .populate("specialty", "name") // Populate only the `name` field of the specialty
      .lean(); // Use .lean() to return plain JavaScript objects

    // Step 2: For each doctor, get the appointment count
    const doctorsWithCounts = await Promise.all(
      doctors.map(async (doctor) => {
        const appointmentCount = await Appointment.countDocuments({
          doctor: doctor._id,
        });
        return {
          ...doctor,
          appointmentCount,
          specialization: doctor.specialty.name,
        };
      })
    );

    res.status(200).json({ doctors: doctorsWithCounts });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Failed to fetch doctors" });
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
  const { filter, date } = req.query; // Allow specific date input if desired

  try {
    if (!filter) {
      // If no filter is provided, return all appointments
      const appointments = await Appointment.find({});
      return res.status(200).json(appointments);
    }

    // If a filter is provided, proceed with date filtering and aggregation
    const referenceDate = date ? new Date(date) : new Date();

    let startDate, endDate, groupingFormat, responseMapper;

    switch (filter) {
      case "week": {
        startDate = moment(referenceDate).startOf("week");
        endDate = moment(referenceDate).endOf("week");
        groupingFormat = "%Y-%m-%d";

        responseMapper = (data) => {
          const days = [];
          for (
            let m = moment(startDate);
            m.isSameOrBefore(endDate);
            m.add(1, "days")
          ) {
            const dateStr = m.format("YYYY-MM-DD");
            const found = data.find((d) => d._id === dateStr);
            days.push({
              date: dateStr,
              dayName: m.format("dddd"),
              total: found?.total || 0,
              scheduled: found?.scheduled || 0,
              canceled: found?.canceled || 0,
              completed: found?.completed || 0,
            });
          }
          return days;
        };
        break;
      }

      case "month": {
        startDate = moment(referenceDate).startOf("month");
        endDate = moment(referenceDate).endOf("month");
        groupingFormat = "%Y-%m-%d";

        responseMapper = (data) => {
          const days = [];
          for (
            let m = moment(startDate);
            m.isSameOrBefore(endDate);
            m.add(1, "days")
          ) {
            const dateStr = m.format("YYYY-MM-DD");
            const found = data.find((d) => d._id === dateStr);
            days.push({
              date: dateStr,
              dayName: m.format("dddd"),
              weekOfMonth: m.week() - moment(startDate).week() + 1,
              total: found?.total || 0,
              scheduled: found?.scheduled || 0,
              canceled: found?.canceled || 0,
              completed: found?.completed || 0,
            });
          }
          return days;
        };
        break;
      }

      case "year": {
        startDate = moment(referenceDate).startOf("year");
        endDate = moment(referenceDate).endOf("year");
        groupingFormat = "%Y-%m";

        responseMapper = (data) => {
          const months = [];
          for (
            let m = moment(startDate);
            m.isSameOrBefore(endDate);
            m.add(1, "month")
          ) {
            const monthStr = m.format("YYYY-MM");
            const found = data.find((d) => d._id === monthStr);
            months.push({
              month: monthStr,
              monthName: m.format("MMMM"),
              total: found?.total || 0,
              scheduled: found?.scheduled || 0,
              canceled: found?.canceled || 0,
              completed: found?.completed || 0,
            });
          }
          return months;
        };
        break;
      }

      default:
        return res.status(400).json({
          message: "Invalid filter parameter. Use 'week', 'month', or 'year'",
        });
    }

    // MongoDB aggregation pipeline
    const data = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupingFormat, date: "$date" } },
          total: { $sum: 1 },
          scheduled: {
            $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
          },
          canceled: {
            $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Generate response with mapped data
    const result = {
      filter,
      period: {
        start: startDate.format("YYYY-MM-DD"),
        end: endDate.format("YYYY-MM-DD"),
      },
      data: responseMapper(data),
      summary: {
        total: data.reduce((sum, item) => sum + item.total, 0),
        scheduled: data.reduce((sum, item) => sum + item.scheduled, 0),
        canceled: data.reduce((sum, item) => sum + item.canceled, 0),
        completed: data.reduce((sum, item) => sum + item.completed, 0),
      },
    };

    res.json(result);
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message || "Unknown error",
    });
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
  console.log("got request");

  try {
    const userCount = await User.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const reviewsCount = await Review.countDocuments();
    const revenue = 1000;

    const report = {
      userCount,
      doctorCount,
      appointmentCount,
      revenue,
      // reviewsCount,
    };

    res.status(200).json({
      success: true,
      data: report,
    });
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
export const login = async (req, res) => {
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
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    res.status(200).json({
      person: admin,
      token,
      expiresAt,
      role: "admin",
      message: "Admin logged in successfully",
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const ratingWeight = 0.7;
const appointmentWeight = 0.3;

export const getTopPerformingDoctors = async (req, res) => {
  try {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1); // Define "recent" as the past month

    // Fetch doctors with their recent appointment counts
    const doctors = await Doctor.find()
      .select("name specialty rating cost image")
      .populate("specialty", "name");

    const doctorPerformances = await Promise.all(
      doctors.map(async (doctor) => {
        // Count recent appointments for each doctor within the last month
        const recentAppointmentsCount = await Appointment.countDocuments({
          doctor: doctor._id,
          date: { $gte: oneMonthAgo },
          status: "completed", // Only count completed appointments
        });

        // Calculate performance score based on rating and recent appointments
        const performanceScore =
          doctor.rating * ratingWeight +
          recentAppointmentsCount * appointmentWeight;

        return {
          doctor,
          performanceScore,
          recentAppointmentsCount,
        };
      })
    );

    // Sort by performanceScore in descending order and take top 5
    const topDoctors = doctorPerformances
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5)
      .map(({ doctor, performanceScore, recentAppointmentsCount }) => ({
        ...doctor.toObject(),
        performanceScore,
        recentAppointmentsCount,
      }));

    res.status(200).json(topDoctors);
  } catch (error) {
    console.error("Error fetching top performing doctors:", error);
    res.status(500).json({ message: "Error fetching top performing doctors" });
  }
};

export const createAdmin = async (req, res) => {
  const { firstName, lastName, email, password, permissions } = req.body;

  try {
    // Check if an admin with this email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      name: { firstName, lastName },
      email,
      password: hashedPassword,
      role: "admin",
      permissions,
    });

    await newAdmin.save();
    res
      .status(201)
      .json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating admin", error: error.message });
  }
};

// Controller to get all admins (superadmin access only)
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: "admin" });
    res.json({ admins });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// Controller to update an admin's permissions (superadmin access only)
export const updateAdminPermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update the permissions
    admin.permissions = permissions;
    await admin.save();

    res.json({ message: "Permissions updated successfully", admin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating permissions", error: error.message });
  }
};
