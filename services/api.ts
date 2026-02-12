// services/api.ts
import axios from "axios";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://attendance.edgesoftwares.in/";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

let currentToken: string | null = null;

export const setApiToken = (token: string | null): void => {
  currentToken = token;
  if (token) {
    console.log("[api] setApiToken, token set");
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    console.log("[api] setApiToken, token cleared");
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use((config) => {
  if (currentToken && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  console.log("[api] Request:", {
    url: config.url,
    method: config.method,
    headers: config.headers,
  });
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("[api] Response error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      // keep token while debugging
      // if (error.response.status === 401) {
      //   console.log("[api] 401 -> clearing token");
      //   setApiToken(null);
      // }
    } else {
      console.log("[api] Network/other error:", error.message);
    }
    return Promise.reject(error);
  }
);

console.log("API BASE_URL =", BASE_URL);

export default api;
