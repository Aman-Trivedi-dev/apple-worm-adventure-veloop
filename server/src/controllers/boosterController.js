
import User from "../models/User.js";
import { purchaseBooster } from "../services/boosterService.js";
import { activateBooster } from "../services/boosterActivationService.js";

export const buyBooster = async (req, res) => {
  try {
    const { boosterId, referenceId } = req.body || {};

    if (!boosterId || !referenceId) {
      return res.status(400).json({
        success: false,
        message: "Booster ID and purchase reference are required",
      });
    }

    const result = await purchaseBooster({
      userId: req.userId,
      boosterId,
      referenceId,
    });

    return res.status(200).json({
      success: true,
      message: result.booster.duplicate
        ? "Booster purchase was already processed"
        : "Booster purchased successfully",
      ...result,
    });
  } catch (error) {
    console.error("Booster purchase error:", error);

    const clientErrors = [
      "Invalid booster",
      "Invalid purchase reference",
      "Invalid user ID",
      "Invalid coin amount",
      "Insufficient wallet balance",
      "User not found",
    ];

    const status = clientErrors.includes(error.message)
      ? error.message === "User not found" ? 404 : 400
      : 500;

    return res.status(status).json({
      success: false,
      message: status === 500 ? "Internal server error" : error.message,
    });
  }
};

export const getBoosterInventory = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("boosterInventory")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      inventory: user.boosterInventory || {},
    });
  } catch (error) {
    console.error("Get booster inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST: Activate and consume a booster
export const useBooster = async (req, res) => {
  try {
    const { boosterId } = req.body || {};

    if (!boosterId) {
      return res.status(400).json({
        success: false,
        message: "Booster ID is required",
      });
    }

    const result = await activateBooster({
      userId: req.userId,
      boosterId,
    });

    return res.status(200).json({
      success: true,
      message: "Booster activated successfully",
      ...result,
    });
  } catch (error) {
    console.error("Booster activation error:", error);

    const clientErrors = [
      "Invalid user ID",
      "Invalid booster",
      "User not found",
      "Booster not available",
    ];

    const status = clientErrors.includes(error.message)
      ? error.message === "User not found" ? 404 : 400
      : 500;

    return res.status(status).json({
      success: false,
      message: status === 500 ? "Internal server error" : error.message,
    });
  }
};
