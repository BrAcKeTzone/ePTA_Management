import { useState, useEffect } from "react";
import { useUsersStore } from "../../store/usersStore";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Card } from "../../components/UI/Card";
import { Table } from "../../components/UI/Table";
import { Modal } from "../../components/UI/Modal";
import { Badge } from "../../components/UI/Badge";
import { Select } from "../../components/UI/Select";

export default function UsersManagement() {
  const { users, loading, fetchUsers, updateUserRole, deleteUser } =
    useUsersStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view"); // 'view', 'edit', 'delete'

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setModalType("delete");
    setShowModal(true);
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleUserDelete = async () => {
    try {
      await deleteUser(selectedUser.id);
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {row.original.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.original.name}</p>
            <p className="text-sm text-gray-600">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: ({ row }) => (
        <Badge
          variant={row.original.role === "ADMIN" ? "primary" : "secondary"}
        >
          {row.original.role}
        </Badge>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: ({ row }) => row.original.phone || "N/A",
    },
    {
      header: "Students",
      accessorKey: "students",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.students?.length || 0} linked
        </span>
      ),
    },
    {
      header: "Joined",
      accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditUser(row.original)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="red"
            onClick={() => handleDeleteUser(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
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
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage parent and admin accounts</p>
        </div>
        <Button href="/admin/users/invite">Invite User</Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PARENT">Parent</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          data={filteredUsers}
          columns={columns}
          searchPlaceholder="Search users..."
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        isOpen={showModal && modalType === "edit"}
        onClose={() => setShowModal(false)}
        title="Edit User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Information
              </label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <Select
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                <option value="PARENT">Parent</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleRoleUpdate(selectedUser.id, selectedUser.role)
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showModal && modalType === "delete"}
        onClose={() => setShowModal(false)}
        title="Delete User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Are you sure you want to delete{" "}
                <strong>{selectedUser.name}</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button color="red" onClick={handleUserDelete}>
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
