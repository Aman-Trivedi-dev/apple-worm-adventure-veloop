
import mongoose from "mongoose";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";

// CREDIT: Add coins to user wallet





export const creditWallet = async ({
  userId,
  amount,
  source,
  referenceId,
  description = "",
  session: externalSession = null,
}) => {
  const session = externalSession || await mongoose.startSession();

  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error("Invalid coin amount");
    }

    let transactionResult;

    const executeCredit = async () => {
      // Check whether this reward was already processed
      if (referenceId) {
        const existing = await WalletTransaction.findOne({
          userId,
          source,
          referenceId,
        }).session(session);

        if (existing) {
          transactionResult = {
            balance: existing.balanceAfter,
            transaction: existing,
            duplicate: true,
          };
          return;
        }
      }

      // Add coins to the user's wallet
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { coins: amount } },
        { new: true, session, runValidators: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      const balanceAfter = user.coins;
      const balanceBefore = balanceAfter - amount;

      // Create wallet transaction history
      const [transaction] = await WalletTransaction.create(
        [
          {
            userId,
            type: "CREDIT",
            amount,
            balanceBefore,
            balanceAfter,
            source,
            referenceId,
            description,
          },
        ],
        { session }
      );

      transactionResult = {
        balance: balanceAfter,
        transaction,
        duplicate: false,
      };
    };

    if (externalSession) {
      await executeCredit();
    } else {
      await session.withTransaction(executeCredit);
    }

    return transactionResult;
  } finally {
    // Only close sessions created inside this function
    if (!externalSession) {
      await session.endSession();
    }
  }
};







// DEBIT: Deduct coins from user wallet


export const debitWallet = async ({
  userId,
  amount,
  source,
  referenceId,
  description = "",
  session: externalSession = null,
}) => {
  const session = externalSession || await mongoose.startSession();

  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error("Invalid coin amount");
    }

    let transactionResult;

    const executeDebit = async () => {
      if (referenceId) {
        const existing = await WalletTransaction.findOne({
          userId,
          source,
          referenceId,
        }).session(session);

        if (existing) {
          transactionResult = {
            balance: existing.balanceAfter,
            transaction: existing,
            duplicate: true,
          };
          return;
        }
      }

      const user = await User.findOneAndUpdate(
        {
          _id: userId,
          coins: { $gte: amount },
        },
        {
          $inc: { coins: -amount },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!user) {
        const exists = await User.exists({ _id: userId }).session(session);

        if (!exists) {
          throw new Error("User not found");
        }

        throw new Error("Insufficient wallet balance");
      }

      const balanceAfter = user.coins;
      const balanceBefore = balanceAfter + amount;

      const [transaction] = await WalletTransaction.create(
        [{
          userId,
          type: "DEBIT",
          amount,
          balanceBefore,
          balanceAfter,
          source,
          referenceId,
          description,
        }],
        { session }
      );

      transactionResult = {
        balance: balanceAfter,
        transaction,
        duplicate: false,
      };
    };

    if (externalSession) {
      await executeDebit();
    } else {
      await session.withTransaction(executeDebit);
    }

    return transactionResult;
  } finally {
    if (!externalSession) {
      await session.endSession();
    }
  }
};




// GET: Current wallet balance
export const getWalletBalance = async (userId) => {
  const user = await User.findById(userId).select("coins");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    balance: user.coins,
  };
};


// GET: Wallet transaction history
export const getWalletHistory = async (
  userId,
  page = 1,
  limit = 10
) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(50, Math.max(1, Number(limit) || 10));

  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await WalletTransaction.countDocuments({ userId });

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
