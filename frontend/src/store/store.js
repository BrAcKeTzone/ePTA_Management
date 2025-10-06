// PTA Management System - Zustand Stores
// Central store exports for the PTA Management System

// Authentication and user management
export { useAuthStore } from "./authStore";
export { useUserManagementStore } from "./userManagementStore";

// Legacy HR system stores (keep for reference during migration)
export { useApplicationStore } from "./applicationStore";
export { useReportStore } from "./reportStore";
export { useScheduleStore } from "./scheduleStore";
export { useScoringStore } from "./scoringStore";

// PTA Management System stores
export { useAttendanceStore } from "./attendanceStore";
export { useContributionsStore } from "./contributionsStore";
export { useProjectsStore } from "./projectsStore";
export { useAnnouncementsStore } from "./announcementsStore";
export { useClearanceStore } from "./clearanceStore";
export { useStudentsStore } from "./studentsStore";
export { useSettingsStore } from "./settingsStore";

// Redux Toolkit store (legacy - may be removed after full migration)
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import postsReducer from "../features/posts/postsSlice";
import commentsReducer from "../features/comments/commentsSlice";

export const reduxStore = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,
  },
});

// Default export for backward compatibility
export default reduxStore;
