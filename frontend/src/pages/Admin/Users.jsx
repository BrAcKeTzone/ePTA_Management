import React, { useState, useEffect } from "react";
import { useUserManagementStore } from "../../store/userManagementStore";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatDate";

const UsersManagement = () => {
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
          <div className="font-medium text-gray-900">
            {user.firstName} {user.middleName ? user.middleName + " " : ""}
            {user.lastName}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts with advanced filtering and sorting
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Add New User</Button>
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

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalUsers}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Active: {stats.activeUsers} | Inactive: {stats.inactiveUsers}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Parents</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.parentCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              With Students: {stats.usersWithStudents}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Admins</h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats.adminCount}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Recent Users</h3>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.recentUsers}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Filters & Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
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

        <div className="flex space-x-2">
          <Button onClick={applyFilters} size="sm">
            Apply Filters
          </Button>
          <Button onClick={handleClearFilters} variant="outline" size="sm">
            Clear All
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Users ({totalCount})
              </h2>
              <p className="text-sm text-gray-600">
                Showing {users.length} of {totalCount} users
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                className="p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>

        <Table
          data={users}
          columns={userColumns}
          emptyMessage="No users found"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          loading={loading}
        />

        {/* Pagination */}
        <div className="p-6 border-t border-gray-200">
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
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New User"
        size="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
