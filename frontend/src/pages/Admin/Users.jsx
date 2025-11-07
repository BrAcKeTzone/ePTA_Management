import React, { useState, useEffect } from "react";
import { useUserManagementStore } from "../../store/userManagementStore";
import { useAuthStore } from "../../store/authStore";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import DashboardCard from "../../components/DashboardCard";
import { formatDate } from "../../utils/formatDate";

const UsersManagement = () => {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPrevPage,
    pageSize,
    filters,
    sortBy,
    sortOrder,
    getAllUsers,
    setFilters,
    setSorting,
    setPageSize,
    setCurrentPage,
    clearFilters,
    addUser,
    updateUser,
    deleteUser,
    getUserStats,
    clearError,
  } = useUserManagementStore();

  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    role: "PARENT",
    phone: "",
  });

  // Local filter state for form inputs
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || "",
    role: filters.role || "",
    isActive: filters.isActive || "",
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, sortBy, sortOrder, filters]);

  const fetchData = async () => {
    await getAllUsers();
    const statsData = await getUserStats();
    setStats(statsData);
  };

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      search: "",
      role: "",
      isActive: "",
      dateFrom: "",
      dateTo: "",
    };
    setLocalFilters(emptyFilters);
    clearFilters();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSorting(column, sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSorting(column, "asc");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await addUser({
        firstName: newUser.firstName,
        middleName: newUser.middleName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        password: newUser.password,
      });
      setShowCreateModal(false);
      setNewUser({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        role: "PARENT",
        phone: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(selectedUser.id, selectedUser);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const userColumns = [
    {
      key: "firstName",
      header: "User",
      sortable: true,
      render: (user) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="font-medium text-gray-900">
              {user.firstName} {user.middleName ? user.middleName + " " : ""}
              {user.lastName}
            </div>
            {user.id === currentUser?.id && (
              <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                You
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">{user.email}</div>
          {user.phone && (
            <div className="text-xs text-gray-500">{user.phone}</div>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (user) => (
        <StatusBadge
          status={user.role}
          variant={user.role === "ADMIN" ? "success" : "info"}
        />
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      render: (user) => (
        <StatusBadge
          status={user.isActive ? "Active" : "Inactive"}
          variant={user.isActive ? "success" : "warning"}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (user) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatDate(user.createdAt)}
          </div>
          <div className="text-xs text-gray-500">
            Updated: {formatDate(user.updatedAt)}
          </div>
        </div>
      ),
    },
    {
      key: "_count",
      header: "Activity",
      render: (user) => (
        <div className="text-xs text-gray-600">
          <div>Students: {user._count?.students || 0}</div>
          <div>Contributions: {user._count?.contributions || 0}</div>
          <div>Attendance: {user._count?.attendances || 0}</div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex space-x-2">
          {user.id !== currentUser?.id && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  setShowEditModal(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </>
          )}
          {user.id === currentUser?.id && (
            <span className="text-xs text-gray-500">Current User</span>
          )}
        </div>
      ),
    },
  ];

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Users Management
          </h1>
          <p className="text-gray-600">
            Manage user accounts with advanced filtering and sorting
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          className="w-full md:w-auto whitespace-nowrap"
        >
          Add New User
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={clearError}
          >
            <span className="sr-only">Dismiss</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <DashboardCard title="Total Users" className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active: {stats.activeUsers} | Inactive: {stats.inactiveUsers}
            </p>
          </DashboardCard>

          <DashboardCard title="Parents" className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {stats.parentCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              With Students: {stats.usersWithStudents}
            </p>
          </DashboardCard>

          <DashboardCard title="Admins" className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">
              {stats.adminCount}
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Users" className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {stats.recentUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </DashboardCard>
        </div>
      )}

      {/* Filters */}
      <DashboardCard title="Filter Users" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
          <Input
            label="Search"
            value={localFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Name, email, phone..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
              value={localFilters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
              value={localFilters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <Input
            label="From Date"
            type="date"
            value={localFilters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          />

          <Input
            label="To Date"
            type="date"
            value={localFilters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={applyFilters} size="sm" className="w-full sm:w-auto">
            Apply Filters
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            Clear All
          </Button>
        </div>
      </DashboardCard>

      {/* Users Table */}
      <DashboardCard
        title={`Users (${totalCount || 0})${
          localFilters.search ||
          localFilters.role ||
          localFilters.isActive !== ""
            ? " - Filtered"
            : ""
        }`}
        headerActions={
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 font-medium">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
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
        {users && users.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table
                data={users}
                columns={userColumns}
                emptyMessage="No users found"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                loading={loading}
              />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              ) : users && users.length > 0 ? (
                <div className="p-4 space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 break-words">
                            {user.firstName} {user.middleName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 break-all">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "PARENT"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="break-all">
                            {user.contactNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Address:</span>
                          <span className="break-all text-right">
                            {user.address || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Joined:</span>
                          <span>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No users found
                </div>
              )}
            </div>

            {/* Pagination */}
            {users && users.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  hasNext={hasNextPage}
                  hasPrev={hasPrevPage}
                  totalItems={totalCount}
                  itemsPerPage={pageSize}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {loading ? "Loading users..." : "No users found"}
          </div>
        )}
      </DashboardCard>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New User"
        size="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newUser.firstName}
              onChange={(e) =>
                setNewUser({ ...newUser, firstName: e.target.value })
              }
              required
            />
            <Input
              label="Middle Name"
              value={newUser.middleName}
              onChange={(e) =>
                setNewUser({ ...newUser, middleName: e.target.value })
              }
            />
            <Input
              label="Last Name"
              value={newUser.lastName}
              onChange={(e) =>
                setNewUser({ ...newUser, lastName: e.target.value })
              }
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={newUser.phone}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
              placeholder="+63-XXX-XXX-XXXX"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />

          <PasswordInput
            label="Password"
            name="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
            placeholder="Minimum 6 characters"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="PARENT">Parent</option>
              <option value="ADMIN">Administrator</option>
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
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <form onSubmit={handleEditUser} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={selectedUser.firstName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    firstName: e.target.value,
                  })
                }
                required
              />

              <Input
                label="Last Name"
                value={selectedUser.lastName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    lastName: e.target.value,
                  })
                }
                required
              />

              <Input
                label="Middle Name"
                value={selectedUser.middleName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    middleName: e.target.value,
                  })
                }
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
              required
            />

            <Input
              label="Phone"
              value={selectedUser.phone || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, phone: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                <option value="PARENT">Parent</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={selectedUser.isActive}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    isActive: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                User is active
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update User</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UsersManagement;
