import mongoose from "mongoose";

const Schema = mongoose.Schema;

const nameSchema = new Schema({
  firstName: { type: String, required: true, min: 2, max: 50 },
  lastName: { type: String, required: false, min: 2, max: 50 },
});

const phoneSchema = new Schema({
  phone: { type: Number, required: true },
  emergency: { type: Number, required: false },
});

const userSchema = new Schema({
  name: nameSchema,
  contact: phoneSchema,
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  profileImage: { type: String, required: false },
  appointments: {
    type: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);
export default User;
