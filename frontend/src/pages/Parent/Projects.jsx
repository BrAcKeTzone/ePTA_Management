import React, { useState, useEffect } from "react";
import { projectsApi } from "../../api/projectsApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          PTA Projects & Documents
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          View active PTA projects and access meeting documents
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("projects")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "projects"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Active Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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
            <div className="grid gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {project.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Start Date
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          End Date
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(project.endDate)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Budget
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {project.budget
                            ? `₱${project.budget.toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Progress
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
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

                    {/* Accomplishments */}
                    {project.accomplishments &&
                      project.accomplishments.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Recent Accomplishments
                          </h4>
                          <ul className="space-y-1">
                            {project.accomplishments
                              .slice(0, 3)
                              .map((accomplishment, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-600 dark:text-gray-300 flex items-start"
                                >
                                  <span className="text-green-500 mr-2">•</span>
                                  <span>{accomplishment.description}</span>
                                </li>
                              ))}
                          </ul>
                          {project.accomplishments.length > 3 && (
                            <button
                              onClick={() => setSelectedProject(project)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-2"
                            >
                              View all accomplishments
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No active projects
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
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
            <div className="grid gap-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {document.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            document.category
                          )}`}
                        >
                          {document.category.replace("_", " ")}
                        </span>
                      </div>

                      {document.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {document.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Uploaded: {formatDate(document.createdAt)}</span>
                        {document.projectTitle && (
                          <span>Project: {document.projectTitle}</span>
                        )}
                        <span>
                          Size:{" "}
                          {document.fileSize
                            ? `${(document.fileSize / 1024 / 1024).toFixed(
                                2
                              )} MB`
                            : "Unknown"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDownloadDocument(document.id, document.fileName)
                      }
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No documents available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No meeting documents or resolutions have been published yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedProject.title}
                </h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.accomplishments &&
                  selectedProject.accomplishments.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        All Accomplishments
                      </h3>
                      <ul className="space-y-2">
                        {selectedProject.accomplishments.map(
                          (accomplishment, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 dark:text-gray-300 flex items-start"
                            >
                              <span className="text-green-500 mr-2">•</span>
                              <div>
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
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          About PTA Projects & Documents
        </h3>
        <div className="text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            • Projects show the current initiatives and activities of the PTA
          </p>
          <p>
            • Documents include meeting minutes, resolutions, and important
            announcements
          </p>
          <p>• All documents are available for download for transparency</p>
          <p>
            • Project progress is updated regularly by the PTA administration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Projects;
