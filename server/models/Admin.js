import mongoose from "mongoose";

const { Schema } = mongoose;

const adminSchema = new Schema({
  name: {
    firstName: { type: String, required: true, min: 2, max: 50 },
    lastName: { type: String, required: false, min: 2, max: 50 },
  },
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
  role: {
    type: String,
    enum: ["superadmin", "admin"],
    default: "admin",
  },
  permissions: {
    type: Map,
    of: Boolean,
    default: {
      userManagement: false,
      doctorManagement: false,
      appointmentManagement: false,
      analytics: false,
      support: false,
      adminManagement: false,
    },
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
