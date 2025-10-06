import { apiClient } from "./apiClient";

export const authAPI = {
  // Login
  login: async (credentials) => {
    return await apiClient.post("/auth/login", credentials);
  },

  // Register
  register: async (userData) => {
    return await apiClient.post("/auth/register", userData);
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    return await apiClient.post("/auth/verify-otp", { email, otp });
  },

  // Resend OTP
  resendOTP: async (email) => {
    return await apiClient.post("/auth/resend-otp", { email });
  },

  // Forgot Password
  forgotPassword: async (email) => {
    return await apiClient.post("/auth/forgot-password", { email });
  },

  // Reset Password
  resetPassword: async (token, password) => {
    return await apiClient.post("/auth/reset-password", { token, password });
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Update Profile
  updateProfile: async (profileData) => {
    return await apiClient.put("/auth/profile", profileData);
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    return await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  // Refresh Token
  refreshToken: async () => {
    return await apiClient.post("/auth/refresh");
  },

  // Logout
  logout: async () => {
    return await apiClient.post("/auth/logout");
  },
};
