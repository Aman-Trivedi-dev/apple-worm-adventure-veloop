
import mongoose from "mongoose";

const adRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["MOCK"],
      default: "MOCK",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REWARDED", "EXPIRED"],
      default: "PENDING",
      required: true,
    },

    rewardCoins: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Reward coins must be a safe integer",
      },
    },

    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    providerEventId: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    rewardedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate provider events.
adRewardSchema.index(
  { provider: 1, providerEventId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerEventId: { $type: "string" },
    },
  }
);

// Improve recent session lookup.
adRewardSchema.index({
  userId: 1,
  createdAt: -1,
});

// Improve status-based session lookup.
adRewardSchema.index({
  userId: 1,
  status: 1,
  createdAt: -1,
});

const AdReward = mongoose.model("AdReward", adRewardSchema);

export default AdReward;
