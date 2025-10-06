import { useState, useEffect } from "react";
import { useContributionsStore } from "../../store/contributionsStore";
import { useProjectsStore } from "../../store/projectsStore";
import { useUsersStore } from "../../store/usersStore";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Card } from "../../components/UI/Card";
import { Table } from "../../components/UI/Table";
import { Modal } from "../../components/UI/Modal";
import { Select } from "../../components/UI/Select";
import { Badge } from "../../components/UI/Badge";

export default function ContributionsManagement() {
  const {
    contributions,
    loading,
    fetchContributions,
    createContribution,
    updateContribution,
  } = useContributionsStore();
  const { projects, fetchProjects } = useProjectsStore();
  const { users, fetchUsers } = useUsersStore();

  const [showModal, setShowModal] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);
  const [formData, setFormData] = useState({
    parentId: "",
    projectId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchContributions();
    fetchProjects();
    fetchUsers();
  }, [fetchContributions, fetchProjects, fetchUsers]);

  const parents = users.filter((user) => user.role === "PARENT");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContribution) {
        await updateContribution(editingContribution.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        await createContribution({
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }
      setShowModal(false);
      resetForm();
      fetchContributions();
    } catch (error) {
      console.error("Failed to save contribution:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      parentId: "",
      projectId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingContribution(null);
  };

  const handleEdit = (contribution) => {
    setEditingContribution(contribution);
    setFormData({
      parentId: contribution.parentId.toString(),
      projectId: contribution.projectId?.toString() || "",
      amount: contribution.amount.toString(),
      date: new Date(contribution.date).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const columns = [
    {
      header: "Parent",
      accessorKey: "parent",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.original.parent?.name}
          </p>
          <p className="text-sm text-gray-600">{row.original.parent?.email}</p>
        </div>
      ),
    },
    {
      header: "Project",
      accessorKey: "project",
      cell: ({ row }) => row.original.project?.name || "General Fund",
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          ₱{row.original.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      header: "Recorded",
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
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  // Calculate summary statistics
  const totalContributions = contributions.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const monthlyContributions = contributions
    .filter((c) => new Date(c.date).getMonth() === new Date().getMonth())
    .reduce((sum, c) => sum + c.amount, 0);

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
            Contributions Management
          </h1>
          <p className="text-gray-600">
            Track and manage financial contributions
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>Record Contribution</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Contributions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{totalContributions.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{monthlyContributions.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contributors</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(contributions.map((c) => c.parentId)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Contributions Table */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            All Contributions
          </h3>
        </div>
        <Table
          data={contributions}
          columns={columns}
          searchPlaceholder="Search contributions..."
        />
      </Card>

      {/* Add/Edit Contribution Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={
          editingContribution ? "Edit Contribution" : "Record New Contribution"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent
            </label>
            <Select
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              required
            >
              <option value="">Select parent...</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.email})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project (Optional)
            </label>
            <Select
              value={formData.projectId}
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value })
              }
            >
              <option value="">General Fund</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₱)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingContribution ? "Update" : "Record"} Contribution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
