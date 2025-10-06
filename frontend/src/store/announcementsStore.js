import { create } from "zustand";
import { persist } from "zustand/middleware";
import { announcementsApi } from "../api/announcementsApi";

export const useAnnouncementsStore = create(
  persist(
    (set, get) => ({
      // State
      announcements: [],
      activeAnnouncements: [],
      featuredAnnouncements: [],
      archivedAnnouncements: [],
      readStatus: {}, // { announcementId: boolean }
      unreadCount: 0,
      loading: false,
      error: null,

      // Admin actions
      fetchAllAnnouncements: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await announcementsApi.getAllAnnouncements(params);
          set({ announcements: response.data || [], loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to fetch announcements",
            loading: false,
          });
        }
      },

      createAnnouncement: async (announcementData) => {
        try {
          set({ loading: true, error: null });
          await announcementsApi.createAnnouncement(announcementData);
          // Refresh announcements list
          await get().fetchAllAnnouncements();
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to create announcement",
            loading: false,
          });
          throw error;
        }
      },

      updateAnnouncement: async (announcementId, announcementData) => {
        try {
          set({ loading: true, error: null });
          await announcementsApi.updateAnnouncement(
            announcementId,
            announcementData
          );
          // Refresh announcements list
          await get().fetchAllAnnouncements();
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to update announcement",
            loading: false,
          });
          throw error;
        }
      },

      deleteAnnouncement: async (announcementId) => {
        try {
          set({ loading: true, error: null });
          await announcementsApi.deleteAnnouncement(announcementId);
          // Refresh announcements list
          await get().fetchAllAnnouncements();
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to delete announcement",
            loading: false,
          });
          throw error;
        }
      },

      archiveAnnouncement: async (announcementId) => {
        try {
          set({ loading: true, error: null });
          await announcementsApi.archiveAnnouncement(announcementId);
          // Refresh announcements list
          await get().fetchAllAnnouncements();
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to archive announcement",
            loading: false,
          });
          throw error;
        }
      },

      unarchiveAnnouncement: async (announcementId) => {
        try {
          set({ loading: true, error: null });
          await announcementsApi.unarchiveAnnouncement(announcementId);
          // Refresh announcements list
          await get().fetchAllAnnouncements();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to unarchive announcement",
            loading: false,
          });
          throw error;
        }
      },

      toggleFeatured: async (announcementId) => {
        try {
          set({ loading: true, error: null });
          await announcementsApi.toggleFeatured(announcementId);
          // Refresh announcements list
          await get().fetchAllAnnouncements();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to toggle featured status",
            loading: false,
          });
          throw error;
        }
      },

      fetchArchivedAnnouncements: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await announcementsApi.getArchivedAnnouncements(
            params
          );
          set({ archivedAnnouncements: response.data || [], loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch archived announcements",
            loading: false,
          });
        }
      },

      // Parent actions
      fetchActiveAnnouncements: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await announcementsApi.getActiveAnnouncements(
            params
          );
          set({ activeAnnouncements: response.data || [], loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch active announcements",
            loading: false,
          });
        }
      },

      fetchFeaturedAnnouncements: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await announcementsApi.getFeaturedAnnouncements(
            params
          );
          set({ featuredAnnouncements: response.data || [], loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch featured announcements",
            loading: false,
          });
        }
      },

      markAnnouncementAsRead: async (announcementId) => {
        try {
          await announcementsApi.markAnnouncementAsRead(announcementId);
          // Update local read status
          set((state) => ({
            readStatus: {
              ...state.readStatus,
              [announcementId]: true,
            },
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to mark announcement as read",
          });
        }
      },

      fetchUnreadCount: async () => {
        try {
          const response = await announcementsApi.getUnreadCount();
          set({ unreadCount: response.data?.count || 0 });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to fetch unread count",
          });
        }
      },

      fetchMyReadStatus: async (params = {}) => {
        try {
          const response = await announcementsApi.getMyReadStatus(params);
          const statusMap = {};
          response.data?.forEach((item) => {
            statusMap[item.announcementId] = item.isRead;
          });
          set({ readStatus: statusMap });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to fetch read status",
          });
        }
      },

      // Search functionality
      searchAnnouncements: async (searchTerm, params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await announcementsApi.searchAnnouncements(
            searchTerm,
            params
          );
          set({ loading: false });
          return response.data || [];
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to search announcements",
            loading: false,
          });
          throw error;
        }
      },

      // Local state management for read status
      markAsReadLocally: (announcementId) => {
        set((state) => ({
          readStatus: {
            ...state.readStatus,
            [announcementId]: true,
          },
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      // Filtering and sorting utilities
      getFilteredAnnouncements: (filter = "all") => {
        const { activeAnnouncements, readStatus } = get();

        switch (filter) {
          case "unread":
            return activeAnnouncements.filter(
              (announcement) => !readStatus[announcement.id]
            );
          case "featured":
            return activeAnnouncements.filter(
              (announcement) => announcement.isFeatured
            );
          case "all":
          default:
            return activeAnnouncements;
        }
      },

      getSortedAnnouncements: (announcements) => {
        return [...announcements].sort((a, b) => {
          // First by featured status
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;

          // Then by priority
          const priorityOrder = { urgent: 3, high: 2, normal: 1 };
          const aPriority = priorityOrder[a.priority] || 1;
          const bPriority = priorityOrder[b.priority] || 1;
          if (aPriority !== bPriority) return bPriority - aPriority;

          // Finally by date (newest first)
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      },

      // Statistics and summaries
      getAnnouncementSummary: () => {
        const { announcements } = get();
        const now = new Date();

        return {
          total: announcements.length,
          active: announcements.filter(
            (a) =>
              !a.isArchived && (!a.expiryDate || new Date(a.expiryDate) > now)
          ).length,
          featured: announcements.filter((a) => a.isFeatured).length,
          expired: announcements.filter(
            (a) => a.expiryDate && new Date(a.expiryDate) < now
          ).length,
          archived: announcements.filter((a) => a.isArchived).length,
          priorityCounts: {
            urgent: announcements.filter((a) => a.priority === "urgent").length,
            high: announcements.filter((a) => a.priority === "high").length,
            normal: announcements.filter((a) => a.priority === "normal").length,
          },
        };
      },

      getUnreadSummary: () => {
        const { activeAnnouncements, readStatus } = get();
        return {
          total: get().unreadCount,
          urgent: activeAnnouncements.filter(
            (a) => a.priority === "urgent" && !readStatus[a.id]
          ).length,
          featured: activeAnnouncements.filter(
            (a) => a.isFeatured && !readStatus[a.id]
          ).length,
        };
      },

      // Utility actions
      clearError: () => set({ error: null }),

      resetReadStatus: () => set({ readStatus: {}, unreadCount: 0 }),

      resetState: () =>
        set({
          announcements: [],
          activeAnnouncements: [],
          featuredAnnouncements: [],
          archivedAnnouncements: [],
          readStatus: {},
          unreadCount: 0,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "announcements-storage",
      partialize: (state) => ({
        readStatus: state.readStatus,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
