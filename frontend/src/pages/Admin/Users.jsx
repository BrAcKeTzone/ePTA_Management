import React, { useState, useEffect } from "react";
import { userApi } from "../../api/userApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "parent",
    phoneNumber: "",
    address: "",
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { role: filter } : {};
      const response = await userApi.getAllUsers(params);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userApi.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "parent",
        phoneNumber: "",
        address: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateUser(selectedUser.id, selectedUser);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userApi.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleResetPassword = async (userId) => {
    if (
      window.confirm("Are you sure you want to reset this user's password?")
    ) {
      try {
        await userApi.resetUserPassword(userId);
        alert(
          "Password reset successfully. User will receive instructions via email."
        );
      } catch (error) {
        console.error("Error resetting password:", error);
      }
    }
  };

  const userColumns = [
    {
      key: "name",
      header: "Name",
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {user.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {user.email}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.role === "admin"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      header: "Phone",
      render: (user) => user.phoneNumber || "Not provided",
    },
    {
      key: "isVerified",
      header: "Status",
      render: (user) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.isVerified
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {user.isVerified ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user) => formatDate(user.createdAt),
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
            onClick={() => handleResetPassword(user.id)}
          >
            Reset Password
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
            Users Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage parent and admin accounts
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Add New User</Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {["all", "parent", "admin"].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              {filterOption === "all" ? "All Users" : `${filterOption}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Users
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Parents
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter((u) => u.role === "parent").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Admins
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Verified
          </h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {users.filter((u) => u.isVerified).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {filter === "all" ? "All Users" : `${filter}s`}
          </h2>
        </div>
        <Table
          data={users}
          columns={userColumns}
          emptyMessage="No users found"
        />
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New User"
        size="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="parent">Parent</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <Input
            label="Phone Number"
            value={newUser.phoneNumber}
            onChange={(e) =>
              setNewUser({ ...newUser, phoneNumber: e.target.value })
            }
            placeholder="+63 912 345 6789"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              value={newUser.address}
              onChange={(e) =>
                setNewUser({ ...newUser, address: e.target.value })
              }
              placeholder="Enter complete address"
            />
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
            <Input
              label="Full Name"
              value={selectedUser.name}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, name: e.target.value })
              }
              required
            />
            <Input
              label="Email"
              type="email"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                <option value="parent">Parent</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <Input
              label="Phone Number"
              value={selectedUser.phoneNumber || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  phoneNumber: e.target.value,
                })
              }
              placeholder="+63 912 345 6789"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                value={selectedUser.address || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, address: e.target.value })
                }
                placeholder="Enter complete address"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isVerified"
                checked={selectedUser.isVerified}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    isVerified: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label
                htmlFor="isVerified"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                User is verified
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
