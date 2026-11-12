
import mongoose from "mongoose";

const levelCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    levelId: {
      type: Number,
      required: true,
      min: 1,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    coinsEarned: {
      type: Number,
      required: true,
      min: 0,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// A user can receive a level completion reward only once.
levelCompletionSchema.index(
  { userId: 1, levelId: 1 },
  { unique: true }
);

const LevelCompletion = mongoose.model(
  "LevelCompletion",
  levelCompletionSchema
);

export default LevelCompletion;
