import mongoose from "mongoose";

const { Schema } = mongoose;

const userProfileSchema = new Schema(
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
    contact: {
      phone: Number,
      emergency: Number,
    },
    dob: Date,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    profileImage: String,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
