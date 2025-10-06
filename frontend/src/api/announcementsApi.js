import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

export const announcementsApi = {
  // Admin functions
  createAnnouncement: async (announcementData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.createAnnouncement(announcementData);
    }
    return await fetchClient.post("/api/announcements", announcementData);
  },

  updateAnnouncement: async (announcementId, announcementData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateAnnouncement(
        announcementId,
        announcementData
      );
    }
    return await fetchClient.put(
      `/api/announcements/${announcementId}`,
      announcementData
    );
  },

  deleteAnnouncement: async (announcementId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteAnnouncement(announcementId);
    }
    return await fetchClient.delete(`/api/announcements/${announcementId}`);
  },

  getAllAnnouncements: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllAnnouncements(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/announcements?${queryString}`);
  },

  getAnnouncement: async (announcementId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAnnouncement(announcementId);
    }
    return await fetchClient.get(`/api/announcements/${announcementId}`);
  },

  // Parent functions
  getActiveAnnouncements: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getActiveAnnouncements(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/announcements/active?${queryString}`);
  },

  markAnnouncementAsRead: async (announcementId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.markAnnouncementAsRead(announcementId);
    }
    return await fetchClient.post(`/api/announcements/${announcementId}/read`);
  },

  getUnreadCount: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getUnreadCount();
    }
    return await fetchClient.get("/api/announcements/unread-count");
  },

  getMyReadStatus: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyReadStatus(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/announcements/my-read-status?${queryString}`
    );
  },

  // Shared functions
  searchAnnouncements: async (searchTerm, params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.searchAnnouncements(searchTerm, params);
    }
    const queryParams = { ...params, search: searchTerm };
    const queryString = new URLSearchParams(queryParams).toString();
    return await fetchClient.get(`/api/announcements/search?${queryString}`);
  },

  // Archive/unarchive (Admin only)
  archiveAnnouncement: async (announcementId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.archiveAnnouncement(announcementId);
    }
    return await fetchClient.patch(
      `/api/announcements/${announcementId}/archive`
    );
  },

  unarchiveAnnouncement: async (announcementId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.unarchiveAnnouncement(announcementId);
    }
    return await fetchClient.patch(
      `/api/announcements/${announcementId}/unarchive`
    );
  },

  getArchivedAnnouncements: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getArchivedAnnouncements(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/announcements/archived?${queryString}`);
  },

  // Priority/Featured announcements
  toggleFeatured: async (announcementId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.toggleFeatured(announcementId);
    }
    return await fetchClient.patch(
      `/api/announcements/${announcementId}/toggle-featured`
    );
  },

  getFeaturedAnnouncements: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getFeaturedAnnouncements(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/announcements/featured?${queryString}`);
  },
};
