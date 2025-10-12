import React, { useState, useEffect } from "react";
import { studentsApi } from "../../api/studentsApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";
import StatusBadge from "../../components/StatusBadge";

const StudentLinksManagement = () => {
  const [linkRequests, setLinkRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchLinkRequests();
  }, [filter]);

  const fetchLinkRequests = async () => {
    try {
      setLoading(true);
      // If filter is "all", don't send status parameter
      const params = filter === "all" ? {} : { status: filter.toUpperCase() };
      const response = await studentsApi.getPendingParentLinks(params);
      // Backend returns: { students: [...], pagination: {...} }
      const result = response.data?.data || {};
      const linksData = result.students || [];
      setLinkRequests(linksData);
    } catch (error) {
      console.error("Error fetching link requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (linkId) => {
    if (
      !window.confirm("Are you sure you want to approve this link request?")
    ) {
      return;
    }

    try {
      await studentsApi.approveParentLink(linkId);
      await fetchLinkRequests();
      alert("Link request approved successfully!");
    } catch (error) {
      console.error("Error approving link:", error);
      alert("Failed to approve link request. Please try again.");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      await studentsApi.rejectParentLink(selectedRequest.id, rejectReason);
      await fetchLinkRequests();
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
      alert("Link request rejected.");
    } catch (error) {
      console.error("Error rejecting link:", error);
      alert("Failed to reject link request. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: "warning", label: "Pending" },
      approved: { variant: "success", label: "Approved" },
      rejected: { variant: "danger", label: "Rejected" },
    };

    const config = statusMap[status?.toLowerCase()] || statusMap.pending;
    return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>;
  };

  const getRelationshipBadge = (relationship) => {
    const colors = {
      PARENT: "bg-blue-100 text-blue-800",
      GUARDIAN: "bg-purple-100 text-purple-800",
      OTHER: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[relationship] || colors.OTHER
        }`}
      >
        {relationship}
      </span>
    );
  };

  const columns = [
    {
      header: "Request Date",
      accessor: "createdAt",
      cell: (student) => (
        <div>
          <div className="font-medium text-gray-900">
            {formatDate(student.createdAt)}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(student.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      header: "Student Information",
      accessor: "studentId",
      cell: (student) => (
        <div>
          <div className="font-medium text-gray-900">
            {student.firstName} {student.lastName}
          </div>
          <div className="text-sm text-gray-600">
            Student ID: {student.studentId}
          </div>
          <div className="text-xs text-gray-500">
            {student.yearEnrolled ? `Year: ${student.yearEnrolled}` : ""}
          </div>
        </div>
      ),
    },
    {
      header: "Parent Information",
      accessor: "parentId",
      cell: (student) => (
        <div>
          <div className="font-medium text-gray-900">
            {student.parent?.name || "No parent assigned"}
          </div>
          {student.parent && (
            <>
              <div className="text-sm text-gray-600">
                {student.parent.email || "N/A"}
              </div>
              {student.parent.phone &&
                typeof student.parent.phone === "string" && (
                  <div className="text-xs text-gray-500">
                    {student.parent.phone}
                  </div>
                )}
            </>
          )}
        </div>
      ),
    },
    {
      header: "Relationship",
      accessor: "relationship",
      cell: (student) => (
        <div>{getRelationshipBadge(student.relationship || "PARENT")}</div>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      cell: (student) => (
        <div className="flex space-x-2">
          {student.linkStatus === "PENDING" && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleApprove(student.id)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setSelectedRequest(student);
                  setShowRejectModal(true);
                }}
              >
                Reject
              </Button>
            </>
          )}
          {student.linkStatus === "APPROVED" && (
            <div className="text-sm text-green-600 font-medium">✓ Approved</div>
          )}
          {student.linkStatus === "REJECTED" && (
            <div className="text-sm text-red-600 font-medium">✗ Rejected</div>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = linkRequests.filter(
    (r) => r.linkStatus === "PENDING"
  ).length;
  const approvedCount = linkRequests.filter(
    (r) => r.linkStatus === "APPROVED"
  ).length;
  const rejectedCount = linkRequests.filter(
    (r) => r.linkStatus === "REJECTED"
  ).length;

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Student-Parent Link Requests
        </h1>
        <p className="text-gray-600 mt-1">
          Review and manage parent-student link requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
          <h3 className="text-sm font-medium text-gray-500">
            Pending Requests
          </h3>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "approved"
                ? "bg-green-100 text-green-800"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "rejected"
                ? "bg-red-100 text-red-800"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-100 text-blue-800"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Requests
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-900">
        <div className="p-6 border-b border-gray-900">
          <h2 className="text-lg font-semibold text-gray-900">Link Requests</h2>
        </div>
        <Table
          columns={columns}
          data={linkRequests}
          emptyMessage={`No ${filter === "all" ? "" : filter} requests found`}
        />
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedRequest(null);
          setRejectReason("");
        }}
        title="Reject Link Request"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Request Details:</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Student:</span>{" "}
                  <span className="font-medium">
                    {selectedRequest.firstName} {selectedRequest.lastName}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Student ID:</span>{" "}
                  <span className="font-medium">
                    {selectedRequest.studentId}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Parent:</span>{" "}
                  <span className="font-medium">
                    {selectedRequest.parent?.name || "No parent assigned"}
                  </span>
                </p>
                {selectedRequest.parent?.email && (
                  <p>
                    <span className="text-gray-600">Parent Email:</span>{" "}
                    <span className="font-medium">
                      {selectedRequest.parent.email}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejecting this request..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject}>
                Reject Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentLinksManagement;
