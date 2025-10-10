import React, { useState, useEffect } from "react";
import { attendanceApi } from "../../api/attendanceApi";
import Table from "../../components/Table";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [summary, setSummary] = useState({
    totalMeetings: 0,
    attendedMeetings: 0,
    absentMeetings: 0,
    attendanceRate: 0,
    totalPenalties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      const [attendanceResponse, penaltiesResponse] = await Promise.all([
        attendanceApi.getMyAttendance(),
        attendanceApi.getMyPenalties(),
      ]);

      const attendanceResponseData = attendanceResponse.data || {};
      const penaltiesResponseData = penaltiesResponse.data || {};

      const attendanceData = attendanceResponseData.attendance || [];
      const penaltiesData = penaltiesResponseData.penalties || [];

      setAttendance(attendanceData);
      setPenalties(penaltiesData);

      // Calculate summary
      const totalMeetings = attendanceData.length;
      const attendedMeetings = attendanceData.filter((a) => a.isPresent).length;
      const absentMeetings = totalMeetings - attendedMeetings;
      const attendanceRate =
        totalMeetings > 0
          ? Math.round((attendedMeetings / totalMeetings) * 100)
          : 0;
      const totalPenalties = penaltiesData.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      setSummary({
        totalMeetings,
        attendedMeetings,
        absentMeetings,
        attendanceRate,
        totalPenalties,
      });
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceColumns = [
    {
      key: "meeting",
      header: "Meeting Details",
      render: (record) => (
        <div>
          <div className="font-medium">{record.meetingTitle}</div>
          <div className="text-sm text-gray-600">
            {record.meetingDescription}
          </div>
          <div className="text-sm text-gray-500">{record.meetingLocation}</div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date & Time",
      render: (record) => (
        <div>
          <div>{formatDate(record.meetingDate)}</div>
          <div className="text-sm text-gray-600">{record.meetingTime}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Meeting Type",
      render: (record) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            record.meetingType === "emergency"
              ? "bg-red-100 text-red-800"
              : record.meetingType === "special"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {record.meetingType}
        </span>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (record) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            record.isPresent
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {record.isPresent ? "Present" : "Absent"}
        </span>
      ),
    },
    {
      key: "penalty",
      header: "Penalty",
      render: (record) => (
        <div>
          {record.penaltyAmount > 0 ? (
            <span className="text-red-600 font-medium">
              ₱{record.penaltyAmount.toLocaleString()}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
  ];

  const penaltyColumns = [
    {
      key: "meeting",
      header: "Meeting",
      render: (penalty) => (
        <div>
          <div className="font-medium">{penalty.meetingTitle}</div>
          <div className="text-sm text-gray-600">
            {formatDate(penalty.meetingDate)}
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (penalty) => penalty.reason || "Absence from meeting",
    },
    {
      key: "amount",
      header: "Amount",
      render: (penalty) => (
        <span className="text-red-600 font-medium">
          ₱{penalty.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (penalty) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            penalty.isPaid
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {penalty.isPaid ? "Paid" : "Outstanding"}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (penalty) =>
        penalty.dueDate ? formatDate(penalty.dueDate) : "-",
    },
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Attendance
        </h1>
        <p className="text-gray-600 mt-1">
          View your meeting attendance record and penalties
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">
            Total Meetings
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {summary.totalMeetings}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">
            Attended
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {summary.attendedMeetings}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">
            Absent
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {summary.absentMeetings}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">
            Attendance Rate
          </h3>
          <p
            className={`text-2xl font-bold ${
              summary.attendanceRate >= 80
                ? "text-green-600"
                : summary.attendanceRate >= 60
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {summary.attendanceRate}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">
            Total Penalties
          </h3>
          <p className="text-2xl font-bold text-red-600">
            ₱{summary.totalPenalties.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Attendance Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">
          Attendance Performance
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span className="dark:text-gray-300">Attendance Rate</span>
              <span className="dark:text-gray-300">
                {summary.attendanceRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  summary.attendanceRate >= 80
                    ? "bg-green-500"
                    : summary.attendanceRate >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${summary.attendanceRate}%` }}
              ></div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {summary.attendanceRate >= 80
              ? "Excellent attendance! Keep up the good work."
              : summary.attendanceRate >= 60
              ? "Good attendance, but there's room for improvement."
              : "Attendance needs improvement. Please try to attend more meetings."}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            Attendance History
          </h2>
        </div>
        <Table
          data={attendance}
          columns={attendanceColumns}
          emptyMessage="No attendance records found"
        />
      </div>

      {/* Penalties */}
      {penalties.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Penalties</h2>
          </div>
          <Table
            data={penalties}
            columns={penaltyColumns}
            emptyMessage="No penalties found"
          />
        </div>
      )}

      {/* Attendance Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Attendance Requirements
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>• Minimum 80% attendance rate is required for clearance</p>
          <p>• Emergency meetings have higher penalty rates for absences</p>
          <p>• Penalties must be paid before clearance can be issued</p>
          <p>• Valid excuses may be considered by the PTA board</p>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
