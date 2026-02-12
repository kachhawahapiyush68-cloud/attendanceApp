// services/authService.ts
import { api, setApiToken } from "./api";
import { useAuthStore } from "../Store/authStore";

interface LoginResponse {
  token: string;
  role: "admin" | "employee";
  username?: string | null;
  user_id?: string;
  email?: string | null;
  name?: string | null;
}

interface RegisterResponse {
  id: number;
  role: "admin" | "employee";
  username?: string | null;
  user_id: string;
  email: string;
  mobileNo?: string;
}

/**
 * Common handler for login-like responses that DO return a token.
 */
async function handleAuthSuccess(
  response: { data: LoginResponse },
  fallbackUserId: string,
  fallbackEmail?: string
) {
  const {
    token,
    role,
    username,
    user_id: userIdFromServer,
    name,
    email,
  } = response.data;

  if (!token) {
    throw new Error("No token returned from server");
  }

  const safeUserId = userIdFromServer || fallbackUserId;
  const safeName = username || name || safeUserId;
  const safeEmail = email || fallbackEmail || null;

  console.log("[authService] handleAuthSuccess:", {
    role,
    safeUserId,
    safeName,
    safeEmail,
  });

  // set token on axios instance
  setApiToken(token);

  // persist auth in store
  await useAuthStore
    .getState()
    .setAuth(token, role, safeUserId, safeName, safeEmail);

  return response.data;
}

/**
 * LOGIN – expects token from /auth/login
 */
export async function login(user_id: string, pin: string) {
  try {
    console.log("[authService] login start:", { user_id });
    const response = await api.post<LoginResponse>("/auth/login", {
      user_id,
      pin,
    });

    console.log("[authService] login response:", response.data);

    return await handleAuthSuccess(response, user_id);
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error.message || "Login failed";
    console.log("[authService] login error:", message);
    throw new Error(message);
  }
}

/**
 * REGISTER ADMIN – /auth/register does NOT return token
 * So DO NOT call handleAuthSuccess here.
 */
export async function registerAdmin(data: {
  user_id: string;
  pin: string;
  email: string;
  name?: string;
  address?: string;
  mobileNo?: string;
  photo?: string;
  latitude?: number;
  longitude?: number;
}) {
  try {
    console.log("[authService] registerAdmin start:", { user_id: data.user_id });

    const payload = { ...data, role: "admin" as const };

    // Backend returns: { id, role, username, user_id, email, mobileNo }
    const response = await api.post<RegisterResponse>("/auth/register", payload);

    console.log("[authService] registerAdmin response:", response.data);

    // just return created admin data; no token / no login here
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Admin registration failed";
    console.log("[authService] registerAdmin error:", message);
    throw new Error(message);
  }
}

/**
 * REGISTER EMPLOYEE – /auth/register does NOT return token
 * So DO NOT call handleAuthSuccess here.
 */
export async function registerEmployee(data: {
  user_id: string;
  pin: string;
  email: string;
  name?: string;
  address?: string;
  mobileNo?: string;
  photo?: string;
  latitude?: number;
  longitude?: number;
}) {
  try {
    console.log("[authService] registerEmployee start:", {
      user_id: data.user_id,
    });

    const payload = { ...data, role: "employee" as const };

    // Backend returns: { id, role, username, user_id, email, mobileNo }
    const response = await api.post<RegisterResponse>("/auth/register", payload);

    console.log("[authService] registerEmployee response:", response.data);

    // just return created employee data; no token / no login here
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Employee registration failed";
    console.log("[authService] registerEmployee error:", message);
    throw new Error(message);
  }
}
