
export const formatScore = (score) => {
  return Number(score || 0).toLocaleString("en-IN");
};

export const formatCoins = (coins) => {
  return Number(coins || 0).toLocaleString("en-IN");
};

export const formatLevel = (level) => {
  return `Level ${level}`;
};

export const formatPercentage = (value) => {
  return `${Math.round(Number(value) || 0)}%`;
};
