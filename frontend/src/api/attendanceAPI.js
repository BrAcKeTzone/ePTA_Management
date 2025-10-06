import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

export const attendanceApi = {
  // Admin functions
  getAttendanceByMeeting: async (meetingId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAttendanceByMeeting(meetingId);
    }
    return await fetchClient.get(`/api/attendance/meeting/${meetingId}`);
  },

  recordAttendance: async (attendanceData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.recordAttendance(attendanceData);
    }
    return await fetchClient.post("/api/attendance/record", attendanceData);
  },

  updateAttendance: async (attendanceId, attendanceData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateAttendance(
        attendanceId,
        attendanceData
      );
    }
    return await fetchClient.put(
      `/api/attendance/${attendanceId}`,
      attendanceData
    );
  },

  deleteAttendance: async (attendanceId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteAttendance(attendanceId);
    }
    return await fetchClient.delete(`/api/attendance/${attendanceId}`);
  },

  getAllAttendance: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllAttendance(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/attendance?${queryString}`);
  },

  // Parent functions
  getMyAttendance: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyAttendance(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/attendance/my-attendance?${queryString}`
    );
  },

  getMyPenalties: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyPenalties();
    }
    return await fetchClient.get("/api/attendance/my-penalties");
  },

  // Meeting management
  createMeeting: async (meetingData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.createMeeting(meetingData);
    }
    return await fetchClient.post("/api/meetings", meetingData);
  },

  getMeetings: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMeetings(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/meetings?${queryString}`);
  },

  getUpcomingMeetings: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getUpcomingMeetings(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/meetings/upcoming?${queryString}`);
  },

  updateMeeting: async (meetingId, meetingData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateMeeting(meetingId, meetingData);
    }
    return await fetchClient.put(`/api/meetings/${meetingId}`, meetingData);
  },

  deleteMeeting: async (meetingId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteMeeting(meetingId);
    }
    return await fetchClient.delete(`/api/meetings/${meetingId}`);
  },

  // Penalty calculation
  calculatePenalties: async (parentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.calculatePenalties(parentId);
    }
    return await fetchClient.post(
      `/api/attendance/calculate-penalties/${parentId}`
    );
  },

  recalculateAllPenalties: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.recalculateAllPenalties();
    }
    return await fetchClient.post("/api/attendance/recalculate-all-penalties");
  },
};
