import React, { useState, useEffect } from "react";
import { clearanceApi } from "../../api/clearanceApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const ClearanceManagement = () => {
  const [clearanceRequests, setClearanceRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [clearanceDetails, setClearanceDetails] = useState(null);

  useEffect(() => {
    fetchClearanceRequests();
  }, []);

  const fetchClearanceRequests = async () => {
    try {
      setLoading(true);
      const response = await clearanceApi.getAllClearanceRequests();
      // Response structure: response.data.data.requests
      setClearanceRequests(response.data?.data?.requests || []);
    } catch (error) {
      console.error("Error fetching clearance requests:", error);
      setClearanceRequests([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await clearanceApi.searchParentStudent(searchTerm);
      // Response structure: response.data.data
      setSearchResults(response.data?.data || []);
      setShowSearchModal(true);
    } catch (error) {
      console.error("Error searching parent/student:", error);
    }
  };

  const handleVerifyClearance = async (parentId, studentId = null) => {
    try {
      const [verificationResponse, detailsResponse] = await Promise.all([
        clearanceApi.verifyClearance(parentId, studentId),
        clearanceApi.getClearanceDetails(parentId, studentId),
      ]);

      setSelectedParent({
        parentId,
        studentId,
        verification: verificationResponse.data,
        details: detailsResponse.data,
      });
      setShowClearanceModal(true);
    } catch (error) {
      console.error("Error verifying clearance:", error);
    }
  };

  const handleApproveClearanceRequest = async (requestId) => {
    try {
      await clearanceApi.approveClearanceRequest(requestId);
      fetchClearanceRequests();
    } catch (error) {
      console.error("Error approving clearance request:", error);
    }
  };

  const handleRejectClearanceRequest = async (requestId, reason) => {
    try {
      await clearanceApi.rejectClearanceRequest(requestId, reason);
      fetchClearanceRequests();
    } catch (error) {
      console.error("Error rejecting clearance request:", error);
    }
  };

  const handleGenerateCertificate = async (parentId, studentId = null) => {
    try {
      const response = await clearanceApi.generateClearanceCertificate(
        parentId,
        studentId
      );
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clearance-certificate-${parentId}.pdf`;
      a.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  const requestColumns = [
    {
      key: "parent",
      header: "Parent Information",
      render: (request) => (
        <div>
          <div className="font-medium">{request.parentName}</div>
          <div className="text-sm text-gray-600">{request.parentEmail}</div>
          {request.studentName && (
            <div className="text-sm text-gray-600">
              Student: {request.studentName}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (request) => request.purpose,
    },
    {
      key: "requestDate",
      header: "Request Date",
      render: (request) => formatDate(request.createdAt),
    },
    {
      key: "status",
      header: "Status",
      render: (request) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            request.status === "approved"
              ? "bg-green-100 text-green-800"
              : request.status === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {request.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (request) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleVerifyClearance(request.parentId, request.studentId)
            }
          >
            Verify
          </Button>
          {request.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleApproveClearanceRequest(request.id)}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const reason = prompt("Reason for rejection (optional):");
                  if (reason !== null) {
                    handleRejectClearanceRequest(request.id, reason);
                  }
                }}
              >
                Reject
              </Button>
            </>
          )}
          {request.status === "approved" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleGenerateCertificate(request.parentId, request.studentId)
              }
            >
              Certificate
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Clearance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Verify parent obligations and manage clearance requests
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Search parent or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1"
          />
          <Button onClick={handleSearch} className="w-full sm:w-auto">
            Search & Verify
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
          <p className="text-2xl font-bold text-blue-600">
            {clearanceRequests.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {clearanceRequests.filter((r) => r.status === "pending").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600">
            {clearanceRequests.filter((r) => r.status === "approved").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">
            {clearanceRequests.filter((r) => r.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Clearance Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Clearance Requests</h2>
        </div>
        <Table
          data={clearanceRequests}
          columns={requestColumns}
          emptyMessage="No clearance requests found"
        />
      </div>

      {/* Search Results Modal */}
      <Modal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Search Results"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Select a parent/student to verify clearance:
          </p>
          <div className="max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg mb-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{result.parentName}</div>
                    <div className="text-sm text-gray-600">
                      {result.parentEmail}
                    </div>
                    {result.studentName && (
                      <div className="text-sm text-gray-600">
                        Student: {result.studentName}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowSearchModal(false);
                      handleVerifyClearance(result.parentId, result.studentId);
                    }}
                  >
                    Verify Clearance
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {searchResults.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No parents or students found matching your search.
            </p>
          )}
        </div>
      </Modal>

      {/* Clearance Verification Modal */}
      <Modal
        isOpen={showClearanceModal}
        onClose={() => setShowClearanceModal(false)}
        title="Clearance Verification"
        size="lg"
      >
        {selectedParent && (
          <div className="space-y-6">
            {/* Parent Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Parent Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>{" "}
                  {selectedParent.details?.parentName}
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>{" "}
                  {selectedParent.details?.parentEmail}
                </div>
                {selectedParent.details?.studentName && (
                  <div>
                    <span className="text-gray-600">Student:</span>{" "}
                    {selectedParent.details?.studentName}
                  </div>
                )}
              </div>
            </div>

            {/* Clearance Status */}
            <div className="border-l-4 border-green-400 bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Clearance Status:{" "}
                    {selectedParent.verification?.isCleared
                      ? "CLEARED"
                      : "NOT CLEARED"}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    {selectedParent.verification?.message}
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Requirements Check
              </h3>

              {/* Attendance */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Attendance Requirements</div>
                  <div className="text-sm text-gray-600">
                    Attended:{" "}
                    {selectedParent.details?.attendance?.attended || 0} /
                    Required:{" "}
                    {selectedParent.details?.attendance?.required || 0}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedParent.details?.attendance?.met
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedParent.details?.attendance?.met ? "Met" : "Not Met"}
                </span>
              </div>

              {/* Contributions */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Financial Obligations</div>
                  <div className="text-sm text-gray-600">
                    Paid: ₱{selectedParent.details?.contributions?.paid || 0} /
                    Required: ₱
                    {selectedParent.details?.contributions?.required || 0}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedParent.details?.contributions?.met
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedParent.details?.contributions?.met
                    ? "Met"
                    : "Not Met"}
                </span>
              </div>

              {/* Penalties */}
              {selectedParent.details?.penalties?.amount > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <div>
                    <div className="font-medium text-red-800">
                      Outstanding Penalties
                    </div>
                    <div className="text-sm text-red-600">
                      Amount: ₱{selectedParent.details?.penalties?.amount}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Outstanding
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowClearanceModal(false)}
              >
                Close
              </Button>
              {selectedParent.verification?.isCleared && (
                <Button
                  onClick={() =>
                    handleGenerateCertificate(
                      selectedParent.parentId,
                      selectedParent.studentId
                    )
                  }
                >
                  Generate Certificate
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClearanceManagement;
