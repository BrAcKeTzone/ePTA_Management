import React, { useState, useEffect } from "react";
import { clearanceApi } from "../../api/clearanceApi";
import { studentsApi } from "../../api/studentsApi";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const Clearance = () => {
  const [clearanceStatus, setClearanceStatus] = useState(null);
  const [children, setChildren] = useState([]);
  const [clearanceRequests, setClearanceRequests] = useState([]);
  const [requirements, setRequirements] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    purpose: "",
    studentId: "",
  });

  useEffect(() => {
    fetchClearanceData();
  }, []);

  const fetchClearanceData = async () => {
    try {
      setLoading(true);

      const [
        statusResponse,
        childrenResponse,
        requestsResponse,
        requirementsResponse,
      ] = await Promise.all([
        clearanceApi.getMyClearanceStatus(),
        studentsApi.getMyChildren(),
        clearanceApi.getMyClearanceRequests(),
        clearanceApi.getClearanceRequirements(),
      ]);

      setClearanceStatus(statusResponse.data || {});
      setChildren(childrenResponse.data || []);
      setClearanceRequests(requestsResponse.data || []);
      setRequirements(requirementsResponse.data || {});
    } catch (error) {
      console.error("Error fetching clearance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClearance = async (e) => {
    e.preventDefault();
    try {
      await clearanceApi.requestClearance(
        newRequest.purpose,
        newRequest.studentId || null
      );
      setShowRequestModal(false);
      setNewRequest({ purpose: "", studentId: "" });
      fetchClearanceData();
    } catch (error) {
      console.error("Error requesting clearance:", error);
    }
  };

  const handleDownloadClearance = async (requestId) => {
    try {
      const response = await clearanceApi.downloadMyClearance(requestId);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clearance-certificate-${requestId}.pdf`;
      a.click();
    } catch (error) {
      console.error("Error downloading clearance:", error);
    }
  };

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
            My Clearance
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Check your clearance status and request clearance certificates
          </p>
        </div>
        <Button
          onClick={() => setShowRequestModal(true)}
          disabled={!clearanceStatus?.isEligible}
        >
          Request Clearance
        </Button>
      </div>

      {/* Overall Clearance Status */}
      <div
        className={`border-l-4 p-6 rounded-lg ${
          clearanceStatus?.isCleared
            ? "border-green-400 bg-green-50 dark:bg-green-900/20"
            : "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
        }`}
      >
        <div className="flex">
          <div className="ml-3">
            <h3
              className={`text-sm font-medium ${
                clearanceStatus?.isCleared
                  ? "text-green-800 dark:text-green-200"
                  : "text-yellow-800 dark:text-yellow-200"
              }`}
            >
              Clearance Status:{" "}
              {clearanceStatus?.isCleared ? "CLEARED" : "NOT CLEARED"}
            </h3>
            <div
              className={`mt-2 text-sm ${
                clearanceStatus?.isCleared
                  ? "text-green-700 dark:text-green-300"
                  : "text-yellow-700 dark:text-yellow-300"
              }`}
            >
              {clearanceStatus?.message || "Loading clearance status..."}
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Check */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">
            Requirements Check
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Attendance Requirements */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="font-medium dark:text-white">
                Attendance Requirements
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Minimum {requirements.minimumAttendanceRate || 80}% attendance
                rate required
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Current: {clearanceStatus?.attendance?.rate || 0}% (
                {clearanceStatus?.attendance?.attended || 0} of{" "}
                {clearanceStatus?.attendance?.total || 0} meetings)
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                clearanceStatus?.attendance?.met
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {clearanceStatus?.attendance?.met ? "Met" : "Not Met"}
            </span>
          </div>

          {/* Financial Obligations */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="font-medium dark:text-white">
                Financial Obligations
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                All contributions and penalties must be paid
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Outstanding: ₱{clearanceStatus?.financial?.outstanding || 0}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                clearanceStatus?.financial?.met
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {clearanceStatus?.financial?.met ? "Met" : "Not Met"}
            </span>
          </div>

          {/* Additional Requirements */}
          {requirements.additionalRequirements?.map((requirement, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <div className="font-medium dark:text-white">
                  {requirement.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {requirement.description}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  clearanceStatus?.additionalRequirements?.[index]?.met
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {clearanceStatus?.additionalRequirements?.[index]?.met
                  ? "Met"
                  : "Not Met"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* My Children (if any) */}
      {children.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white">
              My Children
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div>
                    <div className="font-medium dark:text-white">
                      {child.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Grade {child.gradeLevel} - {child.section}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Student ID: {child.studentId}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        child.clearanceStatus === "cleared"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {child.clearanceStatus === "cleared"
                        ? "Cleared"
                        : "Pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clearance Requests History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">
            Clearance Requests
          </h2>
        </div>
        <div className="p-6">
          {clearanceRequests.length > 0 ? (
            <div className="space-y-4">
              {clearanceRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium dark:text-white">
                        {request.purpose}
                      </div>
                      {request.studentName && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          For: {request.studentName}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Requested: {formatDate(request.createdAt)}
                      </div>
                      {request.processedAt && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Processed: {formatDate(request.processedAt)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {request.status}
                      </span>
                      {request.status === "approved" && (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadClearance(request.id)}
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                  {request.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                      Reason: {request.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No clearance requests found
            </p>
          )}
        </div>
      </div>

      {/* Request Clearance Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Clearance Certificate"
      >
        <form onSubmit={handleRequestClearance} className="space-y-4">
          <Input
            label="Purpose"
            value={newRequest.purpose}
            onChange={(e) =>
              setNewRequest({ ...newRequest, purpose: e.target.value })
            }
            placeholder="e.g., School enrollment, scholarship application"
            required
          />

          {children.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                For which child? (Optional - leave empty for general clearance)
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                value={newRequest.studentId}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, studentId: e.target.value })
                }
              >
                <option value="">General Clearance</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} - Grade {child.gradeLevel}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Note:</strong> Clearance requests will only be approved if
              all requirements are met. Please ensure your attendance and
              financial obligations are up to date.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRequestModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!clearanceStatus?.isEligible}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          About Clearance Requirements
        </h3>
        <div className="text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            • Clearance certificates are issued when all PTA obligations are met
          </p>
          <p>
            • Minimum attendance rate and financial obligations must be
            satisfied
          </p>
          <p>• Requests are processed within 3-5 business days</p>
          <p>• Approved clearances can be downloaded as PDF certificates</p>
          <p>
            • Contact the PTA office if you have questions about requirements
          </p>
        </div>
      </div>
    </div>
  );
};

export default Clearance;
