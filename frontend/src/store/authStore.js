import { create } from "zustand";
import { authAPI } from "../api/authAPI";

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,

  // Initialize auth state
  initialize: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        set({ loading: true });
        const user = await authAPI.getCurrentUser();
        set({ user, token, loading: false });
      } catch (error) {
        localStorage.removeItem("token");
        set({ user: null, token: null, loading: false, error: error.message });
      }
    }
  },

  // Login
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      set({ user, token, loading: false });

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.register(userData);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.verifyOTP(email, otp);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Resend OTP
  resendOTP: async (email) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.resendOTP(email);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.forgotPassword(email);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Reset Password
  resetPassword: async (token, password) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.resetPassword(token, password);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Update Profile
  updateProfile: async (profileData) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.updateProfile(profileData);
      const { user } = response.data;
      set({ user, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.changePassword(
        currentPassword,
        newPassword
      );
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, loading: false, error: null });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Check if user is authenticated
  isAuthenticated: () => {
    const { token, user } = get();
    return !!(token && user);
  },

  // Check if user has specific role
  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin: () => {
    const { user } = get();
    return user?.role === "ADMIN";
  },

  // Check if user is parent
  isParent: () => {
    const { user } = get();
    return user?.role === "PARENT";
  },
}));

export { useAuthStore };
