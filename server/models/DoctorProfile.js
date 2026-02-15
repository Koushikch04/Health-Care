import mongoose from "mongoose";

const { Schema } = mongoose;

const doctorAvailabilitySchema = new Schema(
  {
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
      validate: {
        validator: (days) =>
          Array.isArray(days) &&
          days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        message: "workingDays must contain integers between 0 and 6.",
      },
    },
    workingHours: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "17:00" },
    },
    breaks: {
      type: [
        new Schema(
          {
            start: { type: String, required: true },
            end: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    slotIntervalMinutes: {
      type: Number,
      default: 15,
      min: 5,
      max: 120,
    },
  },
  { _id: false }
);

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
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    availability: {
      type: doctorAvailabilitySchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);
export default DoctorProfile;
