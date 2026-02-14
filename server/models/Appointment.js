import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    reasonForVisit: {
      type: String,
      // required: true,
    },
    additionalNotes: {
      type: String,
    },

    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "canceled"],
      default: "scheduled",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

// Enforce one active appointment per doctor/date/time.
// Canceled appointments are excluded so the same slot can be rebooked.
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["scheduled", "completed"] },
    },
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
