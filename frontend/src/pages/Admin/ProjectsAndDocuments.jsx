import React, { useState, useEffect } from "react";
import { projectsApi } from "../../api/projectsApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const ProjectsAndDocuments = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("projects");

  // Common state
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Projects state
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "PLANNING",
    startDate: "",
    endDate: "",
    budget: "",
    priority: "MEDIUM",
  });

  // Documents state
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [documentUpload, setDocumentUpload] = useState({
    projectId: "",
    title: "",
    description: "",
    category: "meeting_minutes",
    file: null,
  });

  // Project status options
  const projectStatuses = [
    { value: "PLANNING", label: "Planning" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const projectPriorities = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
  ];

  // Load data on mount
  useEffect(() => {
    fetchProjects();
    fetchDocuments();
  }, []);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getAllProjects();
      const projectsArray = response.data?.data?.projects || [];
      setProjects(projectsArray);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await projectsApi.getAllMeetingDocuments();
      const documentsArray = response.data?.data?.documents || [];
      setDocuments(documentsArray);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    }
  };

  // Project handlers
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsApi.createProject(newProject);
      setShowCreateProject(false);
      setNewProject({
        name: "",
        description: "",
        status: "PLANNING",
        startDate: "",
        endDate: "",
        budget: "",
        priority: "MEDIUM",
      });
      fetchProjects();
      alert("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      alert(
        `Error creating project: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await projectsApi.updateProject(projectId, { status: newStatus });
      fetchProjects();
      alert("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Error updating project. Please try again.");
    }
  };

  const handleUpdateProjectPriority = async (projectId, newPriority) => {
    try {
      await projectsApi.updateProject(projectId, { priority: newPriority });
      fetchProjects();
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Error updating priority. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsApi.deleteProject(projectId);
        fetchProjects();
        alert("Project deleted successfully!");
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Error deleting project. Please try again.");
      }
    }
  };

  // Document handlers
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    try {
      if (!documentUpload.file) {
        alert("Please select a file to upload");
        return;
      }

      await projectsApi.uploadMeetingDocument(
        documentUpload.projectId,
        documentUpload
      );
      setShowUploadDocument(false);
      setDocumentUpload({
        projectId: "",
        title: "",
        description: "",
        category: "meeting_minutes",
        file: null,
      });
      fetchDocuments();
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      alert(
        `Error uploading document: ${
          error.response?.data?.message || error.message
        }`
      );
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
      alert("Error downloading document. Please try again.");
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await projectsApi.deleteDocument(documentId);
        fetchDocuments();
        alert("Document deleted successfully!");
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Error deleting document. Please try again.");
      }
    }
  };

  // Table columns
  const projectColumns = [
    {
      key: "name",
      header: "Project Name",
      render: (project) => (
        <div>
          <div className="font-medium">{project.name}</div>
          <div className="text-sm text-gray-600">{project.description}</div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (project) => {
        const priorityColors = {
          LOW: "bg-gray-100 text-gray-800",
          MEDIUM: "bg-blue-100 text-blue-800",
          HIGH: "bg-orange-100 text-orange-800",
          URGENT: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              priorityColors[project.priority] || "bg-gray-100"
            }`}
          >
            {project.priority}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (project) => {
        const statusColors = {
          PLANNING: "bg-gray-100 text-gray-800",
          ACTIVE: "bg-green-100 text-green-800",
          ON_HOLD: "bg-yellow-100 text-yellow-800",
          COMPLETED: "bg-blue-100 text-blue-800",
          CANCELLED: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[project.status] || "bg-gray-100"
            }`}
          >
            {project.status}
          </span>
        );
      },
    },
    {
      key: "duration",
      header: "Duration",
      render: (project) => (
        <div>
          <div className="text-sm">{formatDate(project.startDate)}</div>
          <div className="text-sm text-gray-600">
            to {formatDate(project.endDate)}
          </div>
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      render: (project) =>
        project.budget
          ? `₱${parseFloat(project.budget).toLocaleString()}`
          : "Not set",
    },
    {
      key: "actions",
      header: "Actions",
      render: (project) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedProject(project)}
          >
            View
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteProject(project.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const documentColumns = [
    {
      key: "title",
      header: "Document Title",
      render: (doc) => (
        <div>
          <div className="font-medium">{doc.title}</div>
          <div className="text-sm text-gray-600">{doc.description}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (doc) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {doc.category?.replace(/_/g, " ") || "General"}
        </span>
      ),
    },
    {
      key: "projectName",
      header: "Project",
      render: (doc) => doc.projectName || "General",
    },
    {
      key: "uploadedDate",
      header: "Upload Date",
      render: (doc) => formatDate(doc.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (doc) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
          >
            Download
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteDocument(doc.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">
            Projects & Documents Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage PTA projects and meeting documents/resolutions
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === "projects"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Projects
          {activeTab === "projects" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === "documents"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Meeting Documents & Resolutions
          {activeTab === "documents" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
          )}
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateProject(true)}>
              Create New Project
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <Table
              data={projects}
              columns={projectColumns}
              emptyMessage="No projects found"
            />
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowUploadDocument(true)}>
              Upload Document
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <Table
              data={documents}
              columns={documentColumns}
              emptyMessage="No documents found"
            />
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        title="Create New Project"
        size="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g., School Renovation Project"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Project description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newProject.priority}
                onChange={(e) =>
                  setNewProject({ ...newProject, priority: e.target.value })
                }
                required
              >
                {projectPriorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newProject.status}
                onChange={(e) =>
                  setNewProject({ ...newProject, status: e.target.value })
                }
                required
              >
                {projectStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={newProject.startDate}
              onChange={(e) =>
                setNewProject({ ...newProject, startDate: e.target.value })
              }
              required
            />
            <Input
              label="End Date"
              type="date"
              value={newProject.endDate}
              onChange={(e) =>
                setNewProject({ ...newProject, endDate: e.target.value })
              }
            />
          </div>

          <Input
            label="Budget (₱)"
            type="number"
            placeholder="0"
            value={newProject.budget}
            onChange={(e) =>
              setNewProject({ ...newProject, budget: e.target.value })
            }
          />

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateProject(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadDocument}
        onClose={() => setShowUploadDocument(false)}
        title="Upload Meeting Document/Resolution"
        size="lg"
      >
        <form onSubmit={handleUploadDocument} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project (Optional)
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={documentUpload.projectId}
              onChange={(e) =>
                setDocumentUpload({
                  ...documentUpload,
                  projectId: e.target.value,
                })
              }
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Document Title"
            placeholder="e.g., Meeting Minutes - November 2024"
            value={documentUpload.title}
            onChange={(e) =>
              setDocumentUpload({ ...documentUpload, title: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Document description"
              value={documentUpload.description}
              onChange={(e) =>
                setDocumentUpload({
                  ...documentUpload,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={documentUpload.category}
              onChange={(e) =>
                setDocumentUpload({
                  ...documentUpload,
                  category: e.target.value,
                })
              }
              required
            >
              <option value="meeting_minutes">Meeting Minutes</option>
              <option value="resolutions">Resolutions</option>
              <option value="agenda">Agenda</option>
              <option value="report">Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) =>
                setDocumentUpload({
                  ...documentUpload,
                  file: e.target.files?.[0] || null,
                })
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUploadDocument(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Upload Document</Button>
          </div>
        </form>
      </Modal>

      {/* Project Details Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title="Project Details"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedProject.name}
              </h3>
              <p className="text-gray-600">{selectedProject.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedProject.priority}
                  onChange={(e) =>
                    handleUpdateProjectPriority(
                      selectedProject.id,
                      e.target.value
                    )
                  }
                >
                  {projectPriorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedProject.status}
                  onChange={(e) =>
                    handleUpdateProjectStatus(
                      selectedProject.id,
                      e.target.value
                    )
                  }
                >
                  {projectStatuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(selectedProject.startDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(selectedProject.endDate)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Budget
              </label>
              <p className="mt-1 text-gray-900">
                {selectedProject.budget
                  ? `₱${parseFloat(selectedProject.budget).toLocaleString()}`
                  : "Not set"}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsAndDocuments;
