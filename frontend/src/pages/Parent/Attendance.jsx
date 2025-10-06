import { useState, useEffect } from "react";
import { useAttendanceStore } from "../../store/attendanceStore";
import { useMeetingsStore } from "../../store/meetingsStore";
import { useAuthStore } from "../../store/authStore";
import { Card } from "../../components/UI/Card";
import { Badge } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Table } from "../../components/UI/Table";

export default function ParentAttendance() {
  const { user } = useAuthStore();
  const { attendance, fetchMyAttendance, loading } = useAttendanceStore();
  const { meetings, fetchMeetings } = useMeetingsStore();

  const [filter, setFilter] = useState("all"); // all, present, absent, excused
  const [sortBy, setSortBy] = useState("date"); // date, status
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc

  useEffect(() => {
    fetchMyAttendance();
    fetchMeetings();
  }, [fetchMyAttendance, fetchMeetings]);

  // Filter and sort attendance records
  const filteredAttendance = attendance
    .filter((record) => {
      if (filter === "all") return true;
      return record.status.toLowerCase() === filter;
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "date") {
        aValue = new Date(a.meeting?.date || 0);
        bValue = new Date(b.meeting?.date || 0);
      } else if (sortBy === "status") {
        aValue = a.status;
        bValue = b.status;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate attendance statistics
  const totalMeetings = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const excusedCount = attendance.filter((a) => a.status === "EXCUSED").length;
  const attendanceRate =
    totalMeetings > 0 ? ((presentCount / totalMeetings) * 100).toFixed(1) : 0;
  const penaltiesCount = attendance.filter((a) => a.hasPenalty).length;

  const attendanceColumns = [
    {
      key: "meeting",
      header: "Meeting",
      render: (record) => (
        <div>
          <p className="font-medium text-gray-900">{record.meeting?.title}</p>
          <p className="text-sm text-gray-600">{record.meeting?.description}</p>
          <p className="text-sm text-gray-500">
            {new Date(record.meeting?.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {record.meeting?.location && (
            <p className="text-sm text-gray-500">
              📍 {record.meeting.location}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (record) => (
        <div className="space-y-2">
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
              ⚠️ Penalty Applied
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "excuse",
      header: "Excuse/Reason",
      render: (record) => (
        <div>
          {record.excuseReason && (
            <p className="text-sm text-gray-600">{record.excuseReason}</p>
          )}
          {record.notes && (
            <p className="text-sm text-gray-500 mt-1">
              <strong>Note:</strong> {record.notes}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "penalty",
      header: "Penalty Details",
      render: (record) => (
        <div>
          {record.penalty ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600">
                ₱{record.penalty.amount?.toLocaleString()}
              </p>
              <Badge
                variant={
                  record.penalty.status === "PAID"
                    ? "success"
                    : record.penalty.status === "PENDING"
                    ? "warning"
                    : "danger"
                }
                size="sm"
              >
                {record.penalty.status}
              </Badge>
              {record.penalty.description && (
                <p className="text-xs text-gray-500">
                  {record.penalty.description}
                </p>
              )}
              {record.penalty.dueDate && (
                <p className="text-xs text-gray-500">
                  Due: {new Date(record.penalty.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <span className="text-gray-400">No penalty</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
            <p className="text-gray-600">
              Track your PTA meeting attendance record
            </p>
          </div>
          <Button href="/parent/dashboard" variant="outline">
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {attendanceRate}%
            </p>
            <p className="text-sm text-gray-600">Attendance Rate</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            <p className="text-sm text-gray-600">Present</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{excusedCount}</p>
            <p className="text-sm text-gray-600">Excused</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {penaltiesCount}
            </p>
            <p className="text-sm text-gray-600">Penalties</p>
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Records</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
                <option value="excused">Excused Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredAttendance.length} of {totalMeetings} records
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance History
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAttendance.length > 0 ? (
          <Table
            columns={attendanceColumns}
            data={filteredAttendance}
            keyField="id"
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Attendance Records
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "You haven't attended any meetings yet."
                : `No ${filter} records found.`}
            </p>
            {filter !== "all" && (
              <Button
                onClick={() => setFilter("all")}
                variant="outline"
                className="mt-4"
              >
                View All Records
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Attendance Guidelines */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Attendance Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Attendance Requirements
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Minimum 80% attendance rate required</li>
              <li>• Arrive on time for meetings</li>
              <li>• Stay for the entire meeting duration</li>
              <li>• Bring required materials if specified</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Excuse Policy</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Submit excuse letter before the meeting</li>
              <li>• Valid reasons: illness, emergency, work conflict</li>
              <li>• Medical certificate may be required</li>
              <li>• Contact PTA officers for urgent matters</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Penalty Information */}
      {penaltiesCount > 0 && (
        <Card className="p-6 border-l-4 border-red-500">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Outstanding Penalties
              </h3>
              <p className="text-red-700 mb-4">
                You have {penaltiesCount} outstanding{" "}
                {penaltiesCount === 1 ? "penalty" : "penalties"}
                that need attention. Please review your attendance records and
                settle any pending payments.
              </p>
              <Button variant="danger" size="sm" href="/parent/penalties">
                View Penalty Details
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
