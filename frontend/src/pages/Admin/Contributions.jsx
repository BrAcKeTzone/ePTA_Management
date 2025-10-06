import React, { useState, useEffect } from "react";
import { contributionsApi } from "../../api/contributionsApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const ContributionsManagement = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [newContribution, setNewContribution] = useState({
    parentId: "",
    projectId: "",
    amount: "",
    description: "",
    paymentMethod: "cash",
    receiptNumber: "",
  });
  const [reportFilters, setReportFilters] = useState({
    startDate: "",
    endDate: "",
    projectId: "",
    format: "pdf",
  });

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await contributionsApi.getAllContributions();
      setContributions(response.data?.contributions || []);
    } catch (error) {
      console.error("Error fetching contributions:", error);
      setContributions([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRecordContribution = async (e) => {
    e.preventDefault();
    try {
      await contributionsApi.recordContribution(newContribution);
      setShowRecordModal(false);
      setNewContribution({
        parentId: "",
        projectId: "",
        amount: "",
        description: "",
        paymentMethod: "cash",
        receiptNumber: "",
      });
      fetchContributions();
    } catch (error) {
      console.error("Error recording contribution:", error);
    }
  };

  const handleVerifyContribution = async (contributionId) => {
    try {
      await contributionsApi.verifyContribution(contributionId);
      fetchContributions();
    } catch (error) {
      console.error("Error verifying contribution:", error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (reportFilters.format === "pdf") {
        const response = await contributionsApi.exportFinancialReportPDF(
          reportFilters
        );
        // Handle PDF download
        const blob = new Blob([response], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `financial-report-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
        a.click();
      } else {
        const response = await contributionsApi.exportFinancialReportCSV(
          reportFilters
        );
        // Handle CSV download
        const blob = new Blob([response], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `financial-report-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;
        a.click();
      }
      setShowReportsModal(false);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const contributionColumns = [
    {
      key: "parent",
      header: "Parent",
      render: (contribution) => (
        <div>
          <div className="font-medium">{contribution.parentName}</div>
          <div className="text-sm text-gray-600">
            {contribution.studentName}
          </div>
        </div>
      ),
    },
    {
      key: "project",
      header: "Project",
      render: (contribution) => contribution.projectName || "General Fund",
    },
    {
      key: "amount",
      header: "Amount",
      render: (contribution) => `₱${contribution.amount.toLocaleString()}`,
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      render: (contribution) => (
        <span className="capitalize">{contribution.paymentMethod}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (contribution) => formatDate(contribution.createdAt),
    },
    {
      key: "status",
      header: "Status",
      render: (contribution) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            contribution.isVerified
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {contribution.isVerified ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (contribution) => (
        <div className="flex space-x-2">
          {!contribution.isVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerifyContribution(contribution.id)}
            >
              Verify
            </Button>
          )}
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
          <h1 className="text-2xl font-bold text-gray-900">
            Contributions Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage parent contributions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowReportsModal(true)}>
            Generate Report
          </Button>
          <Button onClick={() => setShowRecordModal(true)}>
            Record Contribution
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Collected</h3>
          <p className="text-2xl font-bold text-green-600">
            ₱
            {contributions
              .reduce((sum, c) => sum + (c.isVerified ? c.amount : 0), 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">
            Pending Verification
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            ₱
            {contributions
              .reduce((sum, c) => sum + (!c.isVerified ? c.amount : 0), 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">
            Total Contributions
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {contributions.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-2xl font-bold text-purple-600">
            ₱
            {contributions
              .filter(
                (c) =>
                  new Date(c.createdAt).getMonth() === new Date().getMonth()
              )
              .reduce((sum, c) => sum + (c.isVerified ? c.amount : 0), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Contributions</h2>
        </div>
        <Table
          data={contributions}
          columns={contributionColumns}
          emptyMessage="No contributions found"
        />
      </div>

      {/* Record Contribution Modal */}
      <Modal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        title="Record New Contribution"
      >
        <form onSubmit={handleRecordContribution} className="space-y-4">
          <Input
            label="Parent ID"
            value={newContribution.parentId}
            onChange={(e) =>
              setNewContribution({
                ...newContribution,
                parentId: e.target.value,
              })
            }
            placeholder="Enter parent ID"
            required
          />
          <Input
            label="Project ID (Optional)"
            value={newContribution.projectId}
            onChange={(e) =>
              setNewContribution({
                ...newContribution,
                projectId: e.target.value,
              })
            }
            placeholder="Leave empty for general fund"
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={newContribution.amount}
            onChange={(e) =>
              setNewContribution({ ...newContribution, amount: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              value={newContribution.description}
              onChange={(e) =>
                setNewContribution({
                  ...newContribution,
                  description: e.target.value,
                })
              }
              placeholder="Payment description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newContribution.paymentMethod}
              onChange={(e) =>
                setNewContribution({
                  ...newContribution,
                  paymentMethod: e.target.value,
                })
              }
            >
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="gcash">GCash</option>
            </select>
          </div>
          <Input
            label="Receipt Number (Optional)"
            value={newContribution.receiptNumber}
            onChange={(e) =>
              setNewContribution({
                ...newContribution,
                receiptNumber: e.target.value,
              })
            }
            placeholder="Receipt or reference number"
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRecordModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Record Contribution</Button>
          </div>
        </form>
      </Modal>

      {/* Generate Report Modal */}
      <Modal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        title="Generate Financial Report"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={reportFilters.startDate}
              onChange={(e) =>
                setReportFilters({
                  ...reportFilters,
                  startDate: e.target.value,
                })
              }
            />
            <Input
              label="End Date"
              type="date"
              value={reportFilters.endDate}
              onChange={(e) =>
                setReportFilters({ ...reportFilters, endDate: e.target.value })
              }
            />
          </div>
          <Input
            label="Project ID (Optional)"
            value={reportFilters.projectId}
            onChange={(e) =>
              setReportFilters({ ...reportFilters, projectId: e.target.value })
            }
            placeholder="Leave empty for all projects"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={reportFilters.format}
              onChange={(e) =>
                setReportFilters({ ...reportFilters, format: e.target.value })
              }
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReportsModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>Generate Report</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContributionsManagement;
