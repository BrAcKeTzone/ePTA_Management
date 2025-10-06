import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearanceApi } from "../api/clearanceApi";

export const useClearanceStore = create(
  persist(
    (set, get) => ({
      // State
      allRequests: [], // Admin view - all clearance requests
      myRequests: [], // Parent view - my clearance requests
      clearanceInfo: [], // Information about required clearances
      loading: false,
      error: null,

      // Admin actions
      fetchAllClearanceRequests: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await clearanceApi.getAllClearanceRequests(params);
          set({ allRequests: response.data || [], loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch clearance requests",
            loading: false,
          });
        }
      },

      approveClearanceRequest: async (requestId, approvalData = {}) => {
        try {
          set({ loading: true, error: null });
          await clearanceApi.approveClearanceRequest(requestId, approvalData);
          // Refresh requests
          await get().fetchAllClearanceRequests();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to approve clearance request",
            loading: false,
          });
          throw error;
        }
      },

      rejectClearanceRequest: async (requestId, rejectionData) => {
        try {
          set({ loading: true, error: null });
          await clearanceApi.rejectClearanceRequest(requestId, rejectionData);
          // Refresh requests
          await get().fetchAllClearanceRequests();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to reject clearance request",
            loading: false,
          });
          throw error;
        }
      },

      updateClearanceRequirements: async (requirementsData) => {
        try {
          set({ loading: true, error: null });
          await clearanceApi.updateClearanceRequirements(requirementsData);
          // Refresh clearance info
          await get().fetchClearanceRequirements();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to update clearance requirements",
            loading: false,
          });
          throw error;
        }
      },

      fetchClearanceRequirements: async () => {
        try {
          set({ loading: true, error: null });
          const response = await clearanceApi.getClearanceRequirements();
          set({ clearanceInfo: response.data || [], loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch clearance requirements",
            loading: false,
          });
        }
      },

      sendClearanceReminder: async (requestId) => {
        try {
          set({ loading: true, error: null });
          await clearanceApi.sendClearanceReminder(requestId);
          set({ loading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to send reminder",
            loading: false,
          });
          throw error;
        }
      },

      bulkProcessClearance: async (requestIds, action, data = {}) => {
        try {
          set({ loading: true, error: null });
          await clearanceApi.bulkProcessClearance({
            requestIds,
            action,
            ...data,
          });
          // Refresh requests
          await get().fetchAllClearanceRequests();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to process bulk clearance action",
            loading: false,
          });
          throw error;
        }
      },

      exportClearanceReport: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await clearanceApi.exportClearanceReport(params);
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to export clearance report",
            loading: false,
          });
          throw error;
        }
      },

      // Parent actions
      fetchMyClearanceRequests: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await clearanceApi.getMyClearanceRequests(params);
          set({ myRequests: response.data || [], loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch my clearance requests",
            loading: false,
          });
        }
      },

      submitClearanceRequest: async (requestData) => {
        try {
          set({ loading: true, error: null });
          await clearanceApi.submitClearanceRequest(requestData);
          // Refresh my requests
          await get().fetchMyClearanceRequests();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to submit clearance request",
            loading: false,
          });
          throw error;
        }
      },

      uploadClearanceDocument: async (requestId, documentData) => {
        try {
          set({ loading: true, error: null });
          await clearanceApi.uploadClearanceDocument(requestId, documentData);
          // Refresh my requests
          await get().fetchMyClearanceRequests();
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to upload document",
            loading: false,
          });
          throw error;
        }
      },

      downloadClearanceCertificate: async (requestId) => {
        try {
          set({ loading: true, error: null });
          const response = await clearanceApi.downloadClearanceCertificate(
            requestId
          );
          set({ loading: false });

          // Create blob and download
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `clearance-certificate-${requestId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to download clearance certificate",
            loading: false,
          });
          throw error;
        }
      },

      checkClearanceStatus: async (studentId) => {
        try {
          set({ loading: true, error: null });
          const response = await clearanceApi.checkClearanceStatus(studentId);
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to check clearance status",
            loading: false,
          });
          throw error;
        }
      },

      // Search and filter functionality
      searchClearanceRequests: async (searchTerm, params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await clearanceApi.searchClearanceRequests(
            searchTerm,
            params
          );
          set({ loading: false });
          return response.data || [];
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to search clearance requests",
            loading: false,
          });
          throw error;
        }
      },

      // Local state utilities
      getFilteredRequests: (filter = "all", isAdmin = true) => {
        const requests = isAdmin ? get().allRequests : get().myRequests;

        switch (filter) {
          case "pending":
            return requests.filter((req) => req.status === "pending");
          case "approved":
            return requests.filter((req) => req.status === "approved");
          case "rejected":
            return requests.filter((req) => req.status === "rejected");
          case "incomplete":
            return requests.filter((req) => req.status === "incomplete");
          case "all":
          default:
            return requests;
        }
      },

      getSortedRequests: (
        requests,
        sortBy = "submittedAt",
        sortOrder = "desc"
      ) => {
        return [...requests].sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];

          // Handle date sorting
          if (sortBy.includes("At") || sortBy.includes("Date")) {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
          }

          // Handle string sorting
          if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (sortOrder === "desc") {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      },

      // Statistics and analytics
      getClearanceStatistics: () => {
        const { allRequests } = get();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        return {
          total: allRequests.length,
          pending: allRequests.filter((req) => req.status === "pending").length,
          approved: allRequests.filter((req) => req.status === "approved")
            .length,
          rejected: allRequests.filter((req) => req.status === "rejected")
            .length,
          incomplete: allRequests.filter((req) => req.status === "incomplete")
            .length,
          thisMonth: allRequests.filter((req) => {
            const requestDate = new Date(req.submittedAt);
            return (
              requestDate.getFullYear() === currentYear &&
              requestDate.getMonth() === currentMonth
            );
          }).length,
          thisYear: allRequests.filter((req) => {
            const requestDate = new Date(req.submittedAt);
            return requestDate.getFullYear() === currentYear;
          }).length,
        };
      },

      getClearanceProgress: (studentId) => {
        const requests = get().allRequests.filter(
          (req) => req.studentId === studentId
        );
        if (requests.length === 0) return null;

        const totalRequired = get().clearanceInfo.length;
        const completed = requests.filter(
          (req) => req.status === "approved"
        ).length;

        return {
          totalRequired,
          completed,
          pending: requests.filter((req) => req.status === "pending").length,
          rejected: requests.filter((req) => req.status === "rejected").length,
          incomplete: requests.filter((req) => req.status === "incomplete")
            .length,
          percentage:
            totalRequired > 0
              ? Math.round((completed / totalRequired) * 100)
              : 0,
          isComplete: completed === totalRequired,
        };
      },

      getParentClearanceStatus: () => {
        const { myRequests, clearanceInfo } = get();
        const totalRequired = clearanceInfo.length;
        const completed = myRequests.filter(
          (req) => req.status === "approved"
        ).length;

        return {
          totalRequired,
          completed,
          pending: myRequests.filter((req) => req.status === "pending").length,
          rejected: myRequests.filter((req) => req.status === "rejected")
            .length,
          incomplete: myRequests.filter((req) => req.status === "incomplete")
            .length,
          percentage:
            totalRequired > 0
              ? Math.round((completed / totalRequired) * 100)
              : 0,
          isComplete: completed === totalRequired,
          canDownloadCertificate: completed === totalRequired,
        };
      },

      // Document management
      getRequiredDocuments: (clearanceType) => {
        const clearanceItem = get().clearanceInfo.find(
          (item) => item.type === clearanceType
        );
        return clearanceItem?.requiredDocuments || [];
      },

      getMissingDocuments: (requestId) => {
        const request =
          get().allRequests.find((req) => req.id === requestId) ||
          get().myRequests.find((req) => req.id === requestId);
        if (!request) return [];

        const requiredDocs = get().getRequiredDocuments(request.clearanceType);
        const submittedDocs = request.documents || [];

        return requiredDocs.filter(
          (doc) =>
            !submittedDocs.some((submitted) => submitted.type === doc.type)
        );
      },

      // Utility actions
      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          allRequests: [],
          myRequests: [],
          clearanceInfo: [],
          loading: false,
          error: null,
        }),
    }),
    {
      name: "clearance-storage",
      partialize: (state) => ({
        clearanceInfo: state.clearanceInfo,
      }),
    }
  )
);
