import mongoose from "mongoose";

const Schema = mongoose.Schema;

const doctorSchema = new Schema(
  {
    name: { type: String, required: true },
    experience: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    profile: { type: String },
    cost: { type: Number, required: true },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },
    image: {
      type: String,
      default: "/Images/Appointment/DoctorCard/doctor.png",
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
