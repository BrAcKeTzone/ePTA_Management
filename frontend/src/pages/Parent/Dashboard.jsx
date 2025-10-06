import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAttendanceStore } from "../../store/attendanceStore";
import { useContributionsStore } from "../../store/contributionsStore";
import { useAnnouncementsStore } from "../../store/announcementsStore";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { StatsCard } from "../../components/UI/StatsCard";
import { Badge } from "../../components/UI/Badge";

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const { attendance, fetchMyAttendance } = useAttendanceStore();
  const { contributions, fetchMyContributions } = useContributionsStore();
  const { announcements, fetchAnnouncements } = useAnnouncementsStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchMyAttendance(),
          fetchMyContributions(),
          fetchAnnouncements(),
        ]);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchMyAttendance, fetchMyContributions, fetchAnnouncements]);

  // Calculate statistics
  const totalMeetings = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate =
    totalMeetings > 0 ? ((presentCount / totalMeetings) * 100).toFixed(1) : 0;
  const totalContributions = contributions.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const pendingPenalties = attendance.filter((a) => a.hasPenalty).length;

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
              Parent Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">JHCSC Dumingag Campus</p>
            <p className="text-sm text-gray-600">PTA Management System</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon="📊"
          trend={attendanceRate >= 80 ? "Good standing" : "Needs improvement"}
          trendUp={attendanceRate >= 80}
        />
        <StatsCard
          title="Total Contributions"
          value={`₱${totalContributions.toLocaleString()}`}
          icon="💰"
          trend="This year"
          trendUp={true}
        />
        <StatsCard
          title="Meetings Attended"
          value={`${presentCount}/${totalMeetings}`}
          icon="✅"
          trend="Total meetings"
          trendUp={true}
        />
        <StatsCard
          title="Pending Penalties"
          value={pendingPenalties}
          icon="⚠️"
          trend={pendingPenalties === 0 ? "All clear" : "Action needed"}
          trendUp={pendingPenalties === 0}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Attendance
            </h3>
            <Button size="sm" variant="outline" href="/parent/attendance">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {attendance.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {record.meeting?.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(record.meeting?.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      record.status === "PRESENT"
                        ? "success"
                        : record.status === "EXCUSED"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {record.status}
                  </Badge>
                  {record.hasPenalty && (
                    <Badge variant="danger" size="sm">
                      Penalty
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {attendance.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No attendance records found.
              </p>
            )}
          </div>
        </Card>

        {/* Recent Contributions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Contributions
            </h3>
            <Button size="sm" variant="outline" href="/parent/contributions">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {contributions.slice(0, 5).map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {contribution.project?.name || "General Fund"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(contribution.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    ₱{contribution.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {contributions.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No contributions recorded yet.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Latest Announcements */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Latest Announcements
          </h3>
          <Button size="sm" variant="outline" href="/parent/announcements">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {announcements.slice(0, 3).map((announcement) => (
            <div
              key={announcement.id}
              className="border-l-4 border-blue-500 pl-4 py-2"
            >
              <h4 className="font-medium text-gray-900">
                {announcement.title}
              </h4>
              <p className="text-gray-600 mt-1">
                {announcement.content.substring(0, 150)}...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No announcements available.
            </p>
          )}
        </div>
      </Card>

      {/* My Students */}
      {user?.students && user.students.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            My Children
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.students.map((student) => (
              <div key={student.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-lg">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      Grade {student.grade}
                    </p>
                    <Badge
                      variant={
                        student.status === "APPROVED"
                          ? "success"
                          : student.status === "PENDING"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {student.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            href="/parent/attendance"
            className="h-20 flex flex-col items-center justify-center"
            variant="outline"
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-sm">View Attendance</span>
          </Button>
          <Button
            href="/parent/contributions"
            className="h-20 flex flex-col items-center justify-center"
            variant="outline"
          >
            <span className="text-2xl mb-1">💰</span>
            <span className="text-sm">View Contributions</span>
          </Button>
          <Button
            href="/parent/announcements"
            className="h-20 flex flex-col items-center justify-center"
            variant="outline"
          >
            <span className="text-2xl mb-1">📢</span>
            <span className="text-sm">Announcements</span>
          </Button>
          <Button
            href="/parent/profile"
            className="h-20 flex flex-col items-center justify-center"
            variant="outline"
          >
            <span className="text-2xl mb-1">👤</span>
            <span className="text-sm">My Profile</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
