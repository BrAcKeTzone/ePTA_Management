import React, { useState, useEffect } from "react";
import { studentsApi } from "../../api/studentsApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import DashboardCard from "../../components/DashboardCard";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/formatDate";

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [paginatedStudents, setPaginatedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    studentId: "",
    yearEnrolled: "",
    birthDate: "",
  });
  const [studentStats, setStudentStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Separate state for search input to avoid triggering API calls on every keystroke
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Pending filters (what user has selected but not yet applied)
  const [pendingFilters, setPendingFilters] = useState({
    search: "",
    status: "",
    yearEnrolled: "",
  });

  // Applied filters (what filters are currently active)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    yearEnrolled: "",
    page: 1,
    limit: 10,
  });

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

  // Load initial data
  useEffect(() => {
    fetchStudents();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchInput !== pendingFilters.search) {
      setIsSearching(true);
    }

    const timeoutId = setTimeout(() => {
      setPendingFilters((prev) => ({ ...prev, search: searchInput }));
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Apply filters and pagination whenever applied filters change
  useEffect(() => {
    applyFiltersAndPagination();
  }, [
    filters.search,
    filters.status,
    filters.yearEnrolled,
    filters.page,
    filters.limit,
    students,
  ]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      const response = await studentsApi.getAllStudents(params);

      // Response structure: response.data.data.students
      const studentsArray = response.data?.data?.students || [];
      setStudents(studentsArray);
      calculateStats(studentsArray);
    } catch (error) {
      console.error("Error fetching students:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (studentsArray) => {
    const total = studentsArray.length;
    const active = studentsArray.filter((s) => s.status === "ACTIVE").length;
    const inactive = studentsArray.filter(
      (s) => s.status === "INACTIVE"
    ).length;
    setStudentStats({ total, active, inactive });
  };

  const applyFiltersAndPagination = () => {
    let filtered = [...students];

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((student) => {
        const fullName = `${student.firstName} ${student.middleName || ""} ${
          student.lastName
        }`.toLowerCase();
        const studentId = student.studentId?.toLowerCase() || "";
        return (
          fullName.includes(searchLower) || studentId.includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (filters.status && filters.status !== "") {
      filtered = filtered.filter(
        (student) => student.status === filters.status
      );
    }

    // Apply year enrolled filter
    if (filters.yearEnrolled && filters.yearEnrolled !== "") {
      filtered = filtered.filter(
        (student) => student.yearEnrolled === parseInt(filters.yearEnrolled)
      );
    }

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / filters.limit);
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    // Ensure current page doesn't exceed totalPages
    if (filters.page > totalPages && totalPages > 0) {
      setFilters((prev) => ({ ...prev, page: totalPages }));
      return;
    }

    setPaginatedStudents(paginatedData);
    setFilters((prev) => ({
      ...prev,
      totalPages,
      totalCount: filtered.length,
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (newLimit) => {
    setFilters((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Handle applying pending filters
  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: pendingFilters.search,
      status: pendingFilters.status,
      yearEnrolled: pendingFilters.yearEnrolled,
      page: 1, // Reset to page 1 when filters are applied
    }));
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchInput("");
    setPendingFilters({
      search: "",
      status: "",
      yearEnrolled: "",
    });
    setFilters({
      search: "",
      status: "",
      yearEnrolled: "",
      page: 1,
      limit: 10,
    });
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

  const handleDeleteStudent = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDeleteStudent = async () => {
    if (selectedStudent) {
      try {
        await studentsApi.deleteStudent(selectedStudent.id);
        setShowDeleteModal(false);
        setSelectedStudent(null);
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
        alert(`Error deleting student: ${error.message || error}`);
      }
    }
  };

  const getGradeLevelDisplay = (gradeLevel) => {
    if (gradeLevel <= 6) return `Grade ${gradeLevel} (Elementary)`;
    if (gradeLevel <= 10) return `Grade ${gradeLevel} (Junior High)`;
    return `Grade ${gradeLevel} (Senior High)`;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const studentColumns = [
    {
      header: "Student Name",
      accessor: "firstName",
      cell: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">
              {row.firstName} {row.middleName ? row.middleName + " " : ""}
              {row.lastName}
            </p>
          </div>
          <p className="text-sm text-gray-500">ID: {row.studentId}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Year Enrolled",
      accessor: "yearEnrolled",
      cell: (row) => (
        <div className="text-sm text-gray-600">{row.yearEnrolled || "N/A"}</div>
      ),
    },
    {
      header: "Birth Date",
      accessor: "birthDate",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {row.birthDate ? formatDate(row.birthDate) : "N/A"}
        </div>
      ),
    },
    {
      header: "Parent",
      accessor: "parent",
      cell: (row) => (
        <div>
          {row.parent ? (
            <>
              <div className="font-medium text-gray-900">{row.parent.name}</div>
              <div className="text-sm text-gray-600">{row.parent.email}</div>
            </>
          ) : (
            <span className="text-gray-500">No parent linked</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setSelectedStudent(row);
              setShowEditModal(true);
            }}
            variant="outline"
            size="sm"
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDeleteStudent(row)}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading && (!students || students.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalCount = filters.totalCount || 0;
  const totalPages = filters.totalPages || 1;
  const currentPage = filters.page;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header with Title and Add Button */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Students Management
          </h1>
          <p className="text-gray-600">
            Manage student records and parent links
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          className="whitespace-nowrap"
        >
          Add New Student
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard title="Total Students" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {studentStats.total}
          </div>
        </DashboardCard>

        <DashboardCard title="Active Students" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">
            {studentStats.active}
          </div>
        </DashboardCard>

        <DashboardCard title="Inactive Students" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">
            {studentStats.inactive}
          </div>
        </DashboardCard>
      </div>

      {/* Filters */}
      <DashboardCard title="Filter Students" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              label="Search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Name or Student ID"
            />
            {isSearching && (
              <div className="absolute right-2 top-8 transform">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={pendingFilters.status}
              onChange={(e) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Enrolled
            </label>
            <select
              value={pendingFilters.yearEnrolled}
              onChange={(e) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  yearEnrolled: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-start gap-2 sm:gap-3">
          <Button onClick={handleApplyFilters} variant="primary">
            Apply Filters
          </Button>
          <Button onClick={handleClearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      </DashboardCard>

      {/* Students Table */}
      <DashboardCard
        title={`Students (${totalCount || 0})${
          filters.search || filters.status || filters.yearEnrolled
            ? " - Filtered"
            : ""
        }`}
        headerActions={
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 font-medium">Show:</label>
            <select
              value={filters.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>
        }
      >
        {paginatedStudents && paginatedStudents.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table columns={studentColumns} data={paginatedStudents} />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {paginatedStudents.map((student, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        ID: {student.studentId}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-gray-500">
                      Year: {student.yearEnrolled || "N/A"}
                    </span>
                    <span className="text-gray-500">
                      DOB:{" "}
                      {student.birthDate
                        ? formatDate(student.birthDate)
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm mb-3">
                    <div>
                      {student.parent ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.parent.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.parent.email}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs">
                          No parent linked
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowEditModal(true);
                      }}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStudent(student)}
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination and Entries Per Page */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  itemsPerPage={filters.limit}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {loading || isSearching
                ? "Loading students..."
                : filters.search
                ? `No students found matching "${filters.search}"`
                : filters.status || filters.yearEnrolled
                ? "No students found matching your criteria."
                : "No students found."}
            </p>
            {!loading &&
              !isSearching &&
              (filters.search || filters.status || filters.yearEnrolled) && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="mt-3"
                >
                  Clear Filters
                </Button>
              )}
          </div>
        )}
      </DashboardCard>

      {/* Create Student Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewStudent({
            firstName: "",
            lastName: "",
            middleName: "",
            studentId: "",
            yearEnrolled: "",
            birthDate: "",
          });
        }}
        title="Add New Student"
        size="large"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setNewStudent({
                  firstName: "",
                  lastName: "",
                  middleName: "",
                  studentId: "",
                  yearEnrolled: "",
                  birthDate: "",
                });
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        title="Edit Student"
        size="large"
      >
        {selectedStudent && (
          <form onSubmit={handleEditStudent} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStudent(null);
        }}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the student{" "}
            <strong>
              {selectedStudent?.firstName} {selectedStudent?.lastName}
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedStudent(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmDeleteStudent}
              disabled={loading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete Student"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentsManagement;
