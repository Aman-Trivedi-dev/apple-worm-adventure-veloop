
import {
  createAdSession,
  verifyAdCompletion,
} from "../services/adService.js";

// POST: Create a new rewarded ad session
export const createAdRewardSession = async (req, res) => {
  try {
    const result = await createAdSession(req.userId);

    return res.status(201).json({
      success: true,
      message: "Ad reward session created successfully",
      ...result,
    });
  } catch (error) {
    console.error("Create ad session error:", error);

    const clientErrors = [
      "Ad rewards are currently disabled",
      "Invalid user ID",
      "Daily ad reward limit reached",
      "Please wait before watching another ad",
    ];

    const status =
      error.message === "Daily ad reward limit reached" ||
      error.message === "Please wait before watching another ad"
        ? 429
        : clientErrors.includes(error.message)
          ? 400
          : 500;

    return res.status(status).json({
      success: false,
      message:
        status === 500 ? "Internal server error" : error.message,
    });
  }
};

// POST: Verify ad completion and credit coins
export const completeAdReward = async (req, res) => {
  try {
    const { referenceId, completionToken } = req.body || {};

    if (!referenceId || !completionToken) {
      return res.status(400).json({
        success: false,
        message: "Reference ID and completion token are required",
      });
    }

    const result = await verifyAdCompletion({
      userId: req.userId,
      referenceId,
      completionToken,
    });

    return res.status(200).json({
      success: true,
      message: result.duplicate
        ? "Ad reward was already credited"
        : "Ad reward credited successfully",
      ...result,
    });
  } catch (error) {
    console.error("Complete ad reward error:", error);

    const clientErrors = [
      "Invalid user ID",
      "Ad completion details are required",
      "Invalid ad completion token",
      "Ad reward session not found",
      "Ad reward session is not valid",
      "Ad reward session expired",
      "Reward transaction already exists",
    ];

    const status = clientErrors.includes(error.message)
      ? error.message === "Ad reward session not found"
        ? 404
        : error.message === "Ad reward session expired"
          ? 410
          : 400
      : 500;

    return res.status(status).json({
      success: false,
      message:
        status === 500 ? "Internal server error" : error.message,
    });
  }
};
