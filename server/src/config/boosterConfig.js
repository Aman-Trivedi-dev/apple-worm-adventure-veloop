
export const BOOSTERS = {
  REVIVE: {
    id: "REVIVE",
    name: "Revive",
    price: 30,
    description: "Continue the game after losing.",
  },

  DOUBLE_SCORE: {
    id: "DOUBLE_SCORE",
    name: "Double Score",
    price: 20,
    multiplier: 2,
    description: "Double your level score.",
  },

  DOUBLE_COINS: {
    id: "DOUBLE_COINS",
    name: "Double Coins",
    price: 25,
    multiplier: 2,
    description: "Double eligible coin rewards.",
  },

  EXTRA_MOVES: {
    id: "EXTRA_MOVES",
    name: "Extra Moves",
    price: 15,
    extraMoves: 10,
    description: "Get 10 additional moves.",
  },

  HINT: {
    id: "HINT",
    name: "Hint",
    price: 10,
    description: "Get help finding the next move.",
  },

  BOOSTER: {
    id: "BOOSTER",
    name: "Super Booster",
    price: 40,
    multiplier: 2,
    description: "Activate a temporary gameplay boost.",
  },
};

export const getBoosterConfig = (boosterId) =>
  BOOSTERS[boosterId] || null;
