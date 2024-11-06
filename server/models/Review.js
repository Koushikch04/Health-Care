// models/Review.js
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 0,
  },
  comment: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.index({ user: 1, appointment: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
