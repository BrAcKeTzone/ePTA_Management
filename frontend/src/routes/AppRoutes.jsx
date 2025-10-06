import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Auth pages
import SignupPage from "../pages/SignupPage";
import SigninPage from "../pages/SigninPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

// Admin pages (PTA Management)
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminAttendance from "../pages/Admin/Attendance";
import AdminContributions from "../pages/Admin/Contributions";
import AdminProjects from "../pages/Admin/Projects";
import AdminAnnouncements from "../pages/Admin/Announcements";
import AdminClearance from "../pages/Admin/Clearance";

// Parent pages (PTA System)
import ParentDashboard from "../pages/Parent/Dashboard";
import ParentAttendance from "../pages/Parent/MyAttendance";
import ParentContributions from "../pages/Parent/MyContributions";
import ParentAnnouncements from "../pages/Parent/Announcements";
import ParentProjects from "../pages/Parent/Projects";
import ParentClearance from "../pages/Parent/Clearance";

// Legacy HR/Applicant pages (keep for backward compatibility)
import ApplicantDashboard from "../pages/Applicant/Dashboard";
import ApplicationForm from "../pages/Applicant/ApplicationForm";
import ApplicationHistory from "../pages/Applicant/History";
import HRDashboard from "../pages/HR/Dashboard";
import ApplicationReview from "../pages/HR/Review";
import ApplicationsManagement from "../pages/HR/ApplicationsManagement";
import Scheduling from "../pages/HR/Scheduling";
import Scoring from "../pages/HR/Scoring";
import Reports from "../pages/HR/Reports";
import UserManagement from "../pages/HR/UserManagement";

// Shared pages
import ProfilePage from "../pages/ProfilePage";

// Layout components
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ParentLayout from "../layouts/ParentLayout";

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user } = useAuthStore();

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === "PARENT") {
    return <Navigate to="/parent/dashboard" replace />;
  } else if (user?.role === "HR") {
    return <Navigate to="/hr/dashboard" replace />;
  } else {
    return <Navigate to="/applicant/dashboard" replace />;
  }
};

// Profile Redirect Component
const ProfileRedirect = () => {
  const { user } = useAuthStore();

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/profile" replace />;
  } else if (user?.role === "PARENT") {
    return <Navigate to="/parent/profile" replace />;
  } else if (user?.role === "HR") {
    return <Navigate to="/hr/profile" replace />;
  } else {
    return <Navigate to="/applicant/profile" replace />;
  }
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "PARENT") {
      return <Navigate to="/parent/dashboard" replace />;
    } else if (user?.role === "HR") {
      return <Navigate to="/hr/dashboard" replace />;
    } else {
      return <Navigate to="/applicant/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "PARENT") {
      return <Navigate to="/parent/dashboard" replace />;
    } else if (user?.role === "HR") {
      return <Navigate to="/hr/dashboard" replace />;
    } else {
      return <Navigate to="/applicant/dashboard" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Navigate to="/signin" replace />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SigninPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Admin Routes (PTA Management) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="contributions" element={<AdminContributions />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="clearance" element={<AdminClearance />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Parent Routes (PTA System) */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={["PARENT"]}>
            <ParentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="contributions" element={<ParentContributions />} />
        <Route path="announcements" element={<ParentAnnouncements />} />
        <Route path="projects" element={<ParentProjects />} />
        <Route path="clearance" element={<ParentClearance />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Legacy Applicant Routes (for backward compatibility) */}
      <Route
        path="/applicant"
        element={
          <ProtectedRoute allowedRoles={["APPLICANT"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ApplicantDashboard />} />
        <Route path="application" element={<ApplicationForm />} />
        <Route path="history" element={<ApplicationHistory />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Legacy HR Routes (for backward compatibility) */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="review" element={<ApplicationReview />} />
        <Route path="applications" element={<ApplicationsManagement />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="scoring" element={<Scoring />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Shared Profile Route for direct access - redirect to role-specific profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRedirect />
          </ProtectedRoute>
        }
      />

      {/* Fallback Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
