import React, { useState, useEffect } from "react";
import { studentsApi } from "../../api/studentsApi";
import { userApi } from "../../api/userApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    studentId: "",
    yearEnrolled: "",
    birthDate: "",
  });
  const [filter, setFilter] = useState("all");

  // Generate year options: 3 years before to 3 years after current year
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 3; i <= currentYear + 3; i++) {
      years.push(i);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  useEffect(() => {
    fetchStudents();
  }, [filter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Don't pass gradeLevel filter since it's no longer used
      const params = {};
      const response = await studentsApi.getAllStudents(params);
      console.log("API Response:", response);
      console.log("Students data:", response.data);
      console.log("response.data.data:", response.data.data);
      console.log("response.data.data.students:", response.data.data?.students);

      // Response structure: response.data.data.students
      const studentsArray = response.data?.data?.students || [];
      console.log("Setting students array:", studentsArray);
      console.log("Students array length:", studentsArray.length);
      setStudents(studentsArray);
    } catch (error) {
      console.error("Error fetching students:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await studentsApi.createStudent(newStudent);
      setShowCreateModal(false);
      setNewStudent({
        firstName: "",
        lastName: "",
        middleName: "",
        studentId: "",
        yearEnrolled: "",
        birthDate: "",
      });
      fetchStudents();
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      console.log("Updating student:", selectedStudent);
      console.log("Student ID:", selectedStudent.id);
      console.log("Student ID type:", typeof selectedStudent.id);
      await studentsApi.updateStudent(selectedStudent.id, selectedStudent);
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      alert(`Error updating student: ${error.message || error}`);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await studentsApi.deleteStudent(studentId);
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const getGradeLevelDisplay = (gradeLevel) => {
    if (gradeLevel <= 6) return `Grade ${gradeLevel} (Elementary)`;
    if (gradeLevel <= 10) return `Grade ${gradeLevel} (Junior High)`;
    return `Grade ${gradeLevel} (Senior High)`;
  };

  const studentColumns = [
    {
      key: "name",
      header: "Student Name",
      cell: (student) => (
        <div>
          <div className="font-medium text-gray-900">
            {student.firstName} {student.lastName}
          </div>
          <div className="text-sm text-gray-600">ID: {student.studentId}</div>
        </div>
      ),
    },
    {
      key: "birthDate",
      header: "Birth Date",
      cell: (student) => (
        <div className="text-gray-900">
          {student.birthDate ? formatDate(student.birthDate) : "N/A"}
        </div>
      ),
    },
    {
      key: "yearEnrolled",
      header: "Year Enrolled",
      cell: (student) => (
        <div className="text-gray-900">{student.yearEnrolled || "N/A"}</div>
      ),
    },
    {
      key: "parent",
      header: "Parent",
      cell: (student) => (
        <div>
          {student.parent ? (
            <>
              <div className="font-medium text-gray-900">
                {student.parent.name}
              </div>
              <div className="text-sm text-gray-600">
                {student.parent.email}
              </div>
            </>
          ) : (
            <span className="text-gray-500">No parent linked</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (student) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStudent(student);
              setShowEditModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteStudent(student.id)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const gradeLevels = Array.from({ length: 12 }, (_, i) => i + 1);

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
            Students Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage student records and parent links
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Add New Student
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="text-2xl font-bold text-blue-600">{students.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
          <h3 className="text-sm font-medium text-gray-500">
            With Parent Linked
          </h3>
          <p className="text-2xl font-bold text-emerald-600">
            {students.filter((s) => s.parentId).length}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-900">
        <div className="p-6 border-b border-gray-900">
          <h2 className="text-lg font-semibold text-gray-900">
            Student Records
          </h2>
        </div>
        <Table
          data={students}
          columns={studentColumns}
          emptyMessage="No students found"
        />
      </div>

      {/* Create Student Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Student"
        size="lg"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="e.g., Juan"
              value={newStudent.firstName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, firstName: e.target.value })
              }
              required
            />
            <Input
              label="Last Name"
              placeholder="e.g., Dela Cruz"
              value={newStudent.lastName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, lastName: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Middle Name"
            placeholder="e.g., Santos (Optional)"
            value={newStudent.middleName}
            onChange={(e) =>
              setNewStudent({ ...newStudent, middleName: e.target.value })
            }
          />
          <Input
            label="Student ID"
            placeholder="YYYY-NNNNN (e.g., 2024-12345)"
            value={newStudent.studentId}
            onChange={(e) =>
              setNewStudent({ ...newStudent, studentId: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Enrolled <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={newStudent.yearEnrolled}
              onChange={(e) =>
                setNewStudent({ ...newStudent, yearEnrolled: e.target.value })
              }
              required
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Birth Date"
            type="date"
            placeholder="YYYY-MM-DD"
            value={newStudent.birthDate}
            onChange={(e) =>
              setNewStudent({ ...newStudent, birthDate: e.target.value })
            }
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Student</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Student"
        size="lg"
      >
        {selectedStudent && (
          <form onSubmit={handleEditStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="e.g., Juan"
                value={selectedStudent.firstName}
                onChange={(e) =>
                  setSelectedStudent({
                    ...selectedStudent,
                    firstName: e.target.value,
                  })
                }
                required
              />
              <Input
                label="Last Name"
                placeholder="e.g., Dela Cruz"
                value={selectedStudent.lastName}
                onChange={(e) =>
                  setSelectedStudent({
                    ...selectedStudent,
                    lastName: e.target.value,
                  })
                }
                required
              />
            </div>
            <Input
              label="Middle Name"
              placeholder="e.g., Santos (Optional)"
              value={selectedStudent.middleName || ""}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  middleName: e.target.value,
                })
              }
            />
            <Input
              label="Student ID"
              placeholder="YYYY-NNNNN (e.g., 2024-12345)"
              value={selectedStudent.studentId}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  studentId: e.target.value,
                })
              }
              required
              disabled
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Enrolled <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                value={selectedStudent.yearEnrolled || ""}
                onChange={(e) =>
                  setSelectedStudent({
                    ...selectedStudent,
                    yearEnrolled: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Birth Date"
              type="date"
              value={
                selectedStudent.birthDate
                  ? selectedStudent.birthDate.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  birthDate: e.target.value,
                })
              }
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Student</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StudentsManagement;
