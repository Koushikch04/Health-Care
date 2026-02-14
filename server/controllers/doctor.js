import bcrypt from "bcrypt";
import mongoose from "mongoose";

import Appointment from "../models/Appointment.js";
import Account from "../models/Account.js";
import DoctorProfile from "../models/DoctorProfile.js";
import Specialty from "../models/Specialty.js";
import { getUtcDayBounds } from "../utils/date.js";

//Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find().populate("specialty");
    const response = doctors.map((doctor) => ({
      ...doctor.toObject(),
      rating: doctor.rating?.average ?? 0,
    }));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving doctors", error });
  }
};

// Get doctors by specialty
export const getDoctorsBySpecialty = async (req, res) => {
  const specialtyId = req.params.id;

  try {
    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }

    const doctors = await DoctorProfile.find({
      specialty: specialtyId,
    }).populate(
      "specialty"
    );
    const response = doctors.map((doctor) => ({
      ...doctor.toObject(),
      rating: doctor.rating?.average ?? 0,
    }));
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving doctors by specialty", error });
  }
};

// Create a new doctor (optional, add if needed)
export const createDoctor = async (req, res) => {
  console.log(req.body);

  const {
    firstName,
    lastName,
    gender,
    email,
    experience,
    rating,
    profile,
    cost,
    specialty,
    image,
    phone,
    password,
  } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingAccount = await Account.findOne({
      email: email.toLowerCase(),
    });
    if (existingAccount) {
      return res
        .status(400)
        .json({ message: "Doctor with this email already exists." });
    }
    const account = await Account.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      roles: ["doctor"],
    });

    const newDoctor = new DoctorProfile({
      accountId: account._id,
      name: { firstName, lastName },
      gender,
      phone: Number(phone),
      experience: Number(experience),
      biography: profile,
      cost: Number(cost),
      specialty: new mongoose.Types.ObjectId(specialty),
      image,
    });

    const savedDoctor = await newDoctor.save();

    res.status(201).json(savedDoctor);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error creating doctor", error });
  }
};

export const getDoctorAppointments = async (req, res) => {
  const { date } = req.query;

  try {
    const query = { doctor: req.user.profileId };

    if (date) {
      const dayBounds = getUtcDayBounds(date);
      if (!dayBounds) {
        return res.status(400).json({ message: "Invalid date." });
      }
      query.date = { $gte: dayBounds.start, $lte: dayBounds.end };
    }

    const appointments = await Appointment.find(query);

    // console.log(appointments);

    return res.status(200).json(appointments);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving appointments", error });
  }
};

// Update a doctor's information (optional, add if needed)
export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, gender } = req.body;
  const toUpdate = {
    name: {
      firstName,
      lastName,
    },
    email,
  };

  try {
    const updatedDoctor = await DoctorProfile.findByIdAndUpdate(id, toUpdate, {
      new: true,
    });
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (email) {
      await Account.findByIdAndUpdate(updatedDoctor.accountId, {
        email: email.toLowerCase(),
      });
    }
    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error updating doctor", error });
  }
};

// Delete a doctor (optional, add if needed)
export const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDoctor = await DoctorProfile.findByIdAndDelete(id);
    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    await Account.findByIdAndDelete(deletedDoctor.accountId);
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error });
  }
};

export const getDoctorAppointmentStatistics = async (req, res) => {
  const roles = req.user?.roles || [];
  const tokenRole = req.user?.role;
  const isAdmin =
    roles.includes("admin") ||
    roles.includes("superadmin") ||
    tokenRole === "admin" ||
    tokenRole === "superadmin";

  let doctorId = req.query.doctorId;
  if (!doctorId) {
    doctorId = req.user?.profileId;
  }

  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: "Doctor ID is required",
    });
  }

  const isDoctor = roles.includes("doctor") || tokenRole === "doctor";
  if (isDoctor && doctorId.toString() !== req.user?.profileId?.toString()) {
    return res.status(403).json({
      success: false,
      msg: "Not authorized to view another doctor's statistics.",
    });
  }

  if (!isDoctor && !isAdmin) {
    return res.status(403).json({
      success: false,
      msg: "Not authorized to view doctor statistics.",
    });
  }

  try {
    const doctor = await DoctorProfile.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const totalAppointments = await Appointment.countDocuments({
      doctor: doctorId,
    });
    const pendingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "scheduled",
    });
    const completedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "completed",
    });

    const revenue = completedAppointments * doctor.cost;

    const statistics = {
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      revenue,
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Error fetching appointment statistics for doctor:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "Invalid Doctor ID",
      });
    }

    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
