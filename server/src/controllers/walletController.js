
import {
  creditWallet,
  debitWallet,
  getWalletBalance,
  getWalletHistory,
} from "../services/walletService.js";

// Common wallet error handler
const handleWalletError = (res, error) => {
  console.error("Wallet error:", error);

  if (error.message === "User not found") {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  if (
    error.message === "Insufficient wallet balance" ||
    error.message === "Invalid user ID" ||
    error.message === "Invalid coin amount" ||
    error.message === "Duplicate transaction"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// GET: Wallet balance
export const getBalance = async (req, res) => {
  try {
    const userId = req.userId;

    const wallet = await getWalletBalance(userId);

    return res.status(200).json({
      success: true,
      message: "Wallet balance fetched successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    return handleWalletError(res, error);
  }
};

// GET: Wallet transaction history
export const getHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const history = await getWalletHistory(userId, page, limit);

    return res.status(200).json({
      success: true,
      message: "Wallet history fetched successfully",
      ...history,
    });
  } catch (error) {
    return handleWalletError(res, error);
  }
};

// POST: Credit wallet
export const addCoins = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, source, referenceId, description } = req.body;

    const result = await creditWallet({
      userId,
      amount,
      source,
      referenceId,
      description,
    });

    return res.status(200).json({
      success: true,
      duplicate: result.duplicate,
      message: result.duplicate
        ? "This reward was already processed"
        : "Coins added successfully",
      balance: result.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    return handleWalletError(res, error);
  }
};

// POST: Debit wallet
export const spendCoins = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, source, referenceId, description } = req.body;

    const result = await debitWallet({
      userId,
      amount,
      source,
      referenceId,
      description,
    });

    return res.status(200).json({
      success: true,
      duplicate: result.duplicate,
      message: result.duplicate
        ? "This transaction was already processed"
        : "Coins deducted successfully",
      balance: result.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    return handleWalletError(res, error);
  }
};
