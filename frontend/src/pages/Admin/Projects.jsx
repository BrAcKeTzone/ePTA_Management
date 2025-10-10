import React, { useState, useEffect } from "react";
import { projectsApi } from "../../api/projectsApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    status: "planning",
    startDate: "",
    endDate: "",
    budget: "",
  });
  const [documentUpload, setDocumentUpload] = useState({
    projectId: "",
    title: "",
    description: "",
    category: "meeting_minutes",
    file: null,
  });

  useEffect(() => {
    fetchProjects();
    fetchDocuments();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getAllProjects();
      // Response structure: response.data.data.projects
      setProjects(response.data?.data?.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await projectsApi.getAllMeetingDocuments();
      // Response structure: response.data.data.documents
      setDocuments(response.data?.data?.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsApi.createProject(newProject);
      setShowCreateProject(false);
      setNewProject({
        title: "",
        description: "",
        status: "planning",
        startDate: "",
        endDate: "",
        budget: "",
      });
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    try {
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
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await projectsApi.updateProjectStatus(projectId, newStatus);
      fetchProjects();
    } catch (error) {
      console.error("Error updating project status:", error);
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

  const projectColumns = [
    {
      key: "title",
      header: "Project Title",
      render: (project) => (
        <div>
          <div className="font-medium">{project.title}</div>
          <div className="text-sm text-gray-600">{project.description}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (project) => (
        <select
          className="px-2 py-1 rounded border"
          value={project.status}
          onChange={(e) => handleStatusChange(project.id, e.target.value)}
        >
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
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
        project.budget ? `₱${project.budget.toLocaleString()}` : "Not set",
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
            View Details
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
          {doc.category.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "project",
      header: "Project",
      render: (doc) => doc.projectTitle || "General",
    },
    {
      key: "uploadDate",
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
            Manage PTA projects and meeting documents
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowUploadDocument(true)}>
            Upload Document
          </Button>
          <Button onClick={() => setShowCreateProject(true)}>
            Create Project
          </Button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">PTA Projects</h2>
        </div>
        <Table
          data={projects}
          columns={projectColumns}
          emptyMessage="No projects found"
        />
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            Meeting Documents & Resolutions
          </h2>
        </div>
        <Table
          data={documents}
          columns={documentColumns}
          emptyMessage="No documents found"
        />
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Title"
            value={newProject.title}
            onChange={(e) =>
              setNewProject({ ...newProject, title: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              required
            />
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
              required
            />
          </div>
          <Input
            label="Budget (Optional)"
            type="number"
            step="0.01"
            value={newProject.budget}
            onChange={(e) =>
              setNewProject({ ...newProject, budget: e.target.value })
            }
            placeholder="Project budget in PHP"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Status
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newProject.status}
              onChange={(e) =>
                setNewProject({ ...newProject, status: e.target.value })
              }
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
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
        title="Upload Meeting Document"
      >
        <form onSubmit={handleUploadDocument} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project (Optional)
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={documentUpload.projectId}
              onChange={(e) =>
                setDocumentUpload({
                  ...documentUpload,
                  projectId: e.target.value,
                })
              }
            >
              <option value="">General Document</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Document Title"
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
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
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
              className="w-full p-2 border border-gray-300 rounded-md"
              value={documentUpload.category}
              onChange={(e) =>
                setDocumentUpload({
                  ...documentUpload,
                  category: e.target.value,
                })
              }
            >
              <option value="meeting_minutes">Meeting Minutes</option>
              <option value="resolution">Resolution</option>
              <option value="financial_report">Financial Report</option>
              <option value="project_proposal">Project Proposal</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File (PDF, DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) =>
                setDocumentUpload({
                  ...documentUpload,
                  file: e.target.files[0],
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
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
    </div>
  );
};

export default ProjectsManagement;
