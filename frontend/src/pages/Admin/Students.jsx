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
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    gradeLevel: "",
    section: "",
    birthDate: "",
    parentId: "",
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, [filter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { gradeLevel: filter } : {};
      const response = await studentsApi.getAllStudents(params);
      // Response structure: response.data.data.students
      setStudents(response.data?.data?.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await userApi.getAllUsers({ role: "parent" });
      // Response structure: response.data.data.users
      setParents(response.data?.data?.users || []);
    } catch (error) {
      console.error("Error fetching parents:", error);
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
        studentId: "",
        gradeLevel: "",
        section: "",
        birthDate: "",
        parentId: "",
      });
      fetchStudents();
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      await studentsApi.updateStudent(selectedStudent.id, selectedStudent);
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
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

  const handleLinkParent = async (parentId) => {
    try {
      await studentsApi.linkParentToStudent(parentId, selectedStudent.id);
      setShowLinkModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error linking parent:", error);
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
      header: "Student",
      render: (student) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {student.firstName} {student.lastName}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            ID: {student.studentId}
          </div>
        </div>
      ),
    },
    {
      key: "gradeSection",
      header: "Grade & Section",
      render: (student) => (
        <div>
          <div className="font-medium">
            {getGradeLevelDisplay(student.gradeLevel)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Section: {student.section}
          </div>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent",
      render: (student) => (
        <div>
          {student.parentName ? (
            <>
              <div className="font-medium text-gray-900 dark:text-white">
                {student.parentName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {student.parentEmail}
              </div>
            </>
          ) : (
            <span className="text-red-600 dark:text-red-400">
              No parent linked
            </span>
          )}
        </div>
      ),
    },
    {
      key: "birthDate",
      header: "Birth Date",
      render: (student) => formatDate(student.birthDate),
    },
    {
      key: "createdAt",
      header: "Enrolled",
      render: (student) => formatDate(student.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (student) => (
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
            onClick={() => {
              setSelectedStudent(student);
              setShowLinkModal(true);
            }}
          >
            Link Parent
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage student records and parent links
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Add New Student
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setFilter("elementary")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "elementary"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            Elementary (K-6)
          </button>
          <button
            onClick={() => setFilter("junior")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "junior"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            Junior High (7-10)
          </button>
          <button
            onClick={() => setFilter("senior")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "senior"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            Senior High (11-12)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Students
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {students.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Elementary
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {students.filter((s) => s.gradeLevel <= 6).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            High School
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {students.filter((s) => s.gradeLevel > 6).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            With Parents
          </h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {students.filter((s) => s.parentId).length}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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
              value={newStudent.firstName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, firstName: e.target.value })
              }
              required
            />
            <Input
              label="Last Name"
              value={newStudent.lastName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, lastName: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Student ID"
            value={newStudent.studentId}
            onChange={(e) =>
              setNewStudent({ ...newStudent, studentId: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grade Level
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={newStudent.gradeLevel}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, gradeLevel: e.target.value })
                }
                required
              >
                <option value="">Select Grade</option>
                {gradeLevels.map((grade) => (
                  <option key={grade} value={grade}>
                    {getGradeLevelDisplay(grade)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Section"
              value={newStudent.section}
              onChange={(e) =>
                setNewStudent({ ...newStudent, section: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Birth Date"
            type="date"
            value={newStudent.birthDate}
            onChange={(e) =>
              setNewStudent({ ...newStudent, birthDate: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent (Optional)
            </label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newStudent.parentId}
              onChange={(e) =>
                setNewStudent({ ...newStudent, parentId: e.target.value })
              }
            >
              <option value="">Select Parent</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} - {parent.email}
                </option>
              ))}
            </select>
          </div>
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
              label="Student ID"
              value={selectedStudent.studentId}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  studentId: e.target.value,
                })
              }
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grade Level
                </label>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={selectedStudent.gradeLevel}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      gradeLevel: e.target.value,
                    })
                  }
                  required
                >
                  {gradeLevels.map((grade) => (
                    <option key={grade} value={grade}>
                      {getGradeLevelDisplay(grade)}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Section"
                value={selectedStudent.section}
                onChange={(e) =>
                  setSelectedStudent({
                    ...selectedStudent,
                    section: e.target.value,
                  })
                }
                required
              />
            </div>
            <Input
              label="Birth Date"
              type="date"
              value={selectedStudent.birthDate}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  birthDate: e.target.value,
                })
              }
              required
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

      {/* Link Parent Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Link Parent to Student"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Student: {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Grade {selectedStudent.gradeLevel} - {selectedStudent.section}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Parent
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {parents.map((parent) => (
                  <div
                    key={parent.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {parent.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {parent.email}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleLinkParent(parent.id)}
                    >
                      Link
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsManagement;
