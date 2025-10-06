import { apiClient } from "./apiClient";

export const attendanceAPI = {
  // Get all attendance records (admin)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await apiClient.get(`/attendance?${params}`);
  },

  // Get user's attendance records (parent)
  getMy: async () => {
    return await apiClient.get("/attendance/my");
  },

  // Get attendance by meeting ID
  getByMeeting: async (meetingId) => {
    return await apiClient.get(`/attendance/meeting/${meetingId}`);
  },

  // Get attendance by ID
  getById: async (id) => {
    return await apiClient.get(`/attendance/${id}`);
  },

  // Create attendance record
  create: async (attendanceData) => {
    return await apiClient.post("/attendance", attendanceData);
  },

  // Update attendance record
  update: async (id, attendanceData) => {
    return await apiClient.put(`/attendance/${id}`, attendanceData);
  },

  // Delete attendance record
  delete: async (id) => {
    return await apiClient.delete(`/attendance/${id}`);
  },

  // Bulk update attendance
  bulkUpdate: async (attendanceUpdates) => {
    return await apiClient.post("/attendance/bulk-update", {
      updates: attendanceUpdates,
    });
  },

  // Mark attendance for a meeting
  markAttendance: async (meetingId, userId, status, notes = "") => {
    return await apiClient.post("/attendance/mark", {
      meetingId,
      userId,
      status,
      notes,
    });
  },

  // Submit excuse for absence
  submitExcuse: async (attendanceId, excuseReason) => {
    return await apiClient.post(`/attendance/${attendanceId}/excuse`, {
      excuseReason,
    });
  },

  // Get attendance statistics
  getStats: async (userId = null) => {
    const params = userId ? `?userId=${userId}` : "";
    return await apiClient.get(`/attendance/stats${params}`);
  },

  // Export attendance report
  export: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await apiClient.get(`/attendance/export?${params}`, {
      responseType: "blob",
    });
  },

  // Get attendance summary by date range
  getSummary: async (startDate, endDate) => {
    return await apiClient.get("/attendance/summary", {
      params: { startDate, endDate },
    });
  },

  // Get attendance trends
  getTrends: async (period = "month") => {
    return await apiClient.get(`/attendance/trends?period=${period}`);
  },
};
