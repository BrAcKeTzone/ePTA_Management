import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

export const contributionsApi = {
  // Admin functions
  recordContribution: async (contributionData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.recordContribution(contributionData);
    }
    return await fetchClient.post("/api/contributions", contributionData);
  },

  updateContribution: async (contributionId, contributionData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateContribution(
        contributionId,
        contributionData
      );
    }
    return await fetchClient.put(
      `/api/contributions/${contributionId}`,
      contributionData
    );
  },

  deleteContribution: async (contributionId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteContribution(contributionId);
    }
    return await fetchClient.delete(`/api/contributions/${contributionId}`);
  },

  getAllContributions: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllContributions(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/contributions?${queryString}`);
  },

  getContributionsByParent: async (parentId, params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getContributionsByParent(parentId, params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/contributions/parent/${parentId}?${queryString}`
    );
  },

  getContributionsByProject: async (projectId, params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getContributionsByProject(
        projectId,
        params
      );
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/contributions/project/${projectId}?${queryString}`
    );
  },

  verifyContribution: async (contributionId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.verifyContribution(contributionId);
    }
    return await fetchClient.patch(
      `/api/contributions/${contributionId}/verify`
    );
  },

  // Parent functions
  getMyContributions: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyContributions(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/contributions/my-contributions?${queryString}`
    );
  },

  getMyBalance: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyBalance();
    }
    return await fetchClient.get("/api/contributions/my-balance");
  },

  getPaymentBasis: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getPaymentBasis();
    }
    return await fetchClient.get("/api/contributions/payment-basis");
  },

  // Financial reports
  generateFinancialReport: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.generateFinancialReport(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/contributions/reports/financial?${queryString}`
    );
  },

  exportFinancialReportPDF: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.exportFinancialReportPDF(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/contributions/reports/financial/pdf?${queryString}`,
      {
        responseType: "blob",
      }
    );
  },

  exportFinancialReportCSV: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.exportFinancialReportCSV(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/contributions/reports/financial/csv?${queryString}`,
      {
        responseType: "blob",
      }
    );
  },

  // Payment basis settings (Admin only)
  updatePaymentBasisSettings: async (settings) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updatePaymentBasisSettings(settings);
    }
    return await fetchClient.put("/api/contributions/payment-basis", settings);
  },

  getPaymentBasisSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getPaymentBasisSettings();
    }
    return await fetchClient.get("/api/contributions/payment-basis-settings");
  },
};
