import { create } from "zustand";
import { contributionsAPI } from "../api/contributionsAPI";

const useContributionsStore = create((set, get) => ({
  contributions: [],
  currentContribution: null,
  loading: false,
  error: null,

  // Fetch all contributions (admin)
  fetchContributions: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.getAll(filters);
      set({ contributions: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Fetch user's contributions (parent)
  fetchMyContributions: async () => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.getMy();
      set({ contributions: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Fetch contributions by project
  fetchContributionsByProject: async (projectId) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.getByProject(projectId);
      set({ contributions: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Get single contribution
  getContribution: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.getById(id);
      set({ currentContribution: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Add new contribution
  addContribution: async (contributionData) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.create(contributionData);
      const newContribution = response.data;

      set((state) => ({
        contributions: [newContribution, ...state.contributions],
        loading: false,
      }));

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Update contribution
  updateContribution: async (id, contributionData) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.update(id, contributionData);
      const updatedContribution = response.data;

      set((state) => ({
        contributions: state.contributions.map((item) =>
          item.id === id ? updatedContribution : item
        ),
        currentContribution:
          state.currentContribution?.id === id
            ? updatedContribution
            : state.currentContribution,
        loading: false,
      }));

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Delete contribution
  deleteContribution: async (id) => {
    try {
      set({ loading: true, error: null });
      await contributionsAPI.delete(id);

      set((state) => ({
        contributions: state.contributions.filter((item) => item.id !== id),
        currentContribution:
          state.currentContribution?.id === id
            ? null
            : state.currentContribution,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Verify contribution
  verifyContribution: async (id, verificationData) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.verify(id, verificationData);
      const updatedContribution = response.data;

      set((state) => ({
        contributions: state.contributions.map((item) =>
          item.id === id ? updatedContribution : item
        ),
        currentContribution:
          state.currentContribution?.id === id
            ? updatedContribution
            : state.currentContribution,
        loading: false,
      }));

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Upload receipt
  uploadReceipt: async (contributionId, receiptFile) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.uploadReceipt(
        contributionId,
        receiptFile
      );
      const updatedContribution = response.data;

      set((state) => ({
        contributions: state.contributions.map((item) =>
          item.id === contributionId ? updatedContribution : item
        ),
        currentContribution:
          state.currentContribution?.id === contributionId
            ? updatedContribution
            : state.currentContribution,
        loading: false,
      }));

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Get contribution statistics
  getContributionStats: async (userId = null, projectId = null) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.getStats(userId, projectId);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Export contributions report
  exportContributions: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.export(filters);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Get recent contributions
  getRecentContributions: async (limit = 5) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.getRecent(limit);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Get top contributors
  getTopContributors: async (period = "month", limit = 10) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.getTopContributors(period, limit);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Search contributions
  searchContributions: async (query) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsAPI.search(query);
      set({ contributions: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Clear current contribution
  clearCurrentContribution: () => set({ currentContribution: null }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      contributions: [],
      currentContribution: null,
      loading: false,
      error: null,
    }),
}));

export { useContributionsStore };
