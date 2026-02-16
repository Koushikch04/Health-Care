import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import AppointmentAvailabilitySnapshot from "../models/AppointmentAvailabilitySnapshot.js";
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

// Normalize break windows once so later slot math can stay numeric and fast.
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

// A slot is blocked when any overlap exists with a configured break interval.
const overlapsBreak = (slotStart, slotEnd, breaks) =>
  breaks.some((period) => slotStart < period.end && slotEnd > period.start);

const minuteToSlotLabel = (minute) => {
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const toBigIntMask = (value) => {
  try {
    return BigInt(value ?? "0");
  } catch {
    return 0n;
  }
};

// Fingerprint detects schedule drift; if changed, cached daily snapshot must be rebuilt.
const buildScheduleFingerprint = (schedule) =>
  JSON.stringify({
    workingDays: schedule.workingDays,
    startMinutes: schedule.startMinutes,
    endMinutes: schedule.endMinutes,
    slotIntervalMinutes: schedule.intervalMinutes,
    breaks: schedule.breaks,
  });

const getTotalSlots = (schedule) =>
  Math.floor((schedule.endMinutes - schedule.startMinutes) / schedule.intervalMinutes);

// Pre-compute doctor's "possible" slots for the day (ignoring bookings).
const computeWorkingMask = (schedule) => {
  const totalSlots = getTotalSlots(schedule);
  let workingMask = 0n;

  for (let index = 0; index < totalSlots; index += 1) {
    const slotStart = schedule.startMinutes + index * schedule.intervalMinutes;
    const slotEnd = slotStart + schedule.intervalMinutes;
    if (!overlapsBreak(slotStart, slotEnd, schedule.breaks)) {
      workingMask |= 1n << BigInt(index);
    }
  }

  return {
    totalSlots,
    workingMask,
    hasAtLeastOneWorkingSlot: workingMask !== 0n,
  };
};

// Convert booked appointments into bit positions so availability can be resolved with bit ops.
const buildBookedMaskFromAppointments = ({ appointments, schedule, totalSlots }) => {
  let bookedMask = 0n;

  appointments.forEach((appointment) => {
    const minutes = toMinutes(appointment.time);
    if (!Number.isInteger(minutes)) {
      return;
    }

    const offset = minutes - schedule.startMinutes;
    if (offset < 0 || offset % schedule.intervalMinutes !== 0) {
      return;
    }

    const slotIndex = offset / schedule.intervalMinutes;
    if (slotIndex >= 0 && slotIndex < totalSlots) {
      bookedMask |= 1n << BigInt(slotIndex);
    }
  });

  return bookedMask;
};

// Reads doctor schedule from profile and applies safe defaults if profile data is invalid.
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

// Rebuild one doctor-day snapshot from source-of-truth appointments.
const rebuildSnapshotWithSchedule = async ({ doctorId, date, schedule }) => {
  const dayBounds = getUtcDayBounds(date);
  if (!dayBounds || !schedule) {
    return null;
  }

  const { totalSlots, workingMask } = computeWorkingMask(schedule);
  const appointments = await Appointment.find({
    doctor: doctorId,
    date: {
      $gte: dayBounds.start,
      $lte: dayBounds.end,
    },
    status: APPOINTMENT_STATUSES.SCHEDULED,
  }).select("time");

  const bookedMask = buildBookedMaskFromAppointments({
    appointments,
    schedule,
    totalSlots,
  });
  const scheduleFingerprint = buildScheduleFingerprint(schedule);

  await AppointmentAvailabilitySnapshot.findOneAndUpdate(
    { doctor: doctorId, date: dayBounds.start },
    {
      $set: {
        startMinutes: schedule.startMinutes,
        endMinutes: schedule.endMinutes,
        slotIntervalMinutes: schedule.intervalMinutes,
        scheduleFingerprint,
        workingMask: workingMask.toString(),
        bookedMask: bookedMask.toString(),
      },
    },
    { upsert: true, new: true },
  );

  return {
    scheduleFingerprint,
    workingMask,
    bookedMask,
    totalSlots,
  };
};

// Snapshot read path: use cached snapshot when valid, otherwise rebuild lazily.
const getOrBuildSnapshotState = async ({ doctorId, date, schedule }) => {
  const dayBounds = getUtcDayBounds(date);
  if (!dayBounds || !schedule) {
    return null;
  }

  const { totalSlots, workingMask } = computeWorkingMask(schedule);
  const scheduleFingerprint = buildScheduleFingerprint(schedule);

  const snapshot = await AppointmentAvailabilitySnapshot.findOne({
    doctor: doctorId,
    date: dayBounds.start,
  }).select(
    "startMinutes endMinutes slotIntervalMinutes scheduleFingerprint workingMask bookedMask",
  );

  const snapshotMatchesSchedule =
    snapshot &&
    snapshot.startMinutes === schedule.startMinutes &&
    snapshot.endMinutes === schedule.endMinutes &&
    snapshot.slotIntervalMinutes === schedule.intervalMinutes &&
    snapshot.scheduleFingerprint === scheduleFingerprint;

  if (!snapshotMatchesSchedule) {
    const rebuilt = await rebuildSnapshotWithSchedule({ doctorId, date, schedule });
    if (!rebuilt) {
      return null;
    }
    return rebuilt;
  }

  return {
    scheduleFingerprint,
    workingMask,
    bookedMask: toBigIntMask(snapshot.bookedMask),
    totalSlots,
  };
};

// Convert a mask back to API response format (HH:mm list).
const getSlotsFromMask = ({ availableMask, totalSlots, schedule }) => {
  const slots = [];
  for (let index = 0; index < totalSlots; index += 1) {
    if ((availableMask & (1n << BigInt(index))) !== 0n) {
      const minute = schedule.startMinutes + index * schedule.intervalMinutes;
      slots.push(minuteToSlotLabel(minute));
    }
  }
  return slots;
};

// Public helper for write-path hooks (create/cancel/reschedule/cron).
export const rebuildAvailabilitySnapshotForDoctorDay = async (doctorId, date) => {
  const schedule = await getDoctorSchedule(doctorId);
  if (!schedule) {
    return null;
  }
  return rebuildSnapshotWithSchedule({ doctorId, date, schedule });
};

// Batch rebuild with dedupe so callers can pass repeated doctor-day pairs safely.
export const rebuildAvailabilitySnapshotsForPairs = async (pairs = []) => {
  const uniquePairs = new Map();

  pairs.forEach((pair) => {
    if (!pair?.doctorId || !pair?.date) return;
    const dayBounds = getUtcDayBounds(pair.date);
    if (!dayBounds) return;
    uniquePairs.set(`${pair.doctorId}:${dayBounds.start.toISOString()}`, {
      doctorId: pair.doctorId,
      date: dayBounds.start,
    });
  });

  await Promise.all(
    Array.from(uniquePairs.values()).map(({ doctorId, date }) =>
      rebuildAvailabilitySnapshotForDoctorDay(doctorId, date),
    ),
  );
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

  // Fast path: single snapshot doc read. Falls back to rebuild if missing/stale.
  const snapshotState = await getOrBuildSnapshotState({
    doctorId,
    date: dayBounds.start,
    schedule,
  });

  if (!snapshotState) {
    return {
      slots: null,
      reason: AVAILABILITY_REASONS.INVALID_DATE,
      strategy,
    };
  }

  // Core availability math: available = working - booked.
  const availableMask = snapshotState.workingMask & ~snapshotState.bookedMask;
  const slots = getSlotsFromMask({
    availableMask,
    totalSlots: snapshotState.totalSlots,
    schedule,
  });

  if (slots.length > 0) {
    return {
      slots,
      reason: AVAILABILITY_REASONS.AVAILABLE,
      strategy,
    };
  }

  return {
    slots: [],
    reason:
      snapshotState.workingMask !== 0n
        ? AVAILABILITY_REASONS.FULLY_BOOKED
        : AVAILABILITY_REASONS.OUT_OF_SCHEDULE,
    strategy,
  };
};

export const getAvailableSlots = async (doctorId, date, options = {}) => {
  const result = await getAvailableSlotsWithContext(doctorId, date, options);
  return result?.slots ?? result;
};
