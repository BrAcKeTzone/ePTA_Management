import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardCard from "../../components/DashboardCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { attendanceApi } from "../../api/attendanceApi";
import { contributionsApi } from "../../api/contributionsApi";
import { projectsApi } from "../../api/projectsApi";
import { announcementsApi } from "../../api/announcementsApi";
import { clearanceApi } from "../../api/clearanceApi";

const ParentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    totalPenalties: 0,
    totalContributions: 0,
    outstandingBalance: 0,
    clearanceStatus: "unknown",
    unreadAnnouncements: 0,
    recentMeetings: 0,
    activeProjects: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch all dashboard data
      const [
        attendanceResponse,
        penaltiesResponse,
        contributionsResponse,
        balanceResponse,
        clearanceResponse,
        announcementsResponse,
        unreadCountResponse,
        projectsResponse,
        upcomingMeetingsResponse,
      ] = await Promise.allSettled([
        attendanceApi.getMyAttendance(),
        attendanceApi.getMyPenalties(),
        contributionsApi.getMyContributions(),
        contributionsApi.getMyBalance(),
        clearanceApi.getMyClearanceStatus(),
        announcementsApi.getActiveAnnouncements({ limit: 5 }),
        announcementsApi.getUnreadCount(),
        projectsApi.getActiveProjects({ limit: 3 }),
        attendanceApi.getUpcomingMeetings({ limit: 3 }),
      ]);

      // Process responses and update stats
      let newStats = { ...stats };

      if (attendanceResponse.status === "fulfilled") {
        const attendanceData = attendanceResponse.value.data;
        const totalMeetings = attendanceData?.total || 0;
        const attendedMeetings = attendanceData?.attended || 0;
        newStats.attendanceRate =
          totalMeetings > 0
            ? Math.round((attendedMeetings / totalMeetings) * 100)
            : 0;
        newStats.recentMeetings = attendanceData?.recentMeetings || 0;
      }

      if (penaltiesResponse.status === "fulfilled") {
        newStats.totalPenalties =
          penaltiesResponse.value.data?.totalAmount || 0;
      }

      if (contributionsResponse.status === "fulfilled") {
        newStats.totalContributions =
          contributionsResponse.value.data?.totalPaid || 0;
      }

      if (balanceResponse.status === "fulfilled") {
        newStats.outstandingBalance =
          balanceResponse.value.data?.outstanding || 0;
      }

      if (clearanceResponse.status === "fulfilled") {
        newStats.clearanceStatus =
          clearanceResponse.value.data?.status || "unknown";
      }

      if (unreadCountResponse.status === "fulfilled") {
        newStats.unreadAnnouncements =
          unreadCountResponse.value.data?.count || 0;
      }

      if (projectsResponse.status === "fulfilled") {
        newStats.activeProjects = projectsResponse.value.data?.length || 0;
      }

      if (announcementsResponse.status === "fulfilled") {
        setRecentAnnouncements(announcementsResponse.value.data || []);
      }

      if (upcomingMeetingsResponse.status === "fulfilled") {
        setUpcomingMeetings(upcomingMeetingsResponse.value.data || []);
      }

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "attendance":
        navigate("/parent/attendance");
        break;
      case "contributions":
        navigate("/parent/contributions");
        break;
      case "announcements":
        navigate("/parent/announcements");
        break;
      case "clearance":
        navigate("/parent/clearance");
        break;
      case "projects":
        navigate("/parent/projects");
        break;
      default:
        break;
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
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
      {/* Header with Refresh */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              PTA Management System - Parent Dashboard
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <span className={refreshing ? "animate-spin" : ""}>🔄</span>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon="📊"
          color={
            stats.attendanceRate >= 80
              ? "green"
              : stats.attendanceRate >= 60
              ? "yellow"
              : "red"
          }
          href="/parent/attendance"
        />
        <DashboardCard
          title="Total Penalties"
          value={`₱${stats.totalPenalties.toLocaleString()}`}
          icon="⚠️"
          color={stats.totalPenalties === 0 ? "green" : "red"}
          href="/parent/attendance"
        />
        <DashboardCard
          title="Contributions Paid"
          value={`₱${stats.totalContributions.toLocaleString()}`}
          icon="💰"
          color="blue"
          href="/parent/contributions"
        />
        <DashboardCard
          title="Outstanding Balance"
          value={`₱${stats.outstandingBalance.toLocaleString()}`}
          icon="💳"
          color={stats.outstandingBalance === 0 ? "green" : "orange"}
          href="/parent/contributions"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Clearance Status"
          value={stats.clearanceStatus === "cleared" ? "Cleared" : "Pending"}
          icon="✅"
          color={stats.clearanceStatus === "cleared" ? "green" : "yellow"}
          href="/parent/clearance"
        />
        <DashboardCard
          title="Unread Announcements"
          value={stats.unreadAnnouncements}
          icon="📢"
          color={stats.unreadAnnouncements > 0 ? "orange" : "blue"}
          href="/parent/announcements"
        />
        <DashboardCard
          title="Recent Meetings"
          value={stats.recentMeetings}
          icon="📅"
          color="indigo"
          href="/parent/attendance"
        />
        <DashboardCard
          title="Active Projects"
          value={stats.activeProjects}
          icon="📋"
          color="purple"
          href="/parent/projects"
        />
      </div>

      {/* Recent Announcements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold dark:text-white">
              Recent Announcements
            </h2>
            <button
              onClick={() => handleQuickAction("announcements")}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
        </div>
        <div className="p-6">
          {recentAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20 p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => handleQuickAction("announcements")}
                >
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {announcement.title}
                      </h3>
                      <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                        {announcement.content.length > 150
                          ? `${announcement.content.substring(0, 150)}...`
                          : announcement.content}
                      </div>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No recent announcements
            </p>
          )}
        </div>
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold dark:text-white">
                Upcoming Meetings
              </h2>
              <button
                onClick={() => handleQuickAction("attendance")}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {meeting.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {meeting.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          📅 {new Date(meeting.date).toLocaleDateString()}
                        </span>
                        <span>🕒 {meeting.time}</span>
                        <span>📍 {meeting.location}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        meeting.type === "emergency"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : meeting.type === "special"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {meeting.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleQuickAction("attendance")}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left block transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium dark:text-white">View Attendance</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Check meeting attendance and penalties
            </div>
          </button>
          <button
            onClick={() => handleQuickAction("contributions")}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left block transition-colors"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium dark:text-white">
              View Contributions
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Check payment history and balance
            </div>
          </button>
          <button
            onClick={() => handleQuickAction("announcements")}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left block transition-colors"
          >
            <div className="text-2xl mb-2">📢</div>
            <div className="font-medium dark:text-white">
              Read Announcements
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              View latest PTA announcements
            </div>
          </button>
          <button
            onClick={() => handleQuickAction("clearance")}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left block transition-colors"
          >
            <div className="text-2xl mb-2">✅</div>
            <div className="font-medium dark:text-white">Check Clearance</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Verify clearance status
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
