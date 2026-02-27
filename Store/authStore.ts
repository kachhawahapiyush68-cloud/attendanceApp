// Store/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { setApiToken } from "../services/api";

type Role = "admin" | "employee" | null;

interface AuthState {
  token: string | null;
  role: Role;
  userId: string | null;
  userName: string | null;
  email: string | null;
  isLoading: boolean;
  setAuth: (
    token: string,
    role: Role,
    userId: string,
    userName: string,
    email?: string | null
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  userId: null,
  userName: null,
  email: null,
  isLoading: false,

  setAuth: async (token, role, userId, userName, email = null) => {
    set({ isLoading: true });

    const safeRole: Role =
      role === "admin" || role === "employee" ? role : null;
    const safeUserId = userId || "";
    const safeUserName = userName || userId || "User";

    try {
      await Promise.all([
        SecureStore.setItemAsync("token", token),
        SecureStore.setItemAsync("role", safeRole || ""),
        SecureStore.setItemAsync("userId", safeUserId),
        SecureStore.setItemAsync("userName", safeUserName),
        SecureStore.setItemAsync("email", email || ""),
      ]);
    } catch (err) {
      console.log("SecureStore setItem error:", err);
    }

    setApiToken(token);
    set({
      token,
      role: safeRole,
      userId: safeUserId || null,
      userName: safeUserName,
      email: email || null,
      isLoading: false,
    });
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        SecureStore.deleteItemAsync("token").catch(() => {}),
        SecureStore.deleteItemAsync("role").catch(() => {}),
        SecureStore.deleteItemAsync("userId").catch(() => {}),
        SecureStore.deleteItemAsync("userName").catch(() => {}),
        SecureStore.deleteItemAsync("email").catch(() => {}),
      ]);
    } catch (err) {
      console.log("SecureStore deleteItem error:", err);
    }

    setApiToken(null);
    set({
      token: null,
      role: null,
      userId: null,
      userName: null,
      email: null,
      isLoading: false,
    });
  },

  loadAuth: async () => {
    set({ isLoading: true });
    try {
      const [token, roleValue, userIdValue, userNameValue, emailValue] =
        await Promise.all([
          SecureStore.getItemAsync("token"),
          SecureStore.getItemAsync("role"),
          SecureStore.getItemAsync("userId"),
          SecureStore.getItemAsync("userName"),
          SecureStore.getItemAsync("email"),
        ]);

      let role: Role = null;
      if (roleValue === "admin" || roleValue === "employee") {
        role = roleValue as Role;
      }

      if (token && role) {
        setApiToken(token);
        set({
          token,
          role,
          userId: userIdValue || null,
          userName: userNameValue || null,
          email: emailValue || null,
          isLoading: false,
        });
        return;
      }
    } catch (err) {
      console.log("SecureStore getItem error:", err);
    }

    set({
      token: null,
      role: null,
      userId: null,
      userName: null,
      email: null,
      isLoading: false,
    });
  },
}));

export const useDisplayName = () => {
  const { userName, userId } = useAuthStore();
  return userName || userId || "User";
};
