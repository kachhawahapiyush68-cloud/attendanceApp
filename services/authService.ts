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
  photo?: string | null;
}

interface RegisterResponse {
  id: number;
  role: "admin" | "employee";
  username?: string | null;
  user_id: string;
  email: string;
  mobileNo?: string;
  photo?: string | null;
}

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

  setApiToken(token);

  await useAuthStore
    .getState()
    .setAuth(token, role, safeUserId, safeName, safeEmail);

  return response.data;
}

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

// If you also register admins with selfie, mirror the same pattern.
export async function registerAdmin(data: {
  user_id: string;
  pin: string;
  email: string;
  name?: string;
  address?: string;
  mobileNo?: string;
  photoUri: string;
  latitude?: number;
  longitude?: number;
}) {
  try {
    console.log("[authService] registerAdmin start:", { user_id: data.user_id });

    const form = new FormData();
    form.append("user_id", data.user_id);
    form.append("pin", data.pin);
    form.append("role", "admin");
    form.append("email", data.email);
    if (data.name) form.append("name", data.name);
    if (data.address) form.append("address", data.address);
    if (data.mobileNo) form.append("mobileNo", data.mobileNo);
    if (typeof data.latitude === "number")
      form.append("latitude", String(data.latitude));
    if (typeof data.longitude === "number")
      form.append("longitude", String(data.longitude));
    form.append("photo", {
      uri: data.photoUri,
      name: "selfie.jpg",
      type: "image/jpeg",
    } as any);

    const response = await api.post<RegisterResponse>("/auth/register", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("[authService] registerAdmin response:", response.data);

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

export async function registerEmployee(data: {
  user_id: string;
  pin: string;
  email: string;
  name?: string;
  address?: string;
  mobileNo?: string;
  photoUri: string;
  latitude?: number;
  longitude?: number;
}) {
  try {
    console.log("[authService] registerEmployee start:", {
      user_id: data.user_id,
    });

    const form = new FormData();
    form.append("user_id", data.user_id);
    form.append("pin", data.pin);
    form.append("role", "employee");
    form.append("email", data.email);
    if (data.name) form.append("name", data.name);
    if (data.address) form.append("address", data.address);
    if (data.mobileNo) form.append("mobileNo", data.mobileNo);
    if (typeof data.latitude === "number")
      form.append("latitude", String(data.latitude));
    if (typeof data.longitude === "number")
      form.append("longitude", String(data.longitude));
    form.append("photo", {
      uri: data.photoUri,
      name: "selfie.jpg",
      type: "image/jpeg",
    } as any);

    const response = await api.post<RegisterResponse>("/auth/register", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("[authService] registerEmployee response:", response.data);

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
