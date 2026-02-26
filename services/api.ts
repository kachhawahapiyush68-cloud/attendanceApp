// services/api.ts
import axios from "axios";

let rawBase =
  process.env.EXPO_PUBLIC_API_URL || "https://attendance.edgesoftwares.in";
if (rawBase.endsWith("/")) rawBase = rawBase.slice(0, -1);

const BASE_URL = rawBase;

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
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use((config) => {
  if (currentToken && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
