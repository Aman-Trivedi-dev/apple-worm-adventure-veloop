
import mongoose from "mongoose";
import crypto from "crypto";

import AdReward from "../models/AdReward.js";
import { AD_REWARD_CONFIG } from "../config/adConfig.js";
import { creditWallet } from "./walletService.js";

const getSecret = () => {
  const secret = process.env.MOCK_AD_SECRET;

  if (!secret) {
    throw new Error("Mock ad secret is not configured");
  }

  return secret;
};

// Generate a backend-signed mock completion token.
const createCompletionToken = (referenceId, userId) => {
  const payload = `${referenceId}:${userId}`;

  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
};

// Create a rewarded ad session.
export const createAdSession = async (userId) => {
  if (!AD_REWARD_CONFIG.enabled) {
    throw new Error("Ad rewards are currently disabled");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const dailyCount = await AdReward.countDocuments({
    userId,
    createdAt: { $gte: startOfDay },
  });

  if (dailyCount >= AD_REWARD_CONFIG.dailyLimit) {
    throw new Error("Daily ad reward limit reached");
  }

  const latestReward = await AdReward.findOne({
    userId,
    status: { $in: ["PENDING", "VERIFIED", "REWARDED"] },
  }).sort({ createdAt: -1 });

  if (
    latestReward &&
    now.getTime() - latestReward.createdAt.getTime() <
      AD_REWARD_CONFIG.cooldownSeconds * 1000
  ) {
    throw new Error("Please wait before watching another ad");
  }

  const referenceId = crypto.randomUUID();

  const expiresAt = new Date(
    now.getTime() +
      AD_REWARD_CONFIG.sessionExpiryMinutes * 60 * 1000
  );

  const reward = await AdReward.create({
    userId,
    provider: "MOCK",
    status: "PENDING",
    rewardCoins: AD_REWARD_CONFIG.rewardCoins,
    referenceId,
    expiresAt,
  });

  return {
    referenceId: reward.referenceId,
    rewardCoins: reward.rewardCoins,
    provider: reward.provider,
    expiresAt: reward.expiresAt,
    completionToken: createCompletionToken(referenceId, userId),
  };
};

// Verify completion and credit coins exactly once.
export const verifyAdCompletion = async ({
  userId,
  referenceId,
  completionToken,
}) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  if (!referenceId || !completionToken) {
    throw new Error("Ad completion details are required");
  }

  const expectedToken = createCompletionToken(referenceId, userId);

  const expectedBuffer = Buffer.from(expectedToken);
  const receivedBuffer = Buffer.from(completionToken);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new Error("Invalid ad completion token");
  }

  // Find the session before starting the transaction.
  const existingReward = await AdReward.findOne({
    userId,
    referenceId,
  });

  if (!existingReward) {
    throw new Error("Ad reward session not found");
  }

  // Handle already rewarded sessions.
  if (existingReward.status === "REWARDED") {
    return {
      success: true,
      duplicate: true,
      message: "Reward already credited",
    };
  }

  // Expire outside the transaction so this update is not rolled back.
  if (
    existingReward.status === "PENDING" &&
    existingReward.expiresAt <= new Date()
  ) {
    await AdReward.updateOne(
      {
        _id: existingReward._id,
        status: "PENDING",
      },
      {
        $set: { status: "EXPIRED" },
      }
    );

    throw new Error("Ad reward session expired");
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      // Atomically claim only a pending, unexpired session.
      const claimedReward = await AdReward.findOneAndUpdate(
        {
          _id: existingReward._id,
          userId,
          status: "PENDING",
          expiresAt: { $gt: new Date() },
        },
        {
          $set: {
            status: "VERIFIED",
            providerEventId: crypto.randomUUID(),
            verifiedAt: new Date(),
          },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!claimedReward) {
        const latestReward = await AdReward.findById(
          existingReward._id
        ).session(session);

        if (latestReward?.status === "REWARDED") {
          result = {
            success: true,
            duplicate: true,
            message: "Reward already credited",
          };
          return;
        }

        if (
          latestReward?.status === "PENDING" &&
          latestReward.expiresAt <= new Date()
        ) {
          throw new Error("Ad reward session expired");
        }

        throw new Error("Ad reward session is not valid");
      }

      const walletResult = await creditWallet({
        userId,
        amount: claimedReward.rewardCoins,
        source: "AD_REWARD",
        referenceId: claimedReward.referenceId,
        description: "Verified rewarded ad completion",
        session,
      });

      if (walletResult.duplicate) {
        throw new Error("Reward transaction already exists");
      }

      await AdReward.updateOne(
        {
          _id: claimedReward._id,
          status: "VERIFIED",
        },
        {
          $set: {
            status: "REWARDED",
            rewardedAt: new Date(),
          },
        },
        { session }
      );

      result = {
        success: true,
        duplicate: false,
        coinsAwarded: claimedReward.rewardCoins,
        balance: walletResult.balance,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
