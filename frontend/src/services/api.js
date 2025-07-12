import axios from "axios";
// Add jwt-decode import if available, otherwise use inline decoder
let jwtDecode;
try {
  jwtDecode = require("jwt-decode");
} catch (e) {
  jwtDecode = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      return {};
    }
  };
}

export function isTokenExpired(token) {
  if (!token) return true;
  const decoded = jwtDecode(token);
  if (!decoded || !decoded.exp) return true;
  const now = Date.now() / 1000;
  return decoded.exp < now;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  // credentials: { email, password, role }
  login: async (credentials) => {
    return api.post("/auth/login", credentials);
  },

  register: async (userData) => {
    return api.post("/auth/register", userData);
  },

  logout: async () => {
    return api.post("/auth/logout");
  },

  getCurrentUser: async () => {
    return api.get("/auth/me");
  },

  updateProfile: async (userData) => {
    return api.put("/auth/profile", userData);
  },
};

export const itemsAPI = {
  getItems: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/items?${params}`);
  },

  getMyItems: async () => {
    return api.get("/items/my-items");
  },

  getItem: async (id) => {
    return api.get(`/items/${id}`);
  },

  createItem: async (itemData) => {
    return api.post("/items", itemData);
  },

  updateItem: async (id, itemData) => {
    return api.put(`/items/${id}`, itemData);
  },

  deleteItem: async (id) => {
    return api.delete(`/items/${id}`);
  },

  toggleLike: async (itemId) => {
    return api.post(`/items/${itemId}/like`);
  },
};

export const swapsAPI = {
  getSwaps: async () => {
    return api.get("/swaps");
  },

  createSwapRequest: async (swapData) => {
    return api.post("/swaps/request", swapData);
  },

  respondToSwap: async (swapId, action, notes) => {
    return api.put(`/swaps/${swapId}/respond`, { action, notes });
  },

  completeSwap: async (swapId) => {
    return api.put(`/swaps/${swapId}/complete`);
  },

  getSwap: async (swapId) => {
    return api.get(`/swaps/${swapId}`);
  },
};

export const pointsAPI = {
  getBalance: async () => {
    return api.get("/points/balance");
  },

  getHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/points/history?${params}`);
  },

  redeemItem: async (itemId, pointsUsed) => {
    return api.post(`/points/redeem/${itemId}`, { pointsUsed });
  },

  getLeaderboard: async (limit = 10) => {
    return api.get(`/points/leaderboard?limit=${limit}`);
  },

  getStats: async () => {
    return api.get("/points/stats");
  },
};

export const dashboardAPI = {
  getDashboardData: async () => {
    return api.get("/dashboard");
  },
};

export const adminAPI = {
  getDashboard: async () => {
    return api.get("/admin/dashboard");
  },

  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/admin/users?${params}`);
  },

  updateUser: async (userId, userData) => {
    return api.put(`/admin/users/${userId}`, userData);
  },

  getPendingItems: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/admin/items?${params}`);
  },

  approveItem: async (itemId, approvalData) => {
    return api.put(`/admin/items/${itemId}/approve`, approvalData);
  },

  removeItem: async (itemId) => {
    return api.delete(`/admin/items/${itemId}`);
  },

  getPendingSwaps: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/admin/swaps/pending?${params}`);
  },

  adjustPoints: async (userId, delta, reason, description) => {
    return api.post("/admin/points/adjust", {
      userId,
      delta,
      reason,
      description,
    });
  },
};

export const apiUtils = {
  setToken: (token) => {
    localStorage.setItem("token", token);
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  removeToken: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default {
  auth: authAPI,
  items: itemsAPI,
  swaps: swapsAPI,
  points: pointsAPI,
  admin: adminAPI,
  utils: apiUtils,
};
