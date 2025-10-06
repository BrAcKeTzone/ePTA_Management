import { create } from "zustand";
import { attendanceApi } from "../api/attendanceApi";

export const useAttendanceStore = create((set, get) => ({
  // State
  meetings: [],
  attendance: [],
  penalties: [],
  selectedMeeting: null,
  loading: false,
  error: null,

  // Actions
  fetchMeetings: async () => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceApi.getMeetings();
      set({ meetings: response.data || [], loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch meetings",
        loading: false,
      });
    }
  },

  createMeeting: async (meetingData) => {
    try {
      set({ loading: true, error: null });
      await attendanceApi.createMeeting(meetingData);
      // Refresh meetings list
      await get().fetchMeetings();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create meeting",
        loading: false,
      });
      throw error;
    }
  },

  updateMeeting: async (meetingId, meetingData) => {
    try {
      set({ loading: true, error: null });
      await attendanceApi.updateMeeting(meetingId, meetingData);
      // Refresh meetings list
      await get().fetchMeetings();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update meeting",
        loading: false,
      });
      throw error;
    }
  },

  deleteMeeting: async (meetingId) => {
    try {
      set({ loading: true, error: null });
      await attendanceApi.deleteMeeting(meetingId);
      // Refresh meetings list
      await get().fetchMeetings();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete meeting",
        loading: false,
      });
      throw error;
    }
  },

  fetchAttendanceForMeeting: async (meetingId) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceApi.getAttendanceByMeeting(meetingId);
      set({
        attendance: response.data || [],
        selectedMeeting: meetingId,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch attendance",
        loading: false,
      });
    }
  },

  recordAttendance: async (attendanceData) => {
    try {
      set({ loading: true, error: null });
      await attendanceApi.recordAttendance(attendanceData);
      // Refresh attendance for current meeting
      if (get().selectedMeeting) {
        await get().fetchAttendanceForMeeting(get().selectedMeeting);
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to record attendance",
        loading: false,
      });
      throw error;
    }
  },

  // Parent-specific actions
  fetchMyAttendance: async () => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceApi.getMyAttendance();
      set({ attendance: response.data || [], loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch attendance",
        loading: false,
      });
    }
  },

  fetchMyPenalties: async () => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceApi.getMyPenalties();
      set({ penalties: response.data || [], loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch penalties",
        loading: false,
      });
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),

  setSelectedMeeting: (meetingId) => set({ selectedMeeting: meetingId }),

  resetState: () =>
    set({
      meetings: [],
      attendance: [],
      penalties: [],
      selectedMeeting: null,
      loading: false,
      error: null,
    }),
}));
