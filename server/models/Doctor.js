import mongoose from "mongoose";

const Schema = mongoose.Schema;

const nameSchema = new Schema({
  firstName: { type: String, required: true, min: 2, max: 50 },
  lastName: { type: String, required: false, min: 2, max: 50 },
});

const doctorSchema = new Schema(
  {
    name: nameSchema,
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    phone: {
      type: Number,
      required: true,
    },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    biography: {
      type: String,
      default: "",
    },
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
