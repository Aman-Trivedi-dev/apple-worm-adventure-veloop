
import { apiRequest } from "./api";

// Create a new rewarded ad session
export const createAdSession = async () => {
  return await apiRequest("/ad/session", {
    method: "POST",
  });
};

// Complete the ad and receive coins
export const completeAdReward = async (
  referenceId,
  completionToken
) => {
  return await apiRequest("/ad/complete", {
    method: "POST",
    body: JSON.stringify({
      referenceId,
      completionToken,
    }),
  });
};
