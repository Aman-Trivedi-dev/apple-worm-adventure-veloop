
import api from "./api";

// Fetch the player's booster inventory
export const getBoosterInventory = async () => {
  const response = await api("/booster/inventory", {
    method: "GET",
  });

  return response.inventory;
};

// Activate and consume a booster
export const activateBooster = async (boosterId) => {
  const response = await api("/booster/activate", {
    method: "POST",
    body: JSON.stringify({
      boosterId,
    }),
  });

  return response;
};

// Purchase a booster
export const purchaseBooster = async (boosterId, referenceId) => {
  const response = await api("/booster/purchase", {
    method: "POST",
    body: JSON.stringify({
      boosterId,
      referenceId,
    }),
  });

  return response;
};
