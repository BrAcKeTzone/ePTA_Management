import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import DashboardCard from "../../components/DashboardCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { userApi } from "../../api/userApi";
import { attendanceApi } from "../../api/attendanceApi";
import { contributionsApi } from "../../api/contributionsApi";
import { projectsApi } from "../../api/projectsApi";
import { announcementsApi } from "../../api/announcementsApi";
import { clearanceApi } from "../../api/clearanceApi";
import { studentsApi } from "../../api/studentsApi";

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalParents: 0,
    totalStudents: 0,
    pendingParentLinks: 0,
    recentMeetings: 0,
    totalContributions: 0,
    pendingPayments: 0,
    activeProjects: 0,
    activeAnnouncements: 0,
    clearanceRequests: 0,
    totalContributionAmount: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard statistics
      const [
        usersResponse,
        studentsResponse,
        meetingsResponse,
        contributionsResponse,
        projectsResponse,
        announcementsResponse,
        clearanceResponse,
      ] = await Promise.allSettled([
        userApi.getAllUsers({ role: "PARENT" }),
        studentsApi.getAllStudents(),
        attendanceApi.getMeetings(),
        contributionsApi.getAllContributions(),
        projectsApi.getAllProjects({ status: "active" }),
        announcementsApi.getActiveAnnouncements(),
        clearanceApi.getAllClearanceRequests({ status: "pending" }),
      ]);

      // Process responses and update stats
      const newStats = { ...stats };

      if (usersResponse.status === "fulfilled") {
        const usersData = usersResponse.value?.data?.data || {};
        const users = usersData.users || [];
        newStats.totalParents = users.length;
      }

      if (studentsResponse.status === "fulfilled") {
        const studentsData = studentsResponse.value?.data?.data || {};
        const students = studentsData.students || [];
        newStats.totalStudents = students.length;
      }

      if (meetingsResponse.status === "fulfilled") {
        const meetingsData = meetingsResponse.value?.data?.data || {};
        const meetings = meetingsData.meetings || [];
        // Count meetings in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        newStats.recentMeetings = meetings.filter(
          (meeting) => new Date(meeting.date) >= thirtyDaysAgo
        ).length;
      }

      if (contributionsResponse.status === "fulfilled") {
        const contributionsData = contributionsResponse.value?.data?.data || {};
        const contributions = contributionsData.contributions || [];
        newStats.totalContributions = contributions.length;
        newStats.totalContributionAmount = contributions.reduce(
          (sum, contrib) => sum + (contrib.amount || 0),
          0
        );
        newStats.pendingPayments = contributions.filter(
          (contrib) => contrib.status === "pending"
        ).length;
      }

      if (projectsResponse.status === "fulfilled") {
        const projectsData = projectsResponse.value?.data?.data || {};
        const projects = projectsData.projects || [];
        newStats.activeProjects = projects.length;
      }

      if (announcementsResponse.status === "fulfilled") {
        const announcementsData = announcementsResponse.value?.data?.data || {};
        const announcements = announcementsData.announcements || [];
        newStats.activeAnnouncements = announcements.length;
      }

      if (clearanceResponse.status === "fulfilled") {
        const clearanceData = clearanceResponse.value?.data?.data || {};
        const clearanceRequests = clearanceData.requests || [];
        newStats.clearanceRequests = clearanceRequests.length;
      }

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "addParent":
        window.location.href = "/admin/users?action=add";
        break;
      case "recordAttendance":
        window.location.href = "/admin/attendance";
        break;
      case "recordPayment":
        window.location.href = "/admin/contributions?action=add";
        break;
      case "postAnnouncement":
        window.location.href = "/admin/announcements?action=add";
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          PTA Management System - Administrator Dashboard
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Parents"
          value={stats.totalParents}
          icon="👥"
          color="blue"
          href="/admin/users"
        />
        <DashboardCard
          title="Total Students"
          value={stats.totalStudents}
          icon="🎓"
          color="green"
          href="/admin/students"
        />
        <DashboardCard
          title="Pending Clearance"
          value={stats.clearanceRequests}
          icon="✅"
          color="yellow"
          href="/admin/clearance"
        />
        <DashboardCard
          title="Active Projects"
          value={stats.activeProjects}
          icon="📋"
          color="purple"
          href="/admin/projects"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Recent Meetings"
          value={stats.recentMeetings}
          icon="📅"
          color="indigo"
          href="/admin/attendance"
        />
        <DashboardCard
          title="Total Collected"
          value={`₱${stats.totalContributionAmount.toLocaleString()}`}
          icon="💰"
          color="green"
          href="/admin/contributions"
        />
        <DashboardCard
          title="Active Announcements"
          value={stats.activeAnnouncements}
          icon="📢"
          color="orange"
          href="/admin/announcements"
        />
        <DashboardCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon="⏳"
          color="red"
          href="/admin/contributions?filter=pending"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleQuickAction("addParent")}
            className="p-4 border border-gray-900 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium text-gray-900">Add New Parent</div>
            <div className="text-sm text-gray-600">
              Register a new parent account
            </div>
          </button>
          <button
            onClick={() => handleQuickAction("recordAttendance")}
            className="p-4 border border-gray-900 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-medium text-gray-900">Record Attendance</div>
            <div className="text-sm text-gray-600">Mark meeting attendance</div>
          </button>
          <button
            onClick={() => handleQuickAction("recordPayment")}
            className="p-4 border border-gray-900 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium text-gray-900">Record Payment</div>
            <div className="text-sm text-gray-600">
              Log contribution payment
            </div>
          </button>
          <button
            onClick={() => handleQuickAction("postAnnouncement")}
            className="p-4 border border-gray-900 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="text-2xl mb-2">📢</div>
            <div className="font-medium text-gray-900">Post Announcement</div>
            <div className="text-sm text-gray-600">Create new announcement</div>
          </button>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Members</span>
              <span className="font-medium text-gray-900">
                {stats.totalParents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Students Enrolled</span>
              <span className="font-medium text-gray-900">
                {stats.totalStudents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Projects</span>
              <span className="font-medium text-gray-900">
                {stats.activeProjects}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recent Meetings</span>
              <span className="font-medium text-gray-900">
                {stats.recentMeetings}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Collected</span>
              <span className="font-medium text-green-600">
                ₱{stats.totalContributionAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Contributions</span>
              <span className="font-medium text-gray-900">
                {stats.totalContributions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Payments</span>
              <span className="font-medium text-red-600">
                {stats.pendingPayments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Clearance Requests</span>
              <span className="font-medium text-yellow-600">
                {stats.clearanceRequests}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
