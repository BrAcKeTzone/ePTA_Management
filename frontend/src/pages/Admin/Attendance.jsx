import React, { useState, useEffect } from "react";
import { attendanceApi } from "../../api/attendanceApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const AttendanceManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    meetingType: "GENERAL",
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getMeetings();
      setMeetings(response.data || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForMeeting = async (meetingId) => {
    try {
      const response = await attendanceApi.getAttendanceByMeeting(meetingId);
      setAttendance(response.data || []);
      setSelectedMeeting(meetingId);
      setShowAttendanceModal(true);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      await attendanceApi.createMeeting(newMeeting);
      setShowCreateMeeting(false);
      setNewMeeting({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        meetingType: "GENERAL",
      });
      fetchMeetings();
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const handleRecordAttendance = async (parentId, isPresent) => {
    try {
      await attendanceApi.recordAttendance({
        meetingId: selectedMeeting,
        parentId,
        isPresent,
      });
      fetchAttendanceForMeeting(selectedMeeting);
    } catch (error) {
      console.error("Error recording attendance:", error);
    }
  };

  const meetingColumns = [
    {
      key: "title",
      header: "Meeting Title",
      cell: (meeting) => (
        <div>
          <div className="font-medium text-gray-900">{meeting.title}</div>
          {meeting.description && (
            <div className="text-sm text-gray-600">{meeting.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date & Time",
      cell: (meeting) => (
        <div>
          <div className="text-gray-900">{formatDate(meeting.date)}</div>
          <div className="text-sm text-gray-600">
            {meeting.startTime}
            {meeting.endTime && ` - ${meeting.endTime}`}
          </div>
        </div>
      ),
    },
    {
      key: "venue",
      header: "Venue",
      cell: (meeting) => <div className="text-gray-900">{meeting.venue}</div>,
    },
    {
      key: "meetingType",
      header: "Type",
      cell: (meeting) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            meeting.meetingType === "EMERGENCY"
              ? "bg-red-100 text-red-800"
              : meeting.meetingType === "SPECIAL"
              ? "bg-yellow-100 text-yellow-800"
              : meeting.meetingType === "ANNUAL"
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {meeting.meetingType}
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
            onClick={() => fetchAttendanceForMeeting(meeting.id)}
          >
            Record Attendance
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
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage meetings and record parent attendance
          </p>
        </div>
        <Button onClick={() => setShowCreateMeeting(true)}>
          Create Meeting
        </Button>
      </div>

      {/* Meetings Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Meetings</h2>
        </div>
        <Table
          data={meetings}
          columns={meetingColumns}
          emptyMessage="No meetings found"
        />
      </div>

      {/* Create Meeting Modal */}
      <Modal
        isOpen={showCreateMeeting}
        onClose={() => setShowCreateMeeting(false)}
        title="Create New Meeting"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <Input
            label="Meeting Title"
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
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              value={newMeeting.description}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={newMeeting.date}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, date: e.target.value })
              }
              required
            />
            <Input
              label="Start Time (HH:MM)"
              type="time"
              value={newMeeting.startTime}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, startTime: e.target.value })
              }
              required
              placeholder="e.g., 14:00"
            />
          </div>
          <Input
            label="End Time (HH:MM) - Optional"
            type="time"
            value={newMeeting.endTime}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, endTime: e.target.value })
            }
            placeholder="e.g., 16:00"
          />
          <Input
            label="Venue"
            value={newMeeting.venue}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, venue: e.target.value })
            }
            required
            placeholder="e.g., Conference Room A"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newMeeting.meetingType}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, meetingType: e.target.value })
              }
            >
              <option value="GENERAL">General Meeting</option>
              <option value="SPECIAL">Special Meeting</option>
              <option value="EMERGENCY">Emergency Meeting</option>
              <option value="COMMITTEE">Committee Meeting</option>
              <option value="ANNUAL">Annual Meeting</option>
              <option value="QUARTERLY">Quarterly Meeting</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateMeeting(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Meeting</Button>
          </div>
        </form>
      </Modal>

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

export default AttendanceManagement;
