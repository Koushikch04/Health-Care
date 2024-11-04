import mongoose from "mongoose";
import moment from "moment";

import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  const { patientName, reasonForVisit, additionalNotes, date, time, doctorId } =
    req.body;

  if (!patientName || !date || !time || !req.user.id || !doctorId) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    const newAppointment = new Appointment({
      doctor: doctorId,
      user: req.user.id,
      patientName,
      reasonForVisit,
      additionalNotes,
      date,
      time,
    });

    const savedAppointment = await newAppointment.save();
    return res.status(201).json(savedAppointment);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating appointment", error });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    // console.log(req.userId);
    const appointments = await Appointment.find({ user: req.user.id })
      .populate("doctor", "name experience rating")
      .sort({ createdAt: -1 });

    return res.status(200).json(appointments);
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ msg: "Error retrieving appointments", error });
  }
};

const fetchAvailableTimeSlots = async (doctorId, selectedDate) => {
  try {
    const response = await fetch(
      `http://localhost:8000/appointment/available-slots/doctor/${doctorId}/date/${selectedDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourToken}`, // Include the token if authentication is required
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch available time slots");
    }

    const availableSlots = await response.json();
    console.log("Available Time Slots:", availableSlots);
    return availableSlots;
  } catch (error) {
    console.error("Error fetching available time slots:", error);
  }
};

// Function to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  const startTime = 8 * 60; // 8:00 AM in minutes
  const endTime = 17 * 60; // 5:00 PM in minutes

  for (let time = startTime; time <= endTime; time += 15) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
    slots.push(formattedTime);
  }
  return slots;
};

export const getAvailableTimeSlots = async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    // Fetch appointments for the specified doctor and date
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: "scheduled",
    }).select("time");

    const bookedTimes = appointments.map((app) => app.time);
    const allSlots = generateTimeSlots();

    // Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    return res.status(200).json(availableSlots);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving available time slots", error });
  }
};

export const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this appointment." });
    }

    appointment.status = "canceled";
    await appointment.save();

    return res
      .status(200)
      .json({ message: "Appointment canceled successfully.", appointment });
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

    if (appointment.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this appointment." });
    }

    return res.status(200).json(appointment);
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
