
import mongoose from "mongoose";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import { getBoosterConfig } from "../config/boosterConfig.js";
import { debitWallet } from "./walletService.js";

export const purchaseBooster = async ({
  userId,
  boosterId,
  referenceId,
}) => {
  const booster = getBoosterConfig(boosterId);

  if (!booster) {
    throw new Error("Invalid booster");
  }

  if (
    typeof referenceId !== "string" ||
    referenceId.trim().length < 8 ||
    referenceId.trim().length > 100
  ) {
    throw new Error("Invalid purchase reference");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      // Check for an already completed purchase
      const existing = await WalletTransaction.findOne({
        userId,
        source: "BOOSTER",
        referenceId: referenceId.trim(),
      }).session(session);

      if (existing) {
        const user = await User.findById(userId).session(session);

        if (!user) throw new Error("User not found");

        result = {
          booster: {
            id: booster.id,
            name: booster.name,
            price: booster.price,
            description: booster.description,
            duplicate: true,
          },
          balance: user.coins,
          inventory: user.boosterInventory,
          transaction: existing,
        };

        return;
      }

      // Deduct coins using the same database transaction
      const walletResult = await debitWallet({
        userId,
        amount: booster.price,
        source: "BOOSTER",
        referenceId: referenceId.trim(),
        description: `Purchased ${booster.name}`,
        session,
      });

      // Add the purchased booster to inventory
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            [`boosterInventory.${booster.id}`]: 1,
          },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        throw new Error("User not found");
      }

      result = {
        booster: {
          id: booster.id,
          name: booster.name,
          price: booster.price,
          description: booster.description,
          duplicate: false,
        },
        balance: walletResult.balance,
        inventory: updatedUser.boosterInventory,
        transaction: walletResult.transaction,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
