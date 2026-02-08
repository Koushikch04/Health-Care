import mongoose from "mongoose";

const { Schema } = mongoose;

const doctorProfileSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      unique: true,
      required: true,
    },
    name: {
      firstName: String,
      lastName: String,
    },
    phone: Number,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    biography: String,
    experience: Number,
    cost: Number,
    specialty: {
      type: Schema.Types.ObjectId,
      ref: "Specialty",
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    image: String,
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);
export default DoctorProfile;
