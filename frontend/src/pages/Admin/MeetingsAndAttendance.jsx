import React, { useState, useEffect } from "react";
import { meetingsApi } from "../../api/meetingsApi";
import { attendanceApi } from "../../api/attendanceApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const MeetingsAndAttendance = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("meetings");

  // Common state
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Meetings state
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    meetingType: "GENERAL",
    date: "",
    startTime: "07:00",
    endTime: "09:00",
    venue: "",
  });

  // Attendance state
  const [attendance, setAttendance] = useState([]);
  const [selectedMeetingForAttendance, setSelectedMeetingForAttendance] =
    useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceUpdates, setAttendanceUpdates] = useState({});

  // Unified view state
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);
  const [meetingAttendanceMap, setMeetingAttendanceMap] = useState({});

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "date", // Default sort by date
    direction: "desc", // 'asc' or 'desc' - desc for latest first
  });

  // Meeting type options
  const meetingTypes = [
    { value: "GENERAL", label: "General Meeting" },
    { value: "SPECIAL", label: "Special Meeting" },
    { value: "EMERGENCY", label: "Emergency Meeting" },
    { value: "COMMITTEE", label: "Committee Meeting" },
    { value: "ANNUAL", label: "Annual Meeting" },
    { value: "QUARTERLY", label: "Quarterly Meeting" },
  ];

  // Generate time options from 7:00 AM to 9:00 PM (07:00 to 21:00)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourStr = hour.toString().padStart(2, "0");
        const minuteStr = minute.toString().padStart(2, "0");
        const time24 = `${hourStr}:${minuteStr}`;

        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const time12 = `${hour12}:${minuteStr} ${ampm}`;

        times.push({ value: time24, label: time12 });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Get valid end times based on selected start time
  const getValidEndTimes = (startTime) => {
    if (!startTime) return timeOptions;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;

    return timeOptions.filter((option) => {
      const [hour, minute] = option.value.split(":").map(Number);
      const totalMinutes = hour * 60 + minute;
      return totalMinutes > startTotalMinutes;
    });
  };

  // Load data on mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Fetch meetings
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingsApi.getAllMeetings();
      const meetingsArray = response.data?.data?.meetings || [];
      setMeetings(meetingsArray);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      alert("Error fetching meetings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance for a specific meeting
  const fetchAttendanceForMeeting = async (meetingId) => {
    try {
      const response = await attendanceApi.getAttendanceByMeeting(meetingId);

      // Debug: Log the response to see what structure is returned
      console.log("Attendance API Response:", response);
      console.log("Response data:", response.data);

      // Handle the response structure from backend
      let attendanceArray = [];

      if (response.data?.attendances) {
        // Backend returns: { meeting, attendances, summary }
        console.log("Using response.data.attendances structure");
        attendanceArray = response.data.attendances.map((record) => ({
          parentId: record.parent?.id,
          parentName: record.parent
            ? `${record.parent.firstName} ${record.parent.lastName}${
                record.parent.middleName ? ` ${record.parent.middleName}` : ""
              }`
            : "Unknown Parent",
          email: record.parent?.email,
          studentName: record.student?.name || "",
          isPresent:
            record.status === "PRESENT"
              ? true
              : record.status === "ABSENT"
              ? false
              : null,
          status: record.status,
          isLate: record.isLate,
          hasPenalty: record.hasPenalty,
          recordId: record.id,
        }));
      } else if (response.data?.data?.attendances) {
        // Alternative structure
        console.log("Using response.data.data.attendances structure");
        attendanceArray = response.data.data.attendances.map((record) => ({
          parentId: record.parent?.id,
          parentName: record.parent
            ? `${record.parent.firstName} ${record.parent.lastName}${
                record.parent.middleName ? ` ${record.parent.middleName}` : ""
              }`
            : "Unknown Parent",
          email: record.parent?.email,
          studentName: record.student?.name || "",
          isPresent:
            record.status === "PRESENT"
              ? true
              : record.status === "ABSENT"
              ? false
              : null,
          status: record.status,
          isLate: record.isLate,
          hasPenalty: record.hasPenalty,
          recordId: record.id,
        }));
      } else if (Array.isArray(response.data)) {
        // Direct array response
        console.log("Using direct array structure");
        attendanceArray = response.data.map((record) => ({
          parentId: record.parent?.id,
          parentName: record.parent
            ? `${record.parent.firstName} ${record.parent.lastName}${
                record.parent.middleName ? ` ${record.parent.middleName}` : ""
              }`
            : "Unknown Parent",
          email: record.parent?.email,
          studentName: record.student?.name || "",
          isPresent:
            record.status === "PRESENT"
              ? true
              : record.status === "ABSENT"
              ? false
              : null,
          status: record.status,
          isLate: record.isLate,
          hasPenalty: record.hasPenalty,
          recordId: record.id,
        }));
      } else {
        console.warn("Unknown response structure:", response.data);
      }

      console.log("Processed attendance array:", attendanceArray);

      // Cache the attendance data
      setMeetingAttendanceMap((prev) => ({
        ...prev,
        [meetingId]: attendanceArray,
      }));

      setAttendance(attendanceArray);
      setSelectedMeetingForAttendance(meetingId);
      setShowAttendanceModal(true);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      console.error("Error response:", error.response?.data);
      alert(
        `Error fetching attendance records: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Meeting handlers
  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    const [startHour, startMinute] = newMeeting.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = newMeeting.endTime.split(":").map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (endTotal <= startTotal) {
      alert("End time must be after start time");
      return;
    }

    try {
      await meetingsApi.createMeeting(newMeeting);
      setShowCreateMeetingModal(false);
      setNewMeeting({
        title: "",
        description: "",
        meetingType: "GENERAL",
        date: "",
        startTime: "07:00",
        endTime: "09:00",
        venue: "",
      });
      fetchMeetings();
      alert("Meeting created successfully!");
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert(
        `Error creating meeting: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleEditMeeting = async () => {
    const [startHour, startMinute] = selectedMeeting.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = selectedMeeting.endTime.split(":").map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (endTotal <= startTotal) {
      alert("End time must be after start time");
      return;
    }

    try {
      // Extract only the fields that should be updated (exclude system fields)
      const updateData = {
        title: selectedMeeting.title,
        description: selectedMeeting.description,
        meetingType: selectedMeeting.meetingType,
        status: selectedMeeting.status,
        date: selectedMeeting.date,
        startTime: selectedMeeting.startTime,
        endTime: selectedMeeting.endTime,
        venue: selectedMeeting.venue,
        isVirtual: selectedMeeting.isVirtual,
        meetingLink: selectedMeeting.meetingLink || null,
        agenda: selectedMeeting.agenda || null,
      };

      await meetingsApi.updateMeeting(selectedMeeting.id, updateData);
      setShowViewModal(false);
      setIsEditMode(false);
      setSelectedMeeting(null);
      fetchMeetings();
      alert("Meeting updated successfully!");
    } catch (error) {
      console.error("Error updating meeting:", error);
      alert(
        `Error updating meeting: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleViewMeeting = (meeting) => {
    setSelectedMeeting({
      ...meeting,
      date: meeting.date ? meeting.date.split("T")[0] : "",
    });
    setIsEditMode(false);
    setShowViewModal(true);
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setShowViewModal(false);
    setSelectedMeeting(null);
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await meetingsApi.deleteMeeting(meetingId);
        fetchMeetings();
        alert("Meeting deleted successfully!");
      } catch (error) {
        console.error("Error deleting meeting:", error);
        alert("Error deleting meeting. Please try again.");
      }
    }
  };

  // Attendance handlers
  const handleRecordAttendance = async (parentId, isPresent) => {
    try {
      await attendanceApi.recordAttendance({
        meetingId: selectedMeetingForAttendance,
        parentId,
        isPresent,
      });
      fetchAttendanceForMeeting(selectedMeetingForAttendance);
    } catch (error) {
      console.error("Error recording attendance:", error);
      alert("Error recording attendance.");
    }
  };

  // Toggle attendance checkbox
  const handleToggleAttendance = (parentId) => {
    setAttendanceUpdates((prev) => {
      const current = prev[parentId];
      // Cycle through: undefined (not set) -> true (present) -> false (absent) -> undefined
      const newValue =
        current === undefined ? true : current === true ? false : undefined;

      const updated = { ...prev };
      if (newValue === undefined) {
        delete updated[parentId];
      } else {
        updated[parentId] = newValue;
      }
      return updated;
    });
  };

  // Save all attendance records
  const handleSaveAttendance = async () => {
    try {
      const attendances = Object.entries(attendanceUpdates).map(
        ([parentId, isPresent]) => ({
          parentId: parseInt(parentId),
          status: isPresent ? "PRESENT" : "ABSENT", // Convert boolean to status string
        })
      );

      if (attendances.length === 0) {
        alert("Please select at least one attendance status to save.");
        return;
      }

      // Prepare data in the format expected by backend validation schema
      const bulkData = {
        meetingId: selectedMeetingForAttendance,
        attendances: attendances,
      };

      // Use bulk record attendance if available, otherwise record one by one
      if (attendanceApi.bulkRecordAttendance) {
        await attendanceApi.bulkRecordAttendance(bulkData);
      } else {
        // Fallback: record individually
        for (const attendance of attendances) {
          await attendanceApi.recordAttendance({
            meetingId: selectedMeetingForAttendance,
            ...attendance,
          });
        }
      }

      alert(`${attendances.length} attendance record(s) saved successfully!`);
      setAttendanceUpdates({});
      fetchAttendanceForMeeting(selectedMeetingForAttendance);
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert(
        `Error saving attendance: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Utility functions
  const formatTimeDisplay = (time24) => {
    if (!time24) return "N/A";
    const [hour, minute] = time24.split(":").map(Number);
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const getMeetingTypeLabel = (type) => {
    const typeObj = meetingTypes.find((t) => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      ONGOING: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
      POSTPONED: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Sorting function
  const getSortedMeetings = (meetingsToSort) => {
    if (!sortConfig.key) return meetingsToSort;

    const sorted = [...meetingsToSort].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "startTime":
          // Sort by start time
          aValue = a.startTime;
          bValue = b.startTime;
          break;
        case "venue":
          aValue = (a.venue || "").toLowerCase();
          bValue = (b.venue || "").toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  // Handle column header click for sorting
  const handleHeaderClick = (columnKey) => {
    setSortConfig((prevConfig) => ({
      key: columnKey,
      direction:
        prevConfig.key === columnKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Get sort indicator icon
  const getSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // Table columns
  const meetingColumns = [
    {
      key: "title",
      header: (
        <button
          onClick={() => handleHeaderClick("title")}
          className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
        >
          Meeting Details{getSortIndicator("title")}
        </button>
      ),
      cell: (meeting) => (
        <div>
          <div className="font-medium text-gray-900">{meeting.title}</div>
          <div className="text-sm text-gray-600">
            {getMeetingTypeLabel(meeting.meetingType)}
          </div>
        </div>
      ),
    },
    {
      key: "dateTime",
      header: (
        <button
          onClick={() => handleHeaderClick("date")}
          className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
        >
          Date & Time{getSortIndicator("date")}
        </button>
      ),
      cell: (meeting) => (
        <div>
          <div className="text-gray-900">{formatDate(meeting.date)}</div>
          <div className="text-sm text-gray-600">
            {formatTimeDisplay(meeting.startTime)} -{" "}
            {formatTimeDisplay(meeting.endTime)}
          </div>
        </div>
      ),
    },
    {
      key: "venue",
      header: (
        <button
          onClick={() => handleHeaderClick("venue")}
          className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
        >
          Location{getSortIndicator("venue")}
        </button>
      ),
      cell: (meeting) => (
        <div className="text-gray-900">{meeting.venue || "N/A"}</div>
      ),
    },
    {
      key: "status",
      header: (
        <button
          onClick={() => handleHeaderClick("status")}
          className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
        >
          Status{getSortIndicator("status")}
        </button>
      ),
      cell: (meeting) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
            meeting.status
          )}`}
        >
          {meeting.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (meeting) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewMeeting(meeting)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteMeeting(meeting.id)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const attendanceColumns = [
    {
      key: "title",
      header: "Meeting",
      cell: (meeting) => (
        <div>
          <div className="font-medium text-gray-900">{meeting.title}</div>
          <div className="text-sm text-gray-600">
            {formatDate(meeting.date)}
          </div>
        </div>
      ),
    },
    {
      key: "attendeeCount",
      header: "Attendees",
      cell: (meeting) => (
        <div className="text-gray-900">
          {meeting.attendeeCount || 0} recorded
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (meeting) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAttendanceForMeeting(meeting.id)}
          >
            Record/View Attendance
          </Button>
        </div>
      ),
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Meetings & Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage meetings and record attendance
          </p>
        </div>
        <Button
          onClick={() => setShowCreateMeetingModal(true)}
          className="w-full md:w-auto"
        >
          Create New Meeting
        </Button>
      </div>

      {/* Unified Meetings with Attendance View */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">
              All Meetings with Attendance
            </h2>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            {getSortedMeetings(meetings).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        <button
                          onClick={() => handleHeaderClick("title")}
                          className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
                        >
                          Meeting Details{getSortIndicator("title")}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        <button
                          onClick={() => handleHeaderClick("date")}
                          className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
                        >
                          Date & Time{getSortIndicator("date")}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        <button
                          onClick={() => handleHeaderClick("venue")}
                          className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
                        >
                          Location{getSortIndicator("venue")}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        <button
                          onClick={() => handleHeaderClick("status")}
                          className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
                        >
                          Status{getSortIndicator("status")}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Attendance
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedMeetings(meetings).map((meeting, index) => (
                      <React.Fragment key={index}>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {meeting.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getMeetingTypeLabel(meeting.meetingType)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900">
                              {formatDate(meeting.date)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatTimeDisplay(meeting.startTime)} -{" "}
                              {formatTimeDisplay(meeting.endTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {meeting.venue || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                meeting.status
                              )}`}
                            >
                              {meeting.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {meeting.attendeeCount || 0} recorded
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewMeeting(meeting)}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  fetchAttendanceForMeeting(meeting.id)
                                }
                              >
                                Attendance
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 p-6">
                <p className="text-gray-500">No meetings found</p>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {getSortedMeetings(meetings).length > 0 ? (
              <div className="space-y-4 p-6">
                {getSortedMeetings(meetings).map((meeting, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 break-words">
                          {meeting.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getMeetingTypeLabel(meeting.meetingType)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                            meeting.status
                          )}`}
                        >
                          {meeting.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-900 font-medium">
                          {formatDate(meeting.date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="text-gray-900 font-medium">
                          {formatTimeDisplay(meeting.startTime)} -{" "}
                          {formatTimeDisplay(meeting.endTime)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-900 font-medium">
                          {meeting.venue || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Attendance:</span>
                        <span className="text-gray-900 font-medium">
                          {meeting.attendeeCount || 0} recorded
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMeeting(meeting)}
                        className="w-full"
                      >
                        View Meeting
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAttendanceForMeeting(meeting.id)}
                        className="w-full"
                      >
                        Record/View Attendance
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 p-6">
                <p className="text-gray-500">No meetings found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      <Modal
        isOpen={showCreateMeetingModal}
        onClose={() => setShowCreateMeetingModal(false)}
        title="Create New Meeting"
        size="lg"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <Input
            label="Meeting Title"
            placeholder="e.g., Monthly General Assembly"
            value={newMeeting.title}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, title: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              rows="3"
              placeholder="Meeting description (optional)"
              value={newMeeting.description}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={newMeeting.meetingType}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, meetingType: e.target.value })
              }
              required
            >
              {meetingTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Date"
            type="date"
            value={newMeeting.date}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, date: e.target.value })
            }
            min={new Date().toISOString().split("T")[0]}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                value={newMeeting.startTime}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  setNewMeeting((prev) => {
                    const validEndTimes = getValidEndTimes(newStartTime);
                    const needsEndTimeUpdate = !validEndTimes.some(
                      (t) => t.value === prev.endTime
                    );

                    return {
                      ...prev,
                      startTime: newStartTime,
                      endTime: needsEndTimeUpdate
                        ? validEndTimes[0]?.value || ""
                        : prev.endTime,
                    };
                  });
                }}
                required
              >
                {timeOptions.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                value={newMeeting.endTime}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, endTime: e.target.value })
                }
                required
              >
                {getValidEndTimes(newMeeting.startTime).map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Location"
            placeholder="e.g., School Auditorium, Room 101"
            value={newMeeting.venue}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, venue: e.target.value })
            }
            required
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateMeetingModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Meeting</Button>
          </div>
        </form>
      </Modal>

      {/* View/Edit Meeting Modal */}
      {selectedMeeting && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setIsEditMode(false);
            setSelectedMeeting(null);
          }}
          title={isEditMode ? "Edit Meeting" : "View Meeting"}
          size="lg"
        >
          <form noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title
              </label>
              <Input
                placeholder="e.g., Monthly General Assembly"
                value={selectedMeeting.title}
                onChange={(e) =>
                  setSelectedMeeting({
                    ...selectedMeeting,
                    title: e.target.value,
                  })
                }
                disabled={!isEditMode}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  !isEditMode ? "bg-gray-50 cursor-not-allowed" : ""
                }`}
                rows="3"
                placeholder="Meeting description (optional)"
                value={selectedMeeting.description || ""}
                onChange={(e) =>
                  setSelectedMeeting({
                    ...selectedMeeting,
                    description: e.target.value,
                  })
                }
                disabled={!isEditMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  !isEditMode ? "bg-gray-50 cursor-not-allowed" : ""
                }`}
                value={selectedMeeting.meetingType}
                onChange={(e) =>
                  setSelectedMeeting({
                    ...selectedMeeting,
                    meetingType: e.target.value,
                  })
                }
                disabled={!isEditMode}
                required
              >
                {meetingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={selectedMeeting.date}
                onChange={(e) =>
                  setSelectedMeeting({
                    ...selectedMeeting,
                    date: e.target.value,
                  })
                }
                disabled={!isEditMode}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                    !isEditMode ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                  value={selectedMeeting.startTime}
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    setSelectedMeeting((prev) => {
                      const validEndTimes = getValidEndTimes(newStartTime);
                      const needsEndTimeUpdate = !validEndTimes.some(
                        (t) => t.value === prev.endTime
                      );

                      return {
                        ...prev,
                        startTime: newStartTime,
                        endTime: needsEndTimeUpdate
                          ? validEndTimes[0]?.value || ""
                          : prev.endTime,
                      };
                    });
                  }}
                  disabled={!isEditMode}
                  required
                >
                  {timeOptions.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                    !isEditMode ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                  value={selectedMeeting.endTime}
                  onChange={(e) =>
                    setSelectedMeeting({
                      ...selectedMeeting,
                      endTime: e.target.value,
                    })
                  }
                  disabled={!isEditMode}
                  required
                >
                  {getValidEndTimes(selectedMeeting.startTime).map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                placeholder="e.g., School Auditorium, Room 101"
                value={selectedMeeting.venue}
                onChange={(e) =>
                  setSelectedMeeting({
                    ...selectedMeeting,
                    venue: e.target.value,
                  })
                }
                disabled={!isEditMode}
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              {!isEditMode ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </Button>
                  <Button type="button" onClick={handleEnterEditMode}>
                    Edit
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleEditMeeting}>
                    Update Meeting
                  </Button>
                </>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Attendance Recording Modal */}
      <Modal
        isOpen={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false);
          setAttendanceUpdates({});
        }}
        title="Record Attendance"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              📋 <strong>Instructions:</strong> Check the checkbox to mark as{" "}
              <strong>Present</strong>, uncheck to mark as{" "}
              <strong>Absent</strong>. Click "Save Attendance" to update all
              records.
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {attendance && attendance.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {attendance.map((record) => (
                  <div
                    key={record.recordId || record.parentId}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {record.parentName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.email}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        {record.isLate && (
                          <span className="text-yellow-600 font-semibold">
                            ⚠️ Marked as Late
                          </span>
                        )}
                        {record.hasPenalty && (
                          <span className="text-red-600 font-semibold">
                            🚩 Has Penalty
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`attendance-${record.parentId}`}
                          checked={
                            attendanceUpdates[record.parentId] === true ||
                            (attendanceUpdates[record.parentId] === undefined &&
                              record.isPresent === true)
                          }
                          onChange={() =>
                            handleToggleAttendance(record.parentId)
                          }
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                        <label
                          htmlFor={`attendance-${record.parentId}`}
                          className="ml-2 cursor-pointer font-medium text-gray-700 hover:text-blue-600"
                        >
                          Present
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 p-6">
                <p>📭 No parents found for this meeting.</p>
                <p className="text-sm mt-2">
                  Attendance records may still be loading or there are no
                  parents linked to students in this meeting.
                </p>
              </div>
            )}
          </div>

          {attendance && attendance.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                <strong>{Object.keys(attendanceUpdates).length}</strong>{" "}
                record(s) marked for update
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAttendanceModal(false);
                    setAttendanceUpdates({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAttendance}
                  disabled={Object.keys(attendanceUpdates).length === 0}
                  className={
                    Object.keys(attendanceUpdates).length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                >
                  Save Attendance ({Object.keys(attendanceUpdates).length})
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MeetingsAndAttendance;
