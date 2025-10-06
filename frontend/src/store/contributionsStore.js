import { create } from "zustand";
import { contributionsApi } from "../api/contributionsApi";

export const useContributionsStore = create((set, get) => ({
  // State
  contributions: [],
  myContributions: [],
  balance: {},
  paymentBasis: {},
  loading: false,
  error: null,

  // Admin actions
  fetchAllContributions: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsApi.getAllContributions(params);
      set({ contributions: response.data || [], loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch contributions",
        loading: false,
      });
    }
  },

  recordContribution: async (contributionData) => {
    try {
      set({ loading: true, error: null });
      await contributionsApi.recordContribution(contributionData);
      // Refresh contributions list
      await get().fetchAllContributions();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to record contribution",
        loading: false,
      });
      throw error;
    }
  },

  updateContribution: async (contributionId, contributionData) => {
    try {
      set({ loading: true, error: null });
      await contributionsApi.updateContribution(
        contributionId,
        contributionData
      );
      // Refresh contributions list
      await get().fetchAllContributions();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update contribution",
        loading: false,
      });
      throw error;
    }
  },

  verifyContribution: async (contributionId) => {
    try {
      set({ loading: true, error: null });
      await contributionsApi.verifyContribution(contributionId);
      // Refresh contributions list
      await get().fetchAllContributions();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to verify contribution",
        loading: false,
      });
      throw error;
    }
  },

  deleteContribution: async (contributionId) => {
    try {
      set({ loading: true, error: null });
      await contributionsApi.deleteContribution(contributionId);
      // Refresh contributions list
      await get().fetchAllContributions();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete contribution",
        loading: false,
      });
      throw error;
    }
  },

  // Parent actions
  fetchMyContributions: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsApi.getMyContributions(params);
      set({ myContributions: response.data || [], loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch contributions",
        loading: false,
      });
    }
  },

  fetchMyBalance: async () => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsApi.getMyBalance();
      set({ balance: response.data || {}, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch balance",
        loading: false,
      });
    }
  },

  fetchPaymentBasis: async () => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsApi.getPaymentBasis();
      set({ paymentBasis: response.data || {}, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch payment basis",
        loading: false,
      });
    }
  },

  // Report generation
  generateFinancialReport: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsApi.generateFinancialReport(params);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to generate report",
        loading: false,
      });
      throw error;
    }
  },

  exportFinancialReportPDF: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsApi.exportFinancialReportPDF(params);
      set({ loading: false });
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to export PDF",
        loading: false,
      });
      throw error;
    }
  },

  exportFinancialReportCSV: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await contributionsApi.exportFinancialReportCSV(params);
      set({ loading: false });
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to export CSV",
        loading: false,
      });
      throw error;
    }
  },

  // Payment basis management
  updatePaymentBasisSettings: async (settings) => {
    try {
      set({ loading: true, error: null });
      await contributionsApi.updatePaymentBasisSettings(settings);
      // Refresh payment basis
      await get().fetchPaymentBasis();
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to update payment basis",
        loading: false,
      });
      throw error;
    }
  },

  // Statistics and summaries
  getContributionSummary: () => {
    const { contributions } = get();
    return {
      total: contributions.length,
      totalAmount: contributions.reduce((sum, c) => sum + c.amount, 0),
      verified: contributions.filter((c) => c.isVerified).length,
      verifiedAmount: contributions
        .filter((c) => c.isVerified)
        .reduce((sum, c) => sum + c.amount, 0),
      pending: contributions.filter((c) => !c.isVerified).length,
      pendingAmount: contributions
        .filter((c) => !c.isVerified)
        .reduce((sum, c) => sum + c.amount, 0),
    };
  },

  getMyContributionSummary: () => {
    const { myContributions, balance } = get();
    return {
      total: myContributions.length,
      totalPaid: balance.totalPaid || 0,
      outstanding: balance.outstanding || 0,
      totalRequired: balance.totalRequired || 0,
      completionRate:
        balance.totalRequired > 0
          ? Math.round((balance.totalPaid / balance.totalRequired) * 100)
          : 0,
    };
  },

  // Utility actions
  clearError: () => set({ error: null }),

  resetState: () =>
    set({
      contributions: [],
      myContributions: [],
      balance: {},
      paymentBasis: {},
      loading: false,
      error: null,
    }),
}));
