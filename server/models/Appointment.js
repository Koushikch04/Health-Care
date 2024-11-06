import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
