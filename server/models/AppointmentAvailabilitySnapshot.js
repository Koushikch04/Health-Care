import mongoose from "mongoose";

const appointmentAvailabilitySnapshotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startMinutes: {
      type: Number,
      required: true,
    },
    endMinutes: {
      type: Number,
      required: true,
    },
    slotIntervalMinutes: {
      type: Number,
      required: true,
    },
    scheduleFingerprint: {
      type: String,
      required: true,
    },
    workingMask: {
      type: String,
      required: true,
      default: "0",
    },
    bookedMask: {
      type: String,
      required: true,
      default: "0",
    },
  },
  { timestamps: true },
);

appointmentAvailabilitySnapshotSchema.index(
  { doctor: 1, date: 1 },
  { unique: true },
);

const AppointmentAvailabilitySnapshot = mongoose.model(
  "AppointmentAvailabilitySnapshot",
  appointmentAvailabilitySnapshotSchema,
);

export default AppointmentAvailabilitySnapshot;
