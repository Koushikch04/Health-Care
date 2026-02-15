import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import { getUtcDayBounds } from "../utils/date.js";
import { APPOINTMENT_STATUSES } from "../utils/appointmentStateMachine.js";

const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (value) => {
  if (typeof value !== "string" || !HHMM_REGEX.test(value)) {
    return null;
  }
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const getDayOfWeekUTC = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.getUTCDay();
};

const normalizeBreaks = (breaks) => {
  if (!Array.isArray(breaks)) return [];
  return breaks
    .map((period) => ({
      start: toMinutes(period?.start),
      end: toMinutes(period?.end),
    }))
    .filter(
      (period) =>
        Number.isInteger(period.start) &&
        Number.isInteger(period.end) &&
        period.end > period.start
    );
};

const generateTimeSlots = ({ startMinutes, endMinutes, intervalMinutes, breaks }) => {
  const slots = [];

  for (let time = startMinutes; time + intervalMinutes <= endMinutes; time += intervalMinutes) {
    const blockedByBreak = breaks.some(
      (period) => time < period.end && time + intervalMinutes > period.start
    );
    if (blockedByBreak) {
      continue;
    }

    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    slots.push(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    );
  }

  return slots;
};

const getDoctorSchedule = async (doctorId) => {
  const doctor = await DoctorProfile.findOne({
    _id: doctorId,
    isDeleted: { $ne: true },
  }).select("availability");

  if (!doctor) {
    return null;
  }

  const availability = doctor.availability || {};
  const startMinutes = toMinutes(availability.workingHours?.start ?? "08:00");
  const endMinutes = toMinutes(availability.workingHours?.end ?? "17:00");
  const intervalMinutes = availability.slotIntervalMinutes || 15;

  if (
    !Number.isInteger(startMinutes) ||
    !Number.isInteger(endMinutes) ||
    endMinutes <= startMinutes
  ) {
    return {
      workingDays: [1, 2, 3, 4, 5],
      startMinutes: 8 * 60,
      endMinutes: 17 * 60,
      intervalMinutes: 15,
      breaks: [],
    };
  }

  const normalizedInterval =
    Number.isInteger(intervalMinutes) && intervalMinutes > 0 ? intervalMinutes : 15;

  return {
    workingDays:
      Array.isArray(availability.workingDays) && availability.workingDays.length > 0
        ? availability.workingDays
        : [1, 2, 3, 4, 5],
    startMinutes,
    endMinutes,
    intervalMinutes: normalizedInterval,
    breaks: normalizeBreaks(availability.breaks),
  };
};

export const getAvailableSlots = async (doctorId, date) => {
  const dayBounds = getUtcDayBounds(date);
  if (!dayBounds) {
    return null;
  }

  const schedule = await getDoctorSchedule(doctorId);
  if (!schedule) {
    return [];
  }

  const dayOfWeek = getDayOfWeekUTC(dayBounds.start);
  if (dayOfWeek === null) {
    return null;
  }

  if (!schedule.workingDays.includes(dayOfWeek)) {
    return [];
  }

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: {
      $gte: dayBounds.start,
      $lte: dayBounds.end,
    },
    status: APPOINTMENT_STATUSES.SCHEDULED,
  }).select("time");

  const bookedTimes = new Set(appointments.map((appointment) => appointment.time));
  return generateTimeSlots({
    startMinutes: schedule.startMinutes,
    endMinutes: schedule.endMinutes,
    intervalMinutes: schedule.intervalMinutes,
    breaks: schedule.breaks,
  }).filter((slot) => !bookedTimes.has(slot));
};
