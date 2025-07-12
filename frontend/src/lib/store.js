import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI, apiUtils, isTokenExpired } from "../services/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpired: false,

      login: async (credentials) => {
        set({ isLoading: true, error: null, sessionExpired: false });
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response.data;

          apiUtils.setToken(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionExpired: false,
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Login failed",
            sessionExpired: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null, sessionExpired: false });
        try {
          const response = await authAPI.register(userData);
          const { user, token } = response.data;

          apiUtils.setToken(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionExpired: false,
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Registration failed",
            sessionExpired: false,
          });
          throw error;
        }
      },

      logout: async (expired = false) => {
        try {
          await authAPI.logout();
        } catch (error) {
          // Even if the API call fails, we still want to logout locally
        } finally {
          apiUtils.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            sessionExpired: expired,
          });
        }
      },

      getCurrentUser: async () => {
        const token = apiUtils.getToken();
        if (!token) return;
        if (isTokenExpired(token)) {
          get().logout(true);
          return;
        }
        try {
          const response = await authAPI.getCurrentUser();
          set({
            user: response.data,
            isAuthenticated: true,
            sessionExpired: false,
          });
        } catch (error) {
          get().logout(true);
        }
      },

      checkTokenExpiry: () => {
        const token = apiUtils.getToken();
        if (!token || isTokenExpired(token)) {
          get().logout(true);
        }
      },

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateProfile(userData);
          set({
            user: response.data,
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Profile update failed",
          });
          throw error;
        }
      },

      clearError: () => set({ error: null, sessionExpired: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sessionExpired: state.sessionExpired,
      }),
    }
  )
);

export const useItemsStore = create((set, get) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
    category: "",
    type: "",
    size: "",
    condition: "",
    search: "",
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  setItems: (items) => set({ items }),
  setCurrentItem: (item) => set({ currentItem: item }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),

  clearError: () => set({ error: null }),
}));

export const useSwapsStore = create((set, get) => ({
  swaps: [],
  currentSwap: null,
  isLoading: false,
  error: null,

  setSwaps: (swaps) => set({ swaps }),
  setCurrentSwap: (swap) => set({ currentSwap: swap }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));

export const usePointsStore = create((set, get) => ({
  balance: 0,
  history: [],
  leaderboard: [],
  isLoading: false,
  error: null,

  setBalance: (balance) => set({ balance }),
  setHistory: (history) => set({ history }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
