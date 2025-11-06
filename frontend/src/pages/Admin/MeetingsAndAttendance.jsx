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
      setAttendance(response.data || []);
      setSelectedMeetingForAttendance(meetingId);
      setShowAttendanceModal(true);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert("Error fetching attendance records.");
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

  // Table columns
  const meetingColumns = [
    {
      key: "title",
      header: "Meeting Details",
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
      header: "Date & Time",
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
      header: "Location",
      cell: (meeting) => (
        <div className="text-gray-900">{meeting.venue || "N/A"}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Meetings & Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage meetings and record attendance
          </p>
        </div>
        {activeTab === "meetings" && (
          <Button onClick={() => setShowCreateMeetingModal(true)}>
            Create New Meeting
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("meetings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "meetings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Meetings
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "attendance"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Attendance
          </button>
        </div>
      </div>

      {/* Meetings Tab */}
      {activeTab === "meetings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">All Meetings</h2>
            </div>
            <Table
              data={meetings}
              columns={meetingColumns}
              emptyMessage="No meetings found"
            />
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                Record or View Attendance
              </h2>
            </div>
            <Table
              data={meetings}
              columns={attendanceColumns}
              emptyMessage="No meetings found"
            />
          </div>
        </div>
      )}

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
        onClose={() => setShowAttendanceModal(false)}
        title="Record Attendance"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Mark attendance for each parent below:
          </p>
          <div className="max-h-96 overflow-y-auto">
            {attendance.map((record) => (
              <div
                key={record.parentId}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2"
              >
                <div>
                  <div className="font-medium">{record.parentName}</div>
                  <div className="text-sm text-gray-600">
                    {record.studentName}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={record.isPresent === true ? "default" : "outline"}
                    onClick={() =>
                      handleRecordAttendance(record.parentId, true)
                    }
                  >
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={record.isPresent === false ? "default" : "outline"}
                    onClick={() =>
                      handleRecordAttendance(record.parentId, false)
                    }
                  >
                    Absent
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MeetingsAndAttendance;
