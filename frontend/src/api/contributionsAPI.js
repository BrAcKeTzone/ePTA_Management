import { apiClient } from "./apiClient";

export const contributionsAPI = {
  // Get all contributions (admin)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await apiClient.get(`/contributions?${params}`);
  },

  // Get user's contributions (parent)
  getMy: async () => {
    return await apiClient.get("/contributions/my");
  },

  // Get contributions by project
  getByProject: async (projectId) => {
    return await apiClient.get(`/contributions/project/${projectId}`);
  },

  // Get contribution by ID
  getById: async (id) => {
    return await apiClient.get(`/contributions/${id}`);
  },

  // Create new contribution
  create: async (contributionData) => {
    return await apiClient.post("/contributions", contributionData);
  },

  // Update contribution
  update: async (id, contributionData) => {
    return await apiClient.put(`/contributions/${id}`, contributionData);
  },

  // Delete contribution
  delete: async (id) => {
    return await apiClient.delete(`/contributions/${id}`);
  },

  // Verify contribution (admin)
  verify: async (id, verificationData) => {
    return await apiClient.post(
      `/contributions/${id}/verify`,
      verificationData
    );
  },

  // Upload receipt
  uploadReceipt: async (contributionId, receiptFile) => {
    const formData = new FormData();
    formData.append("receipt", receiptFile);

    return await apiClient.post(
      `/contributions/${contributionId}/receipt`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // Get contribution statistics
  getStats: async (userId = null, projectId = null) => {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (projectId) params.append("projectId", projectId);

    return await apiClient.get(`/contributions/stats?${params}`);
  },

  // Export contributions report
  export: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await apiClient.get(`/contributions/export?${params}`, {
      responseType: "blob",
    });
  },

  // Get recent contributions
  getRecent: async (limit = 5) => {
    return await apiClient.get(`/contributions/recent?limit=${limit}`);
  },

  // Get top contributors
  getTopContributors: async (period = "month", limit = 10) => {
    return await apiClient.get(
      `/contributions/top-contributors?period=${period}&limit=${limit}`
    );
  },

  // Search contributions
  search: async (query) => {
    return await apiClient.get(
      `/contributions/search?q=${encodeURIComponent(query)}`
    );
  },

  // Get contribution summary by date range
  getSummary: async (startDate, endDate) => {
    return await apiClient.get("/contributions/summary", {
      params: { startDate, endDate },
    });
  },

  // Get contribution trends
  getTrends: async (period = "month") => {
    return await apiClient.get(`/contributions/trends?period=${period}`);
  },

  // Get contributions by status
  getByStatus: async (status) => {
    return await apiClient.get(`/contributions/status/${status}`);
  },

  // Bulk verify contributions
  bulkVerify: async (contributionIds, verificationData) => {
    return await apiClient.post("/contributions/bulk-verify", {
      contributionIds,
      ...verificationData,
    });
  },
};
