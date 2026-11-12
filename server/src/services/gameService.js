
import User from "../models/User.js";

// Fetch a user's game progress
export const fetchGameProgress = async (userId) => {
  const user = await User.findById(userId)
    .select("username totalScore coins unlockedLevel")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return {
    username: user.username,
    totalScore: user.totalScore,
    coins: user.coins,
    unlockedLevel: user.unlockedLevel,
  };
};
