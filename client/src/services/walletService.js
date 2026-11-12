
import api from "./api";

// Get the user's current wallet balance
export const getWalletBalance = async () => {
  const response = await api("/wallet/balance", {
    method: "GET",
  });

  return response.balance;
};

// Get the user's wallet transaction history
export const getWalletHistory = () => {
  return api("/wallet/history", {
    method: "GET",
  });
};
