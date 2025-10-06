import { fetchClient } from "../utils/fetchClient";
import { dummyDataService } from "../services/dummyDataService";
import config from "../config";

const API_BASE = "/api/auth";

export const authApi = {
  // Login
  login: async (credentials) => {
    if (config.USE_DUMMY_DATA) {
      const response = await dummyDataService.login(
        credentials.email,
        credentials.password
      );
      return response;
    }

    const response = await fetchClient.post(`${API_BASE}/login`, credentials);
    return response.data;
  },

  // Registration Process
  register: async (userData) => {
    if (config.USE_DUMMY_DATA) {
      const response = await dummyDataService.register(userData);
      return response;
    }

    const response = await fetchClient.post(`${API_BASE}/register`, userData);
    return response.data;
  },

  // OTP Management (dummy implementation for demo)
  sendOtp: async (email) => {
    if (config.USE_DUMMY_DATA) {
      // Simulate OTP sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "OTP sent successfully",
        data: { otpSent: true },
      };
    }

    const response = await fetchClient.post(`${API_BASE}/send-otp`, { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    if (config.USE_DUMMY_DATA) {
      // Simulate OTP verification (accept any 6-digit number)
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        return {
          success: true,
          message: "OTP verified successfully",
          data: { verified: true },
        };
      } else {
        throw new Error("Invalid OTP");
      }
    }

    const response = await fetchClient.post(`${API_BASE}/verify-otp`, {
      email,
      otp,
    });
    return response.data;
  },

  // Password Reset
  sendOtpForReset: async (email) => {
    if (config.USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Reset OTP sent successfully",
        data: { otpSent: true },
      };
    }

    const response = await fetchClient.post(`${API_BASE}/send-otp-reset`, {
      email,
    });
    return response.data;
  },

  verifyOtpForReset: async (email, otp) => {
    if (config.USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        return {
          success: true,
          message: "Reset OTP verified successfully",
          data: { verified: true },
        };
      } else {
        throw new Error("Invalid reset OTP");
      }
    }

    const response = await fetchClient.post(`${API_BASE}/verify-otp-reset`, {
      email,
      otp,
    });
    return response.data;
  },

  resetPassword: async (email, otp, password) => {
    if (config.USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Password reset successfully",
        data: { passwordReset: true },
      };
    }

    const response = await fetchClient.post(`${API_BASE}/reset-password`, {
      email,
      otp,
      password,
    });
    return response.data;
  },

  // Password Change
  sendOtpForChange: async (email, password) => {
    if (config.USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Change OTP sent successfully",
        data: { otpSent: true },
      };
    }

    const response = await fetchClient.post(`${API_BASE}/send-otp-change`, {
      email,
      password,
    });
    return response.data;
  },

  verifyOtpForChange: async (email, otp) => {
    if (config.USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        return {
          success: true,
          message: "Change OTP verified successfully",
          data: { verified: true },
        };
      } else {
        throw new Error("Invalid change OTP");
      }
    }

    const response = await fetchClient.post(`${API_BASE}/verify-otp-change`, {
      email,
      otp,
    });
    return response.data;
  },

  changePassword: async (email, oldPassword, otp, newPassword) => {
    if (config.USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Password changed successfully",
        data: { passwordChanged: true },
      };
    }

    const response = await fetchClient.post(`${API_BASE}/change-password`, {
      email,
      oldPassword,
      otp,
      newPassword,
    });
    return response.data;
  },

  // Profile Management
  getProfile: async () => {
    if (config.USE_DUMMY_DATA) {
      // Get current user from localStorage (simulated)
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          success: true,
          data: user,
        };
      } else {
        throw new Error("No user profile found");
      }
    }

    const response = await fetchClient.get(`${API_BASE}/profile`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    if (config.USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update local storage user data
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        return {
          success: true,
          message: "Profile updated successfully",
          data: updatedUser,
        };
      } else {
        throw new Error("No user profile found");
      }
    }

    const response = await fetchClient.put(`${API_BASE}/profile`, profileData);
    return response.data;
  },
};
