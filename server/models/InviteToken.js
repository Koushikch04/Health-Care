import mongoose from "mongoose";

const { Schema } = mongoose;

const inviteTokenSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

inviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const InviteToken = mongoose.model("InviteToken", inviteTokenSchema);
export default InviteToken;
