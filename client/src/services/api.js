// src/services/api.js
// The base URL already ends with /api, so endpoints should look like "/auth/login".
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // fetch only throws on network failure (server down, CORS blocked, etc.)
    throw new Error("Cannot reach the server. Please try again.");
  }

  // Don't crash if the server returns an empty or non-JSON body
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}