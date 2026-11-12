
import mongoose from "mongoose";
import User from "../models/User.js";
import { getBoosterConfig } from "../config/boosterConfig.js";

export const activateBooster = async ({ userId, boosterId }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const booster = getBoosterConfig(boosterId);

  if (!booster) {
    throw new Error("Invalid booster");
  }

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      [`boosterInventory.${boosterId}`]: { $gt: 0 },
    },
    {
      $inc: {
        [`boosterInventory.${boosterId}`]: -1,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    const existingUser = await User.exists({ _id: userId });

    if (!existingUser) {
      throw new Error("User not found");
    }

    throw new Error("Booster not available");
  }

  return {
    booster: {
      id: booster.id,
      name: booster.name,
      description: booster.description,
      multiplier: booster.multiplier || null,
      extraMoves: booster.extraMoves || 0,
    },
    inventory: user.boosterInventory,
  };
};
