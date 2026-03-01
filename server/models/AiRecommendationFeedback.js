import mongoose from "mongoose";

const aiRecommendationFeedbackSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    messageId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requestId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    helpful: {
      type: Boolean,
      required: true,
    },
    recommendationCount: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    recommendationNames: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      required: true,
      trim: true,
      enum: ["instant_consultation_chat"],
      default: "instant_consultation_chat",
    },
  },
  { timestamps: true },
);

aiRecommendationFeedbackSchema.index({ sessionId: 1, messageId: 1 }, { unique: true });

const AiRecommendationFeedback = mongoose.model(
  "AiRecommendationFeedback",
  aiRecommendationFeedbackSchema,
);

export default AiRecommendationFeedback;
