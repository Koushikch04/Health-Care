import mongoose from "mongoose";

const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      enum: ["user", "doctor", "admin", "superadmin"],
      default: ["user"],
    },
    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);
export default Account;
