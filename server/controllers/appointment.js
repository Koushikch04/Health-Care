import mongoose from "mongoose";
import moment from "moment";

import Appointment from "../models/Appointment.js";
import UserProfile from "../models/UserProfile.js";
import DoctorProfile from "../models/DoctorProfile.js";
import { getUtcDayBounds } from "../utils/date.js";
import {
  APPOINTMENT_ACTIONS,
  APPOINTMENT_STATUSES,
  assertActionAllowed,
  getAllowedFromStatuses,
} from "../utils/appointmentStateMachine.js";
import { getAvailableSlots } from "../services/appointmentService.js";

const getUserProfileId = async (req) => {
  if (req.user?.profileId) return req.user.profileId;
  if (req.user?.accountId) {
    const profile = await UserProfile.findOne({ accountId: req.user.accountId });
    return profile?._id;
  }
  return null;
};

const getDoctorProfileId = async (req) => {
  if (req.user?.profileId) return req.user.profileId;
  if (req.user?.accountId) {
    const profile = await DoctorProfile.findOne({
      accountId: req.user.accountId,
    });
    return profile?._id;
  }
  return null;
};

export const createAppointment = async (req, res) => {
  const { patientName, reasonForVisit, additionalNotes, date, time, doctorId } =
    req.body;

  const userProfileId = await getUserProfileId(req);

  if (!patientName || !date || !time || !userProfileId || !doctorId) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    const dayBounds = getUtcDayBounds(date);
    if (!dayBounds) {
      return res.status(400).json({ message: "Invalid appointment date." });
    }

    const doctorExists = await DoctorProfile.exists({
      _id: doctorId,
      isDeleted: { $ne: true },
    });
    if (!doctorExists) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const availableSlots = await getAvailableSlots(doctorId, date);
    if (!availableSlots) {
      return res.status(400).json({ message: "Invalid appointment date." });
    }
    if (!availableSlots.includes(time)) {
      return res.status(409).json({
        message:
          "Selected time slot is not available for this doctor on the chosen date.",
      });
    }

    const newAppointment = new Appointment({
      doctor: doctorId,
      user: userProfileId,
      patientName,
      reasonForVisit,
      additionalNotes,
      date: dayBounds.start,
      time,
    });

    const savedAppointment = await newAppointment.save();
    return res.status(201).json(savedAppointment);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Selected time slot is already booked for this doctor.",
      });
    }

    return res
      .status(500)
      .json({ message: "Error creating appointment", error });
  }
};

export const getUserAppointments = async (req, res) => {
  const { status } = req.query;
  const validStatuses = [
    APPOINTMENT_STATUSES.SCHEDULED,
    APPOINTMENT_STATUSES.COMPLETED,
    APPOINTMENT_STATUSES.CANCELED,
  ];
  try {
    const userProfileId = await getUserProfileId(req);
    let query = { user: userProfileId };
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          msg: `Invalid status filter. Allowed values are: ${validStatuses.join(
            ", "
          )}`,
        });
      }
      query.status = status;
    }
    const appointments = await Appointment.find(query)
      .populate({
        path: "doctor",
        select: "name experience rating specialty",
        populate: {
          path: "specialty",
          model: "Specialty",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });
    // console.log(appointments);

    const response = appointments.map((appointment) => {
      const doctor = appointment.doctor?.toObject
        ? appointment.doctor.toObject()
        : appointment.doctor;
      return {
        ...appointment.toObject(),
        doctor: doctor
          ? { ...doctor, rating: doctor.rating?.average ?? 0 }
          : doctor,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ msg: "Error retrieving appointments", error });
  }
};

export const getAvailableTimeSlots = async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    const doctorExists = await DoctorProfile.exists({
      _id: doctorId,
      isDeleted: { $ne: true },
    });
    if (!doctorExists) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const availableSlots = await getAvailableSlots(doctorId, date);
    if (!availableSlots) {
      return res.status(400).json({ message: "Invalid date." });
    }

    return res.status(200).json(availableSlots);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving available time slots", error });
  }
};

export const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const roles = req.user?.roles || [];
  const tokenRole = req.user?.role;
  const isAdmin =
    roles.includes("admin") ||
    roles.includes("superadmin") ||
    tokenRole === "admin" ||
    tokenRole === "superadmin";
  const effectiveRole = isAdmin
    ? "admin"
    : roles.includes("doctor") || tokenRole === "doctor"
      ? "doctor"
      : "user";

  try {
    const appointment = await Appointment.findById(appointmentId);
    console.log(appointment);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const userProfileId = await getUserProfileId(req);
    const doctorProfileId = await getDoctorProfileId(req);

    if (
      (effectiveRole === "user" &&
        appointment.user.toString() !== userProfileId?.toString()) ||
      (effectiveRole === "doctor" &&
        appointment.doctor.toString() !== doctorProfileId?.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this appointment." });
    }

    try {
      assertActionAllowed(appointment.status, APPOINTMENT_ACTIONS.CANCEL);
    } catch (stateError) {
      return res.status(409).json({ message: stateError.message });
    }

    const updatedAppointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        status: { $in: getAllowedFromStatuses(APPOINTMENT_ACTIONS.CANCEL) },
      },
      { $set: { status: APPOINTMENT_STATUSES.CANCELED } },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(409).json({
        message:
          "Appointment state changed and can no longer be canceled.",
      });
    }

    return res
      .status(200)
      .json({
        message: "Appointment canceled successfully.",
        appointment: updatedAppointment,
      });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "Error canceling appointment", error });
  }
};

export const getAppointmentDetails = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId).populate(
      "doctor",
      "name experience rating"
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const userProfileId = await getUserProfileId(req);
    if (appointment.user.toString() !== userProfileId?.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this appointment." });
    }

    const doctor = appointment.doctor?.toObject
      ? appointment.doctor.toObject()
      : appointment.doctor;
    return res.status(200).json({
      ...appointment.toObject(),
      doctor: doctor
        ? { ...doctor, rating: doctor.rating?.average ?? 0 }
        : doctor,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving appointment details", error });
  }
};

export const getDoctorAppointments = async (req, res) => {
  const { doctorId } = req.params;
  const { filter = "week", date } = req.query; // Allow specific date input

  try {
    // Use provided date or default to current date
    const referenceDate = date ? new Date(date) : new Date();

    // Initialize date range based on filter
    let startDate, endDate, groupingFormat, responseMapper;

    switch (filter) {
      case "week": {
        // Start from Monday of the current week
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
        // Get full month view
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
        // Get full year view
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
          doctor: new mongoose.Types.ObjectId(doctorId),
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
