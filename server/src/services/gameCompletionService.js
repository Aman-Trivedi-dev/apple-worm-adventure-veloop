
import mongoose from "mongoose";
import User from "../models/User.js";
import LevelCompletion from "../models/LevelCompletion.js";
import { creditWallet } from "./walletService.js";
import { getLevelConfig, MAX_LEVELS } from "../config/gameConfig.js";

export const completeGameLevel = async ({ userId, levelId, score }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  if (!Number.isSafeInteger(levelId) || levelId < 1) {
    throw new Error("Invalid level ID");
  }

  if (!Number.isSafeInteger(score) || score < 0) {
    throw new Error("Invalid score");
  }

  const levelConfig = getLevelConfig(levelId);

  if (!levelConfig) {
    throw new Error("Invalid level");
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const existingCompletion = await LevelCompletion.findOne({
        userId,
        levelId,
      }).session(session);

      if (existingCompletion) {
        const user = await User.findById(userId)
          .select("totalScore coins unlockedLevel")
          .session(session);

        if (!user) {
          throw new Error("User not found");
        }

        result = {
          duplicate: true,
          completion: existingCompletion,
          progress: {
            totalScore: user.totalScore,
            coins: user.coins,
            unlockedLevel: user.unlockedLevel,
          },
        };

        return;
      }

      const user = await User.findById(userId).session(session);

      if (!user) {
        throw new Error("User not found");
      }

      if (levelId > user.unlockedLevel) {
        throw new Error("Level is locked");
      }

      const reward = levelConfig.reward;
      const nextUnlockedLevel = Math.min(
        Math.max(user.unlockedLevel, levelId + 1),
        MAX_LEVELS
      );

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { totalScore: score },
          $max: { unlockedLevel: nextUnlockedLevel },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      const completion = await LevelCompletion.create(
        [
          {
            userId,
            levelId,
            score,
            coinsEarned: reward,
          },
        ],
        { session }
      );

      const walletResult = await creditWallet({
        userId,
        amount: reward,
        source: "LEVEL_REWARD",
        referenceId: `level-${levelId}`,
        description: `Reward for completing level ${levelId}`,
        session,
      });

      result = {
        duplicate: false,
        completion: completion[0],
        wallet: walletResult,
        progress: {
          totalScore: updatedUser.totalScore,
          coins: walletResult.balance,
          unlockedLevel: updatedUser.unlockedLevel,
        },
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
