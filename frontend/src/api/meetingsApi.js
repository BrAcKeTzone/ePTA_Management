import { fetchClient } from "../utils/fetchClient";

export const meetingsApi = {
  // Get all meetings with optional filters
  getAllMeetings: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/meetings?${queryString}`);
  },

  // Get meeting by ID
  getMeeting: async (meetingId) => {
    return await fetchClient.get(`/api/meetings/${meetingId}`);
  },

  // Create a new meeting (Admin only)
  createMeeting: async (meetingData) => {
    return await fetchClient.post("/api/meetings", meetingData);
  },

  // Update meeting (Admin only)
  updateMeeting: async (meetingId, meetingData) => {
    return await fetchClient.put(`/api/meetings/${meetingId}`, meetingData);
  },

  // Delete meeting (Admin only)
  deleteMeeting: async (meetingId) => {
    return await fetchClient.delete(`/api/meetings/${meetingId}`);
  },

  // Get upcoming meetings
  getUpcomingMeetings: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/meetings/upcoming?${queryString}`);
  },

  // Get meeting history
  getMeetingHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/meetings/history?${queryString}`);
  },

  // Get meeting statistics (Admin only)
  getMeetingStats: async () => {
    return await fetchClient.get("/api/meetings/stats");
  },

  // Send notifications for a meeting (Admin only)
  sendNotifications: async (meetingId, data) => {
    return await fetchClient.post(`/api/meetings/${meetingId}/notify`, data);
  },

  // Cancel a meeting (Admin only)
  cancelMeeting: async (meetingId, reason) => {
    return await fetchClient.post(`/api/meetings/${meetingId}/cancel`, {
      reason,
    });
  },

  // Add minutes to a meeting (Admin only)
  addMinutes: async (meetingId, minutes) => {
    return await fetchClient.post(`/api/meetings/${meetingId}/minutes`, {
      minutes,
    });
  },

  // Add resolutions to a meeting (Admin only)
  addResolutions: async (meetingId, resolutions) => {
    return await fetchClient.post(`/api/meetings/${meetingId}/resolutions`, {
      resolutions,
    });
  },

  // Update quorum (Admin only)
  updateQuorum: async (meetingId, actualAttendees) => {
    return await fetchClient.put(`/api/meetings/${meetingId}/quorum`, {
      actualAttendees,
    });
  },

  // Generate QR code for meeting (Admin only)
  generateQRCode: async (meetingId) => {
    return await fetchClient.post(`/api/meetings/${meetingId}/qr-code`);
  },

  // Get QR code for meeting
  getQRCode: async (meetingId) => {
    return await fetchClient.get(`/api/meetings/${meetingId}/qr-code`);
  },

  // Scan QR code for attendance (Parent only)
  scanQRCode: async (qrCodeData) => {
    return await fetchClient.post("/api/meetings/scan-qr", { qrCodeData });
  },
};
