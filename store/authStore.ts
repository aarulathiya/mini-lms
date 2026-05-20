// store/authStore.ts
import { create } from "zustand";
import { apiClient } from "../lib/api";
import { secureStorage } from "../lib/storage"
import { User, LoginFormData, RegisterFormData } from "../types/index";
import { API_ENDPOINTS } from "../constants/index";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, data);
      const { user, accessToken, refreshToken } = response.data.data;

      await secureStorage.saveTokens({ accessToken, refreshToken });
      await secureStorage.saveUser(user);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message ?? "Login failed. Please try again.",
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(API_ENDPOINTS.REGISTER, data);
      set({ isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message ?? "Registration failed. Please try again.",
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch {
      // ignore API errors on logout
    } finally {
      await secureStorage.clearTokens();
      await secureStorage.clearUser();
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const [token, user] = await Promise.all([
        secureStorage.getAccessToken(),
        secureStorage.getUser(),
      ]);

      if (token && user) {
        // Validate token with API
        const response = await apiClient.get(API_ENDPOINTS.CURRENT_USER);
        const freshUser: User = response.data.data;
        await secureStorage.saveUser(freshUser);
        set({ user: freshUser, isAuthenticated: true });
      }
    } catch {
      await secureStorage.clearTokens();
      await secureStorage.clearUser();
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (user) => {
    set({ user });
    secureStorage.saveUser(user).catch(() => {});
  },

  clearError: () => set({ error: null }),
}));
