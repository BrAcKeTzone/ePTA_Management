import { fetchClient } from "../utils/fetchClient";
import { dummyDataService } from "../services/dummyDataService";

const API_BASE = "/api/users";

// Toggle between dummy data and real API
const USE_DUMMY_DATA = true;

export const userApi = {
  // Get current user profile
  getCurrentUser: async () => {
    if (USE_DUMMY_DATA) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          await new Promise((resolve) => setTimeout(resolve, 300));
          return { data: user };
        } catch (error) {
          // Invalid JSON in localStorage, clear it
          localStorage.removeItem("user");
          throw new Error("Invalid user data in storage");
        }
      } else {
        // Return null instead of throwing error to allow graceful handling
        return { data: null };
      }
    }

    const response = await fetchClient.get(`${API_BASE}/me`);
    return response.data;
  },

  // Update current user profile
  updateCurrentUser: async (userData) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return { data: updatedUser };
    }

    const response = await fetchClient.put(`${API_BASE}/me`, userData);
    return response.data;
  },

  // Get all users with pagination and filtering
  getAllUsers: async (options = {}) => {
    if (USE_DUMMY_DATA) {
      const response = await dummyDataService.getUsers(options);
      return { data: response.data };
    }

    const params = new URLSearchParams();

    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.role) params.append("role", options.role);
    if (options.search) params.append("search", options.search);
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

    const response = await fetchClient.get(url);
    return response.data;
  },

  // Get all parents with pagination and filtering
  getAllParents: async (options = {}) => {
    if (USE_DUMMY_DATA) {
      const parentOptions = { ...options, role: "PARENT" };
      const response = await dummyDataService.getUsers(parentOptions);
      return { data: response.data };
    }

    const params = new URLSearchParams();

    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.search) params.append("search", options.search);
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);
    if (options.verified)
      params.append("verified", options.verified.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE}/parents?${queryString}`
      : `${API_BASE}/parents`;

    const response = await fetchClient.get(url);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    if (USE_DUMMY_DATA) {
      const response = await dummyDataService.getStats();
      return { data: response.data.users };
    }

    const response = await fetchClient.get(`${API_BASE}/stats`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    if (USE_DUMMY_DATA) {
      const response = await dummyDataService.getUserById(userId);
      return { data: response.data };
    }

    const response = await fetchClient.get(`${API_BASE}/${userId}`);
    return response.data;
  },

  // Create new user (Admin only)
  createUser: async (userData) => {
    if (USE_DUMMY_DATA) {
      const response = await dummyDataService.register(userData);
      return { data: response.data };
    }

    const response = await fetchClient.post(API_BASE, userData);
    return response.data;
  },

  // Create new admin (Super Admin only)
  createAdmin: async (adminData) => {
    if (USE_DUMMY_DATA) {
      const adminUser = { ...adminData, role: "ADMIN" };
      const response = await dummyDataService.register(adminUser);
      return { data: response.data };
    }

    const response = await fetchClient.post(`${API_BASE}/admin`, adminData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        data: {
          id: userId,
          ...userData,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    const response = await fetchClient.put(`${API_BASE}/${userId}`, userData);
    return response.data;
  },

  // Update user password
  updateUserPassword: async (userId, passwordData) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        data: {
          success: true,
          message: "Password updated successfully",
        },
      };
    }

    const response = await fetchClient.put(
      `${API_BASE}/${userId}/password`,
      passwordData
    );
    return response.data;
  },

  // Deactivate user (soft delete)
  deactivateUser: async (userId) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        data: {
          id: userId,
          isActive: false,
          deactivatedAt: new Date().toISOString(),
        },
      };
    }

    const response = await fetchClient.patch(
      `${API_BASE}/${userId}/deactivate`
    );
    return response.data;
  },

  // Reactivate user
  reactivateUser: async (userId) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        data: {
          id: userId,
          isActive: true,
          reactivatedAt: new Date().toISOString(),
        },
      };
    }

    const response = await fetchClient.patch(
      `${API_BASE}/${userId}/reactivate`
    );
    return response.data;
  },

  // Delete user (hard delete - use with caution)
  deleteUser: async (userId) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      return {
        data: {
          success: true,
          message: "User deleted successfully",
        },
      };
    }

    const response = await fetchClient.delete(`${API_BASE}/${userId}`);
    return response.data;
  },

  // Archive old records
  archiveOldRecords: async (beforeDate) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        data: {
          archivedCount: 5,
          message: "Records archived successfully",
        },
      };
    }

    const response = await fetchClient.post(`${API_BASE}/archive`, {
      beforeDate,
    });
    return response.data;
  },

  // Search users
  searchUsers: async (searchTerm, role = null) => {
    if (USE_DUMMY_DATA) {
      const searchOptions = { search: searchTerm };
      if (role) searchOptions.role = role;

      const response = await dummyDataService.getUsers(searchOptions);
      return { data: response.data.users || response.data };
    }

    const params = new URLSearchParams();
    params.append("q", searchTerm);
    if (role) params.append("role", role);

    const response = await fetchClient.get(
      `${API_BASE}/search?${params.toString()}`
    );
    return response.data;
  },

  // Bulk operations
  bulkUpdateUsers: async (userIds, updateData) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return {
        data: {
          updatedCount: userIds.length,
          message: "Users updated successfully",
        },
      };
    }

    const response = await fetchClient.patch(`${API_BASE}/bulk-update`, {
      userIds,
      updateData,
    });
    return response.data;
  },

  // Export users
  exportUsers: async (options = {}) => {
    if (USE_DUMMY_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a fake CSV data
      const csvData = `ID,Name,Email,Role,Phone,Status\n1,Maria Santos,admin@jhcsc.edu.ph,ADMIN,+63-912-345-6789,Active\n2,Juan Dela Cruz,parent1@gmail.com,PARENT,+63-917-123-4567,Active`;

      return new Blob([csvData], { type: "text/csv" });
    }

    const params = new URLSearchParams();
    if (options.role) params.append("role", options.role);
    if (options.format) params.append("format", options.format);

    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE}/export?${queryString}`
      : `${API_BASE}/export`;

    const response = await fetchClient.get(url, {
      responseType: "blob",
    });
    return response.data;
  },
};

export default userApi;
