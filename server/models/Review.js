import mongoose from "mongoose";

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;