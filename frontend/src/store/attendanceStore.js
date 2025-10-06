import { create } from "zustand";
import { attendanceAPI } from "../api/attendanceAPI";

const useAttendanceStore = create((set, get) => ({
  attendance: [],
  currentAttendance: null,
  loading: false,
  error: null,

  // Fetch all attendance records (admin)
  fetchAttendance: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.getAll(filters);
      set({ attendance: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Fetch user's attendance records (parent)
  fetchMyAttendance: async () => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.getMy();
      set({ attendance: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Fetch attendance by meeting ID
  fetchAttendanceByMeeting: async (meetingId) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.getByMeeting(meetingId);
      set({ attendance: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Get single attendance record
  getAttendance: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.getById(id);
      set({ currentAttendance: response.data, loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Create attendance record
  createAttendance: async (attendanceData) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.create(attendanceData);
      const newAttendance = response.data;

      set((state) => ({
        attendance: [...state.attendance, newAttendance],
        loading: false,
      }));

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Update attendance record
  updateAttendance: async (id, attendanceData) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.update(id, attendanceData);
      const updatedAttendance = response.data;

      set((state) => ({
        attendance: state.attendance.map((item) =>
          item.id === id ? updatedAttendance : item
        ),
        currentAttendance:
          state.currentAttendance?.id === id
            ? updatedAttendance
            : state.currentAttendance,
        loading: false,
      }));

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Delete attendance record
  deleteAttendance: async (id) => {
    try {
      set({ loading: true, error: null });
      await attendanceAPI.delete(id);

      set((state) => ({
        attendance: state.attendance.filter((item) => item.id !== id),
        currentAttendance:
          state.currentAttendance?.id === id ? null : state.currentAttendance,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Bulk update attendance (for marking multiple users at once)
  bulkUpdateAttendance: async (attendanceUpdates) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.bulkUpdate(attendanceUpdates);

      // Refresh attendance data
      const { fetchAttendance } = get();
      await fetchAttendance();

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Mark attendance for a meeting
  markAttendance: async (meetingId, userId, status, notes = "") => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.markAttendance(
        meetingId,
        userId,
        status,
        notes
      );
      const newAttendance = response.data;

      set((state) => ({
        attendance: state.attendance.map((item) =>
          item.meetingId === meetingId && item.userId === userId
            ? newAttendance
            : item
        ),
        loading: false,
      }));

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Submit excuse for absence
  submitExcuse: async (attendanceId, excuseReason) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.submitExcuse(
        attendanceId,
        excuseReason
      );
      const updatedAttendance = response.data;

      set((state) => ({
        attendance: state.attendance.map((item) =>
          item.id === attendanceId ? updatedAttendance : item
        ),
        loading: false,
      }));

      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Get attendance statistics
  getAttendanceStats: async (userId = null) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.getStats(userId);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Export attendance report
  exportAttendance: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await attendanceAPI.export(filters);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Clear current attendance
  clearCurrentAttendance: () => set({ currentAttendance: null }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      attendance: [],
      currentAttendance: null,
      loading: false,
      error: null,
    }),
}));

export { useAttendanceStore };
