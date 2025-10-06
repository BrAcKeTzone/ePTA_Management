import { useState, useEffect } from "react";
import { useContributionsStore } from "../../store/contributionsStore";
import { useProjectsStore } from "../../store/projectsStore";
import { useAuthStore } from "../../store/authStore";
import { Card } from "../../components/UI/Card";
import { Badge } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Table } from "../../components/UI/Table";
import { Modal } from "../../components/UI/Modal";
import { Input } from "../../components/UI/Input";

export default function ParentContributions() {
  const { user } = useAuthStore();
  const { contributions, fetchMyContributions, loading, addContribution } =
    useContributionsStore();
  const { projects, fetchProjects } = useProjectsStore();

  const [filter, setFilter] = useState("all"); // all, project, general
  const [sortBy, setSortBy] = useState("date"); // date, amount, project
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [showContributeModal, setShowContributeModal] = useState(false);

  // Contribution form state
  const [contributionForm, setContributionForm] = useState({
    projectId: "",
    amount: "",
    description: "",
    type: "CASH", // CASH, INKIND
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchMyContributions();
    fetchProjects();
  }, [fetchMyContributions, fetchProjects]);

  // Filter and sort contributions
  const filteredContributions = contributions
    .filter((contribution) => {
      if (filter === "all") return true;
      if (filter === "project") return contribution.projectId !== null;
      if (filter === "general") return contribution.projectId === null;
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "date") {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortBy === "amount") {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortBy === "project") {
        aValue = a.project?.name || "";
        bValue = b.project?.name || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate contribution statistics
  const totalContributions = contributions.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const projectContributions = contributions
    .filter((c) => c.projectId)
    .reduce((sum, c) => sum + c.amount, 0);
  const generalContributions = contributions
    .filter((c) => !c.projectId)
    .reduce((sum, c) => sum + c.amount, 0);
  const averageContribution =
    contributions.length > 0
      ? (totalContributions / contributions.length).toFixed(2)
      : 0;

  // Handle contribution form submission
  const handleContribute = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors = {};
    if (!contributionForm.amount || parseFloat(contributionForm.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await addContribution({
        ...contributionForm,
        amount: parseFloat(contributionForm.amount),
        projectId: contributionForm.projectId || null,
      });

      setShowContributeModal(false);
      setContributionForm({
        projectId: "",
        amount: "",
        description: "",
        type: "CASH",
      });
    } catch (error) {
      setFormErrors({ submit: error.message });
    }
  };

  const contributionColumns = [
    {
      key: "date",
      header: "Date",
      render: (contribution) => (
        <div>
          <p className="font-medium text-gray-900">
            {new Date(contribution.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(contribution.date).toLocaleDateString("en-US", {
              weekday: "long",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "project",
      header: "Project/Purpose",
      render: (contribution) => (
        <div>
          <p className="font-medium text-gray-900">
            {contribution.project?.name || "General Fund"}
          </p>
          {contribution.project?.description && (
            <p className="text-sm text-gray-600">
              {contribution.project.description}
            </p>
          )}
          {contribution.description && (
            <p className="text-sm text-gray-500">
              Note: {contribution.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (contribution) => (
        <div>
          <p className="font-bold text-green-600 text-lg">
            ₱{contribution.amount.toLocaleString()}
          </p>
          <Badge
            variant={contribution.type === "CASH" ? "success" : "info"}
            size="sm"
          >
            {contribution.type}
          </Badge>
        </div>
      ),
    },
    {
      key: "receipt",
      header: "Receipt/Status",
      render: (contribution) => (
        <div>
          {contribution.receiptNumber && (
            <p className="text-sm font-medium text-gray-900">
              Receipt: {contribution.receiptNumber}
            </p>
          )}
          <Badge
            variant={
              contribution.status === "VERIFIED"
                ? "success"
                : contribution.status === "PENDING"
                ? "warning"
                : "danger"
            }
          >
            {contribution.status}
          </Badge>
          {contribution.verifiedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Verified: {new Date(contribution.verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Contributions
            </h1>
            <p className="text-gray-600">
              Track your financial contributions to PTA projects and activities
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowContributeModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              + Make Contribution
            </Button>
            <Button href="/parent/dashboard" variant="outline">
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ₱{totalContributions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Contributions</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              ₱{projectContributions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Project Contributions</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              ₱{generalContributions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">General Fund</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              ₱{averageContribution}
            </p>
            <p className="text-sm text-gray-600">Average Amount</p>
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Contributions</option>
                <option value="project">Project-Specific</option>
                <option value="general">General Fund</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="amount-desc">Amount (Highest First)</option>
                <option value="amount-asc">Amount (Lowest First)</option>
                <option value="project-asc">Project (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredContributions.length} of {contributions.length}{" "}
            contributions
          </div>
        </div>
      </Card>

      {/* Contributions Table */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Contribution History
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredContributions.length > 0 ? (
          <Table
            columns={contributionColumns}
            data={filteredContributions}
            keyField="id"
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Contributions Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === "all"
                ? "You haven't made any contributions yet."
                : `No ${filter} contributions found.`}
            </p>
            <Button
              onClick={() => setShowContributeModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Make Your First Contribution
            </Button>
          </div>
        )}
      </Card>

      {/* Active Projects */}
      {projects.filter((p) => p.status === "ACTIVE").length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Projects Seeking Contributions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .filter((project) => project.status === "ACTIVE")
              .map((project) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-gray-900 mb-2">
                    {project.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {project.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target:</span>
                      <span className="font-medium">
                        ₱{project.budget?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Raised:</span>
                      <span className="font-medium text-green-600">
                        ₱{project.totalContributions?.toLocaleString() || 0}
                      </span>
                    </div>
                    {project.budget && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((project.totalContributions || 0) /
                                project.budget) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setContributionForm({
                        ...contributionForm,
                        projectId: project.id,
                      });
                      setShowContributeModal(true);
                    }}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Contribute to This Project
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Contribution Guidelines */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contribution Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              How to Contribute
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click "Make Contribution" button</li>
              <li>• Choose project or general fund</li>
              <li>• Enter amount and optional note</li>
              <li>• Submit for verification</li>
              <li>• Receive receipt confirmation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Payment Methods</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cash (submit to PTA officers)</li>
              <li>• Bank transfer (get details from admin)</li>
              <li>• In-kind donations (specify details)</li>
              <li>• Check payments (payable to JHCSC PTA)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Contribution Modal */}
      <Modal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        title="Make a Contribution"
        size="md"
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project (Optional)
            </label>
            <select
              value={contributionForm.projectId}
              onChange={(e) =>
                setContributionForm({
                  ...contributionForm,
                  projectId: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">General Fund</option>
              {projects
                .filter((project) => project.status === "ACTIVE")
                .map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contribution Type
            </label>
            <select
              value={contributionForm.type}
              onChange={(e) =>
                setContributionForm({
                  ...contributionForm,
                  type: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CASH">Cash</option>
              <option value="INKIND">In-Kind</option>
            </select>
          </div>

          <Input
            label="Amount (₱)"
            type="number"
            step="0.01"
            min="0"
            value={contributionForm.amount}
            onChange={(e) =>
              setContributionForm({
                ...contributionForm,
                amount: e.target.value,
              })
            }
            error={formErrors.amount}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description/Note (Optional)
            </label>
            <textarea
              value={contributionForm.description}
              onChange={(e) =>
                setContributionForm({
                  ...contributionForm,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about your contribution..."
            />
          </div>

          {formErrors.submit && (
            <div className="text-red-600 text-sm">{formErrors.submit}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowContributeModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Submit Contribution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
