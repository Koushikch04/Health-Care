import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import { getUtcDayBounds } from "../utils/date.js";
import { APPOINTMENT_STATUSES } from "../utils/appointmentStateMachine.js";

const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const AVAILABILITY_STRATEGIES = {
  ARRAY: "array",
  BITMASK: "bitmask",
};
export const AVAILABILITY_REASONS = {
  AVAILABLE: "AVAILABLE",
  INVALID_DATE: "INVALID_DATE",
  DOCTOR_NOT_FOUND: "DOCTOR_NOT_FOUND",
  NON_WORKING_DAY: "NON_WORKING_DAY",
  OUT_OF_SCHEDULE: "OUT_OF_SCHEDULE",
  FULLY_BOOKED: "FULLY_BOOKED",
};

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
        period.end > period.start,
    );
};

const getDefaultAvailabilityStrategy = () => {
  const configured = String(
    process.env.APPOINTMENT_AVAILABILITY_STRATEGY ||
      AVAILABILITY_STRATEGIES.ARRAY,
  ).toLowerCase();

  return Object.values(AVAILABILITY_STRATEGIES).includes(configured)
    ? configured
    : AVAILABILITY_STRATEGIES.ARRAY;
};

const resolveAvailabilityStrategy = (override) => {
  if (!override) {
    return getDefaultAvailabilityStrategy();
  }
  const normalizedOverride = String(override).toLowerCase();
  return Object.values(AVAILABILITY_STRATEGIES).includes(normalizedOverride)
    ? normalizedOverride
    : getDefaultAvailabilityStrategy();
};

const overlapsBreak = (slotStart, slotEnd, breaks) =>
  breaks.some((period) => slotStart < period.end && slotEnd > period.start);

const minuteToSlotLabel = (minute) => {
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const hasAtLeastOneWorkingSlot = (schedule) => {
  for (
    let time = schedule.startMinutes;
    time + schedule.intervalMinutes <= schedule.endMinutes;
    time += schedule.intervalMinutes
  ) {
    const slotEnd = time + schedule.intervalMinutes;
    if (!overlapsBreak(time, slotEnd, schedule.breaks)) {
      return true;
    }
  }
  return false;
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
    Number.isInteger(intervalMinutes) && intervalMinutes > 0
      ? intervalMinutes
      : 15;

  return {
    workingDays:
      Array.isArray(availability.workingDays) &&
      availability.workingDays.length > 0
        ? availability.workingDays
        : [1, 2, 3, 4, 5],
    startMinutes,
    endMinutes,
    intervalMinutes: normalizedInterval,
    breaks: normalizeBreaks(availability.breaks),
  };
};

export const getAvailableSlotsWithContext = async (
  doctorId,
  date,
  options = {},
) => {
  const strategy = resolveAvailabilityStrategy(options.strategy);
  const dayBounds = getUtcDayBounds(date);
  if (!dayBounds) {
    return {
      slots: null,
      reason: AVAILABILITY_REASONS.INVALID_DATE,
      strategy,
    };
  }

  const schedule = await getDoctorSchedule(doctorId);
  if (!schedule) {
    return {
      slots: [],
      reason: AVAILABILITY_REASONS.DOCTOR_NOT_FOUND,
      strategy,
    };
  }

  const dayOfWeek = getDayOfWeekUTC(dayBounds.start);
  if (dayOfWeek === null) {
    return {
      slots: null,
      reason: AVAILABILITY_REASONS.INVALID_DATE,
      strategy,
    };
  }

  if (!schedule.workingDays.includes(dayOfWeek)) {
    return {
      slots: [],
      reason: AVAILABILITY_REASONS.NON_WORKING_DAY,
      strategy,
    };
  }

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: {
      $gte: dayBounds.start,
      $lte: dayBounds.end,
    },
    status: APPOINTMENT_STATUSES.SCHEDULED,
  }).select("time");

  const totalSlots = Math.floor(
    (schedule.endMinutes - schedule.startMinutes) / schedule.intervalMinutes,
  );

  let slots = [];

  if (strategy === AVAILABILITY_STRATEGIES.BITMASK) {
    let workingMask = 0n;
    for (let index = 0; index < totalSlots; index += 1) {
      const slotStart =
        schedule.startMinutes + index * schedule.intervalMinutes;
      const slotEnd = slotStart + schedule.intervalMinutes;
      if (!overlapsBreak(slotStart, slotEnd, schedule.breaks)) {
        workingMask |= 1n << BigInt(index);
      }
    }

    let bookedMask = 0n;
    appointments.forEach((appointment) => {
      const minutes = toMinutes(appointment.time);
      if (!Number.isInteger(minutes)) return;
      const offset = minutes - schedule.startMinutes;
      if (offset < 0 || offset % schedule.intervalMinutes !== 0) return;
      const slotIndex = offset / schedule.intervalMinutes;
      if (slotIndex >= 0 && slotIndex < totalSlots) {
        bookedMask |= 1n << BigInt(slotIndex);
      }
    });

    const availableMask = workingMask & ~bookedMask;
    for (let index = 0; index < totalSlots; index += 1) {
      if ((availableMask & (1n << BigInt(index))) !== 0n) {
        const minute = schedule.startMinutes + index * schedule.intervalMinutes;
        slots.push(minuteToSlotLabel(minute));
      }
    }
  } else {
    const bookedTimes = new Set(
      appointments.map((appointment) => appointment.time),
    );
    for (
      let time = schedule.startMinutes;
      time + schedule.intervalMinutes <= schedule.endMinutes;
      time += schedule.intervalMinutes
    ) {
      const slotEnd = time + schedule.intervalMinutes;
      if (overlapsBreak(time, slotEnd, schedule.breaks)) continue;
      const slotLabel = minuteToSlotLabel(time);
      if (!bookedTimes.has(slotLabel)) slots.push(slotLabel);
    }
  }

  if (slots.length > 0) {
    return {
      slots,
      reason: AVAILABILITY_REASONS.AVAILABLE,
      strategy,
    };
  }

  return {
    slots: [],
    reason: hasAtLeastOneWorkingSlot(schedule)
      ? AVAILABILITY_REASONS.FULLY_BOOKED
      : AVAILABILITY_REASONS.OUT_OF_SCHEDULE,
    strategy,
  };
};

export const getAvailableSlots = async (doctorId, date, options = {}) => {
  const result = await getAvailableSlotsWithContext(doctorId, date, options);
  return result?.slots ?? result;
};
