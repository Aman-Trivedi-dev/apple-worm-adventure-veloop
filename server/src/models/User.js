
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: false,
      default: null,
    },

    totalScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    coins: {
      type: Number,
      default: 0,
      min: 0,
    },

    unlockedLevel: {
      type: Number,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Unlocked level must be a valid integer",
      },
    },

    // Purchased booster inventory
    boosterInventory: {
      REVIVE: { type: Number, default: 0, min: 0 },
      DOUBLE_SCORE: { type: Number, default: 0, min: 0 },
      DOUBLE_COINS: { type: Number, default: 0, min: 0 },
      EXTRA_MOVES: { type: Number, default: 0, min: 0 },
      HINT: { type: Number, default: 0, min: 0 },
      BOOSTER: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
