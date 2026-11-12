
import api from "./api";

// Fetch the logged-in player's progress from the backend
export const getGameProgress = async () => {
  const response = await api("/game/progress", {
    method: "GET",
  });

  return response.progress;
};

// Save completed level to the backend
export const completeGameLevel = async (levelId, score) => {
  const response = await api("/game/complete", {
    method: "POST",
    body: JSON.stringify({
      levelId,
      score,
    }),
  });

  return response;
};
