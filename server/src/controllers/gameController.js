
import { fetchGameProgress } from "../services/gameService.js";
import { completeGameLevel } from "../services/gameCompletionService.js";

// GET: Fetch logged-in user's game progress
export const getGameProgress = async (req, res) => {
  try {
    const userId = req.userId;

    const progress = await fetchGameProgress(userId);

    return res.status(200).json({
      success: true,
      message: "Game progress fetched successfully",
      progress,
    });
  } catch (error) {
    console.error("Get game progress error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST: Complete a game level
export const completeLevel = async (req, res) => {
  try {
    const userId = req.userId;
    const { levelId, score } = req.body || {};

    if (
      !Number.isSafeInteger(levelId) ||
      !Number.isSafeInteger(score) ||
      score < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid level ID or score",
      });
    }

    const result = await completeGameLevel({
      userId,
      levelId,
      score,
    });

    return res.status(200).json({
      success: true,
      message: result.duplicate
        ? "Level was already completed"
        : "Level completed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Complete level error:", error);

    const clientErrors = [
      "Invalid user ID",
      "Invalid level ID",
      "Invalid score",
      "Invalid level",
      "Level is locked",
      "User not found",
    ];

    const status = clientErrors.includes(error.message) ? 400 : 500;

    return res.status(status).json({
      success: false,
      message: status === 500
        ? "Internal server error"
        : error.message,
    });
  }
};
