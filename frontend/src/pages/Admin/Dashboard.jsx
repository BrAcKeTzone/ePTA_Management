import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useStatsStore } from "../../store/statsStore";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { StatsCard } from "../../components/UI/StatsCard";
import { ChartContainer } from "../../components/UI/ChartContainer";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { stats, loading, fetchStats } = useStatsStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => window.location.reload()}>
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Parents"
          value={stats?.totalParents || 0}
          icon="👥"
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon="🎓"
          trend="+8%"
          trendUp={true}
        />
        <StatsCard
          title="This Month Meetings"
          value={stats?.monthlyMeetings || 0}
          icon="📅"
          trend="+15%"
          trendUp={true}
        />
        <StatsCard
          title="Pending Penalties"
          value={stats?.pendingPenalties || 0}
          icon="⚠️"
          trend="-5%"
          trendUp={false}
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Attendance Overview
          </h3>
          <ChartContainer
            type="line"
            data={stats?.attendanceChart}
            height={300}
          />
        </Card>

        {/* Contributions Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Contributions
          </h3>
          <ChartContainer
            type="bar"
            data={stats?.contributionsChart}
            height={300}
          />
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Meetings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Meetings
            </h3>
            <Button size="sm" variant="outline" href="/admin/meetings">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {stats?.recentMeetings?.slice(0, 5).map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{meeting.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(meeting.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {meeting.attendances?.length || 0} attendees
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Announcements */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Announcements
            </h3>
            <Button size="sm" variant="outline" href="/admin/announcements">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {stats?.recentAnnouncements?.slice(0, 5).map((announcement) => (
              <div key={announcement.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {announcement.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {announcement.content.substring(0, 100)}...
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            href="/admin/meetings/new"
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">📅</span>
            <span className="text-sm">New Meeting</span>
          </Button>
          <Button
            href="/admin/announcements/new"
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">📢</span>
            <span className="text-sm">New Announcement</span>
          </Button>
          <Button
            href="/admin/contributions/new"
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">💰</span>
            <span className="text-sm">Record Contribution</span>
          </Button>
          <Button
            href="/admin/reports"
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-sm">Generate Report</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
