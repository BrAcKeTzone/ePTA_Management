import React, { useState, useEffect } from "react";
import { projectsApi } from "../../api/projectsApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/formatDate";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(true);
  const [activeTab, setActiveTab] = useState("projects"); // projects, documents

  useEffect(() => {
    fetchProjects();
    fetchDocuments();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getActiveProjects();
      // Response structure: response.data.data.projects
      setProjects(response.data?.data?.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await projectsApi.getPublicDocuments();
      // Response structure: response.data.data.documents
      setDocuments(response.data?.data?.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await projectsApi.downloadDocument(documentId);
      const blob = new Blob([response], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "meeting_minutes":
        return "bg-blue-100 text-blue-800";
      case "resolution":
        return "bg-purple-100 text-purple-800";
      case "financial_report":
        return "bg-green-100 text-green-800";
      case "project_proposal":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
      {/* About Modal */}
      <Modal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About PTA Projects & Documents"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-gray-700 space-y-2">
            <p>• Click on any project or document to view full details</p>
            <p>
              • Projects show the current initiatives and activities of the PTA
            </p>
            <p>
              • Documents include meeting minutes, resolutions, and important
              records
            </p>
            <p>• All documents are available for download for transparency</p>
            <p>
              • Project progress is updated regularly by the PTA administration
            </p>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 italic">
              Click anywhere outside this box or press the × button to close
            </p>
          </div>
        </div>
      </Modal>

      {/* Project Detail Modal */}
      {selectedProject && (
        <Modal
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false);
            setSelectedProject(null);
          }}
          title={selectedProject.title}
          size="lg"
        >
          <div className="space-y-4">
            {/* Status Badge */}
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  selectedProject.status
                )}`}
              >
                {selectedProject.status.replace("_", " ")}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{selectedProject.description}</p>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Start Date
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedProject.startDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  End Date
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedProject.endDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Budget
                </label>
                <p className="text-sm text-gray-900">
                  {selectedProject.budget
                    ? `₱${selectedProject.budget.toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Progress</span>
                <span className="text-gray-500">
                  {selectedProject.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    selectedProject.status === "completed"
                      ? "bg-green-500"
                      : selectedProject.status === "in_progress"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                  style={{ width: `${selectedProject.progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Accomplishments */}
            {selectedProject.accomplishments &&
              selectedProject.accomplishments.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Accomplishments
                  </h3>
                  <ul className="space-y-2">
                    {selectedProject.accomplishments.map(
                      (accomplishment, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-start"
                        >
                          <span className="text-green-500 mr-2 mt-1">•</span>
                          <div className="flex-1">
                            <span>{accomplishment.description}</span>
                            {accomplishment.date && (
                              <span className="text-gray-400 ml-2">
                                ({formatDate(accomplishment.date)})
                              </span>
                            )}
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        </Modal>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <Modal
          isOpen={showDocumentModal}
          onClose={() => {
            setShowDocumentModal(false);
            setSelectedDocument(null);
          }}
          title={selectedDocument.title}
          size="lg"
        >
          <div className="space-y-4">
            {/* Category Badge */}
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                  selectedDocument.category
                )}`}
              >
                {selectedDocument.category.replace("_", " ")}
              </span>
            </div>

            {/* Description */}
            {selectedDocument.description && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedDocument.description}</p>
              </div>
            )}

            {/* Document Details */}
            <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Uploaded:</span>{" "}
                {formatDate(selectedDocument.createdAt)}
              </p>
              {selectedDocument.projectTitle && (
                <p>
                  <span className="font-medium">Related Project:</span>{" "}
                  {selectedDocument.projectTitle}
                </p>
              )}
              <p>
                <span className="font-medium">File Size:</span>{" "}
                {selectedDocument.fileSize
                  ? `${(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB`
                  : "Unknown"}
              </p>
              <p>
                <span className="font-medium">File Name:</span>{" "}
                {selectedDocument.fileName}
              </p>
            </div>

            {/* Download Button */}
            <div className="pt-4">
              <button
                onClick={() =>
                  handleDownloadDocument(
                    selectedDocument.id,
                    selectedDocument.fileName
                  )
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download Document
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          PTA Projects & Documents
        </h1>
        <p className="text-gray-600 mt-1">
          View active PTA projects and access meeting documents
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("projects")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "projects"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Active Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Documents ({documents.length})
          </button>
        </nav>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {project.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {truncateText(project.description)}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">
                          Progress
                        </span>
                        <span className="text-gray-500">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            project.status === "completed"
                              ? "bg-green-500"
                              : project.status === "in_progress"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Start:</span>
                        <span className="font-medium">
                          {formatDate(project.startDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>End:</span>
                        <span className="font-medium">
                          {formatDate(project.endDate)}
                        </span>
                      </div>
                      {project.budget && (
                        <div className="flex justify-between">
                          <span>Budget:</span>
                          <span className="font-medium">
                            ₱{project.budget.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No active projects
              </h3>
              <p className="text-gray-600">
                There are no active PTA projects at the moment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleDocumentClick(document)}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {document.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getCategoryColor(
                            document.category
                          )}`}
                        >
                          {document.category.replace("_", " ")}
                        </span>
                      </div>
                      {document.description && (
                        <p className="text-sm text-gray-600">
                          {truncateText(document.description)}
                        </p>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span className="font-medium">
                          {formatDate(document.createdAt)}
                        </span>
                      </div>
                      {document.projectTitle && (
                        <div className="flex justify-between">
                          <span>Project:</span>
                          <span className="font-medium text-blue-600">
                            {document.projectTitle}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-medium">
                          {document.fileSize
                            ? `${(document.fileSize / 1024 / 1024).toFixed(
                                2
                              )} MB`
                            : "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="pt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDocument(
                            document.id,
                            document.fileName
                          );
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents available
              </h3>
              <p className="text-gray-600">
                No meeting documents or resolutions have been published yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
