
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = async (endpoint, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      ...(restOptions.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Named export for Login.jsx and other existing files
export const apiRequest = api;

// Default export for gameService.js and walletService.js
export default api;
