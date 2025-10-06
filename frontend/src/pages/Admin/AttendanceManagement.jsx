import { useState, useEffect } from "react";
import { useAttendanceStore } from "../../store/attendanceStore";
import { useMeetingsStore } from "../../store/meetingsStore";
import { useUsersStore } from "../../store/usersStore";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { Select } from "../../components/UI/Select";
import { Table } from "../../components/UI/Table";
import { Badge } from "../../components/UI/Badge";
import { Checkbox } from "../../components/UI/Checkbox";

export default function AttendanceManagement() {
  const { attendance, loading, fetchAttendance, recordAttendance } =
    useAttendanceStore();
  const { meetings, fetchMeetings } = useMeetingsStore();
  const { users, fetchUsers } = useUsersStore();

  const [selectedMeeting, setSelectedMeeting] = useState("");
  const [attendanceData, setAttendanceData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchUsers();
    fetchAttendance();
  }, [fetchMeetings, fetchUsers, fetchAttendance]);

  const parents = users.filter((user) => user.role === "PARENT");

  const handleMeetingChange = (meetingId) => {
    setSelectedMeeting(meetingId);

    // Initialize attendance data for this meeting
    const initialData = {};
    parents.forEach((parent) => {
      const existingRecord = attendance.find(
        (a) => a.meetingId === parseInt(meetingId) && a.parentId === parent.id
      );
      initialData[parent.id] = existingRecord?.status || "ABSENT";
    });
    setAttendanceData(initialData);
  };

  const handleAttendanceChange = (parentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [parentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedMeeting) return;

    setIsSaving(true);
    try {
      const attendanceRecords = Object.entries(attendanceData).map(
        ([parentId, status]) => ({
          meetingId: parseInt(selectedMeeting),
          parentId: parseInt(parentId),
          status,
        })
      );

      await recordAttendance(attendanceRecords);
      alert("Attendance recorded successfully!");
    } catch (error) {
      console.error("Failed to save attendance:", error);
      alert("Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const attendanceColumns = [
    {
      header: "Meeting",
      accessorKey: "meeting",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.original.meeting?.title}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(row.original.meeting?.date).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: "Parent",
      accessorKey: "parent",
      cell: ({ row }) => row.original.parent?.name,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "PRESENT"
              ? "success"
              : row.original.status === "EXCUSED"
              ? "warning"
              : "danger"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      header: "Penalty",
      accessorKey: "hasPenalty",
      cell: ({ row }) => (
        <Badge variant={row.original.hasPenalty ? "danger" : "success"}>
          {row.original.hasPenalty ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Recorded At",
      accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-600">Record and manage meeting attendance</p>
        </div>
      </div>

      {/* Record Attendance Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Record Attendance
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Meeting
          </label>
          <Select
            value={selectedMeeting}
            onChange={(e) => handleMeetingChange(e.target.value)}
            className="max-w-md"
          >
            <option value="">Choose a meeting...</option>
            {meetings.map((meeting) => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.title} - {new Date(meeting.date).toLocaleDateString()}
              </option>
            ))}
          </Select>
        </div>

        {selectedMeeting && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parents.map((parent) => (
                <div
                  key={parent.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{parent.name}</p>
                      <p className="text-sm text-gray-600">{parent.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${parent.id}`}
                        value="PRESENT"
                        checked={attendanceData[parent.id] === "PRESENT"}
                        onChange={(e) =>
                          handleAttendanceChange(parent.id, e.target.value)
                        }
                        className="mr-2"
                      />
                      <span className="text-green-600">Present</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${parent.id}`}
                        value="ABSENT"
                        checked={attendanceData[parent.id] === "ABSENT"}
                        onChange={(e) =>
                          handleAttendanceChange(parent.id, e.target.value)
                        }
                        className="mr-2"
                      />
                      <span className="text-red-600">Absent</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${parent.id}`}
                        value="EXCUSED"
                        checked={attendanceData[parent.id] === "EXCUSED"}
                        onChange={(e) =>
                          handleAttendanceChange(parent.id, e.target.value)
                        }
                        className="mr-2"
                      />
                      <span className="text-yellow-600">Excused</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveAttendance}
                isLoading={isSaving}
                disabled={!selectedMeeting}
              >
                Save Attendance
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Attendance History */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance History
          </h3>
        </div>
        <Table
          data={attendance}
          columns={attendanceColumns}
          searchPlaceholder="Search attendance records..."
        />
      </Card>
    </div>
  );
}
