import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

export const clearanceApi = {
  // Admin functions
  searchParentStudent: async (searchTerm) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.searchParentStudent(searchTerm);
    }
    return await fetchClient.get(
      `/api/clearance/search?q=${encodeURIComponent(searchTerm)}`
    );
  },

  verifyClearance: async (parentId, studentId = null) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.verifyClearance(parentId, studentId);
    }
    const params = { parentId };
    if (studentId) params.studentId = studentId;

    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/clearance/verify?${queryString}`);
  },

  getClearanceDetails: async (parentId, studentId = null) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getClearanceDetails(parentId, studentId);
    }
    const params = { parentId };
    if (studentId) params.studentId = studentId;

    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/clearance/details?${queryString}`);
  },

  generateClearanceCertificate: async (parentId, studentId = null) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.generateClearanceCertificate(
        parentId,
        studentId
      );
    }
    const params = { parentId };
    if (studentId) params.studentId = studentId;

    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/clearance/certificate?${queryString}`, {
      responseType: "blob",
    });
  },

  getAllClearanceRequests: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllClearanceRequests(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/clearance/requests?${queryString}`);
  },

  approveClearanceRequest: async (requestId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.approveClearanceRequest(requestId);
    }
    return await fetchClient.patch(
      `/api/clearance/requests/${requestId}/approve`
    );
  },

  rejectClearanceRequest: async (requestId, reason = "") => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.rejectClearanceRequest(requestId, reason);
    }
    return await fetchClient.patch(
      `/api/clearance/requests/${requestId}/reject`,
      { reason }
    );
  },

  // Parent functions
  getMyClearanceStatus: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyClearanceStatus();
    }
    return await fetchClient.get("/api/clearance/my-status");
  },

  requestClearance: async (purpose, studentId = null) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.requestClearance(purpose, studentId);
    }
    return await fetchClient.post("/api/clearance/request", {
      purpose,
      studentId,
    });
  },

  getMyClearanceRequests: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyClearanceRequests(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/clearance/my-requests?${queryString}`);
  },

  downloadMyClearance: async (requestId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.downloadMyClearance(requestId);
    }
    return await fetchClient.get(
      `/api/clearance/my-requests/${requestId}/download`,
      {
        responseType: "blob",
      }
    );
  },

  // Shared utility functions
  getClearanceRequirements: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getClearanceRequirements();
    }
    return await fetchClient.get("/api/clearance/requirements");
  },

  // Clearance statistics (Admin only)
  getClearanceStatistics: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getClearanceStatistics(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/clearance/statistics?${queryString}`);
  },

  // Bulk clearance operations (Admin only)
  bulkVerifyClearance: async (parentIds) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.bulkVerifyClearance(parentIds);
    }
    return await fetchClient.post("/api/clearance/bulk-verify", { parentIds });
  },

  exportClearanceReport: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.exportClearanceReport(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/clearance/reports/export?${queryString}`,
      {
        responseType: "blob",
      }
    );
  },
};
