
const getDifficulty = (id) => {
  if (id <= 15) return "Easy";
  if (id <= 25) return "Medium";
  if (id <= 40) return "Hard";
  return "Expert";
};

// Configurable reward for each level.
const getReward = (id) => {
  if (id <= 15) return 10 + (id - 1) * 2;
  if (id <= 25) return 40 + (id - 16) * 3;
  if (id <= 40) return 75 + (id - 26) * 4;
  return 140 + (id - 41) * 5;
};

// Generate all 50 level configurations.
export const GAME_LEVELS = Array.from(
  { length: 50 },
  (_, index) => {
    const id = index + 1;

    return {
      id,
      difficulty: getDifficulty(id),
      reward: getReward(id),
    };
  }
);

export const getLevelConfig = (levelId) =>
  GAME_LEVELS.find((level) => level.id === levelId) || null;

export const MAX_LEVELS = GAME_LEVELS.length;
