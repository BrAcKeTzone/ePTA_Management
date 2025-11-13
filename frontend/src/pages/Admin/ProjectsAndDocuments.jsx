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
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectData, setEditProjectData] = useState({
    priority: "",
    status: "",
    cancellationReason: "",
    completionImages: [], // Existing images from server
  });
  const [pendingImageFiles, setPendingImageFiles] = useState([]); // New files to upload
  const [uploadingImages, setUploadingImages] = useState(false);
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

    // Validate end date is at least 1 day after start date
    if (newProject.startDate && newProject.endDate) {
      const startDate = new Date(newProject.startDate);
      const endDate = new Date(newProject.endDate);
      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 1);

      if (endDate < minEndDate) {
        alert("End date must be at least 1 day after the start date");
        return;
      }
    }

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
      const updateData = { status: newStatus };

      // If changing to CANCELLED, require cancellation reason
      if (newStatus === "CANCELLED" && !editProjectData.cancellationReason) {
        alert("Please provide a cancellation reason");
        return;
      }

      if (newStatus === "CANCELLED") {
        updateData.cancellationReason = editProjectData.cancellationReason;
      }

      // If changing to COMPLETED, require completion images
      if (
        newStatus === "COMPLETED" &&
        editProjectData.completionImages.length === 0
      ) {
        alert("Please upload at least one completion image");
        return;
      }

      if (newStatus === "COMPLETED") {
        updateData.completionImages = JSON.stringify(
          editProjectData.completionImages
        );
      }

      await projectsApi.updateProject(projectId, updateData);
      setIsEditingProject(false);
      setSelectedProject(null);
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
      setIsEditingProject(false);
      setSelectedProject(null);
      fetchProjects();
      alert("Project priority updated successfully!");
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Error updating priority. Please try again.");
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsEditingProject(false);
    setPendingImageFiles([]); // Reset pending files

    let parsedImages = [];
    if (project.completionImages) {
      try {
        parsedImages = JSON.parse(project.completionImages);
        // Ensure it's an array
        if (!Array.isArray(parsedImages)) {
          parsedImages = [];
        }
      } catch (error) {
        console.error("Error parsing completion images:", error);
        parsedImages = [];
      }
    }

    setEditProjectData({
      priority: project.priority,
      status: project.status,
      cancellationReason: project.cancellationReason || "",
      completionImages: parsedImages,
    });
  };

  const handleSaveProjectEdit = async () => {
    try {
      const updateData = {
        priority: editProjectData.priority,
        status: editProjectData.status,
      };

      // Include cancellationReason if status is CANCELLED
      if (editProjectData.status === "CANCELLED") {
        if (!editProjectData.cancellationReason.trim()) {
          alert("Please provide a cancellation reason");
          return;
        }
        updateData.cancellationReason = editProjectData.cancellationReason;
      }

      // Validate and upload images if status is COMPLETED
      if (editProjectData.status === "COMPLETED") {
        const totalImages =
          editProjectData.completionImages.length + pendingImageFiles.length;

        if (totalImages === 0) {
          alert("Please upload at least one completion image");
          return;
        }

        // Upload pending files to Cloudinary if any
        if (pendingImageFiles.length > 0) {
          setUploadingImages(true);
          try {
            const response = await projectsApi.uploadCompletionImages(
              selectedProject.id,
              pendingImageFiles
            );

            console.log("Upload response:", response);

            const uploadedImages =
              response?.data?.data?.uploadedImages ||
              response?.data?.uploadedImages ||
              [];

            if (!uploadedImages || uploadedImages.length === 0) {
              throw new Error("Failed to upload images");
            }

            console.log("Images uploaded successfully to Cloudinary");
          } catch (error) {
            console.error("Error uploading images:", error);
            alert(
              error.response?.data?.message ||
                error.message ||
                "Error uploading images. Please try again."
            );
            setUploadingImages(false);
            return;
          } finally {
            setUploadingImages(false);
          }
        }
      }

      // Update project status and other fields
      await projectsApi.updateProject(selectedProject.id, updateData);
      setIsEditingProject(false);
      setSelectedProject(null);
      setPendingImageFiles([]);
      fetchProjects();
      alert("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Error updating project. Please try again.");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if project status is COMPLETED in edit mode
    if (editProjectData.status !== "COMPLETED") {
      alert("Can only upload images for completed projects");
      return;
    }

    // Store files locally - will upload on save
    setPendingImageFiles([...pendingImageFiles, ...files]);

    // Clear the file input so the same file can be selected again
    e.target.value = null;
  };

  const handleRemoveImage = async (index, isPending = false) => {
    if (isPending) {
      // Remove from pending files (not yet uploaded)
      const updatedPendingFiles = pendingImageFiles.filter(
        (_, i) => i !== index
      );
      setPendingImageFiles(updatedPendingFiles);
    } else {
      // Remove existing Cloudinary image
      const imageToDelete = editProjectData.completionImages[index];

      // Check if image URL is from Cloudinary
      if (
        imageToDelete.url &&
        (imageToDelete.url.startsWith("http://") ||
          imageToDelete.url.startsWith("https://"))
      ) {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this image from the server?"
        );
        if (!confirmDelete) return;

        try {
          await projectsApi.deleteCompletionImage(
            selectedProject.id,
            imageToDelete.url
          );

          // Remove from local state after successful deletion
          const updatedImages = editProjectData.completionImages.filter(
            (_, i) => i !== index
          );
          setEditProjectData({
            ...editProjectData,
            completionImages: updatedImages,
          });

          alert("Image deleted successfully!");
        } catch (error) {
          console.error("Error deleting image:", error);
          alert(
            error.response?.data?.message ||
              "Error deleting image. Please try again."
          );
        }
      } else {
        // For base64 images (backward compatibility)
        const updatedImages = editProjectData.completionImages.filter(
          (_, i) => i !== index
        );
        setEditProjectData({
          ...editProjectData,
          completionImages: updatedImages,
        });
      }
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
      width: "25%",
      render: (project) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{project.name}</div>
          <div className="text-sm text-gray-600 truncate">
            {project.description}
          </div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      width: "10%",
      render: (project) => {
        const priorityColors = {
          LOW: "bg-gray-100 text-gray-800",
          MEDIUM: "bg-blue-100 text-blue-800",
          HIGH: "bg-orange-100 text-orange-800",
          URGENT: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
      width: "12%",
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
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              statusColors[project.status] || "bg-gray-100"
            }`}
          >
            {project.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "duration",
      header: "Duration",
      width: "18%",
      render: (project) => (
        <div className="text-sm">
          <div>{formatDate(project.startDate)}</div>
          <div className="text-gray-600">{formatDate(project.endDate)}</div>
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      width: "15%",
      render: (project) => (
        <span className="text-sm whitespace-nowrap">
          {project.budget
            ? `₱${parseFloat(project.budget).toLocaleString()}`
            : "Not set"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "20%",
      render: (project) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditProject(project)}
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

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border">
            <Table
              data={projects}
              columns={projectColumns}
              emptyMessage="No projects found"
            />
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm overflow-hidden"
                  >
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : project.status === "ACTIVE"
                              ? "bg-blue-100 text-blue-800"
                              : project.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : project.status === "ON_HOLD"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {project.status}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.priority === "URGENT"
                              ? "bg-red-100 text-red-800"
                              : project.priority === "HIGH"
                              ? "bg-orange-100 text-orange-800"
                              : project.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {project.priority}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 break-words mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 break-words line-clamp-2">
                        {project.description || "No description"}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 flex-shrink-0">
                          Budget:
                        </span>
                        <span className="text-gray-900 font-medium text-right break-words">
                          ₱{project.budget?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 flex-shrink-0">
                          Start Date:
                        </span>
                        <span className="text-gray-900 font-medium text-right">
                          {formatDate(project.startDate)}
                        </span>
                      </div>
                      {project.endDate && (
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500 flex-shrink-0">
                            End Date:
                          </span>
                          <span className="text-gray-900 font-medium text-right">
                            {formatDate(project.endDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 flex-shrink-0">
                          Created By:
                        </span>
                        <span className="text-gray-900 font-medium text-right break-words">
                          {project.createdBy
                            ? `${project.createdBy.firstName} ${project.createdBy.lastName}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProject(project)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border">
                <p className="text-gray-500">No projects found</p>
              </div>
            )}
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

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border">
            <Table
              data={documents}
              columns={documentColumns}
              emptyMessage="No documents found"
            />
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm overflow-hidden"
                  >
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {doc.isPublic ? "Public" : "Private"}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {doc.category === "meeting_minutes"
                            ? "Meeting Minutes"
                            : doc.category === "resolution"
                            ? "Resolution"
                            : doc.category === "report"
                            ? "Report"
                            : "Other"}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 break-words mb-1">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-sm text-gray-600 break-words line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 flex-shrink-0">
                          Project:
                        </span>
                        <span className="text-gray-900 font-medium text-right break-words">
                          {doc.project?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 flex-shrink-0">
                          Uploaded:
                        </span>
                        <span className="text-gray-900 font-medium text-right">
                          {formatDate(doc.uploadedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 flex-shrink-0">
                          Uploaded By:
                        </span>
                        <span className="text-gray-900 font-medium text-right break-words">
                          {doc.uploadedBy
                            ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="w-full"
                      >
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border">
                <p className="text-gray-500">No documents found</p>
              </div>
            )}
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
                {projectStatuses
                  .filter(
                    (s) => s.value !== "COMPLETED" && s.value !== "CANCELLED"
                  )
                  .map((s) => (
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
              min={
                newProject.startDate
                  ? new Date(
                      new Date(newProject.startDate).getTime() +
                        24 * 60 * 60 * 1000
                    )
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
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
          onClose={() => {
            setSelectedProject(null);
            setIsEditingProject(false);
          }}
          title="Project Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
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
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={editProjectData.priority}
                  onChange={(e) =>
                    setEditProjectData({
                      ...editProjectData,
                      priority: e.target.value,
                    })
                  }
                  disabled={!isEditingProject}
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
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={editProjectData.status}
                  onChange={(e) =>
                    setEditProjectData({
                      ...editProjectData,
                      status: e.target.value,
                    })
                  }
                  disabled={!isEditingProject}
                >
                  {projectStatuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cancellation Reason - Only show if status is CANCELLED */}
            {(editProjectData.status === "CANCELLED" ||
              selectedProject.status === "CANCELLED") && (
              <div className="border border-red-300 rounded-md p-4 bg-red-50">
                <label className="text-sm font-medium text-gray-700">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                {isEditingProject ? (
                  <textarea
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    rows="3"
                    placeholder="Please provide a reason for cancelling this project"
                    value={editProjectData.cancellationReason}
                    onChange={(e) =>
                      setEditProjectData({
                        ...editProjectData,
                        cancellationReason: e.target.value,
                      })
                    }
                    required
                  />
                ) : (
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {selectedProject.cancellationReason || "No reason provided"}
                  </p>
                )}
              </div>
            )}

            {/* Completion Images - Only show if status is COMPLETED */}
            {(editProjectData.status === "COMPLETED" ||
              selectedProject.status === "COMPLETED") && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Completion Images <span className="text-red-500">*</span>
                </label>
                {isEditingProject ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                    />
                    {uploadingImages && (
                      <p className="text-sm text-gray-600">
                        Uploading images...
                      </p>
                    )}

                    {/* Display existing Cloudinary images */}
                    {Array.isArray(editProjectData.completionImages) &&
                      editProjectData.completionImages.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">
                            Existing images:
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            {editProjectData.completionImages.map(
                              (img, index) => (
                                <div
                                  key={`existing-${index}`}
                                  className="relative group"
                                >
                                  <img
                                    src={img.url || img}
                                    alt={`Existing ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-md border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveImage(index, false)
                                    }
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete from server"
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Display pending files (not yet uploaded) */}
                    {pendingImageFiles.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">
                          Pending upload ({pendingImageFiles.length} file
                          {pendingImageFiles.length > 1 ? "s" : ""}):
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {pendingImageFiles.map((file, index) => (
                            <div
                              key={`pending-${index}`}
                              className="relative group"
                            >
                              <div className="w-full h-24 bg-gray-100 rounded-md border border-dashed border-gray-400 flex items-center justify-center">
                                <div className="text-center p-2">
                                  <p className="text-xs text-gray-600 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index, true)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove file"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!Array.isArray(editProjectData.completionImages) ||
                      editProjectData.completionImages.length === 0) &&
                      pendingImageFiles.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          No images uploaded yet. Please upload at least one
                          image.
                        </p>
                      )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {(() => {
                      try {
                        if (selectedProject.completionImages) {
                          const images = JSON.parse(
                            selectedProject.completionImages
                          );
                          if (Array.isArray(images) && images.length > 0) {
                            return images.map((img, index) => (
                              <div key={index}>
                                <img
                                  src={img.url || img}
                                  alt={`Completion ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-md border cursor-pointer hover:opacity-80"
                                  onClick={() =>
                                    window.open(img.url || img, "_blank")
                                  }
                                />
                              </div>
                            ));
                          }
                        }
                      } catch (error) {
                        console.error(
                          "Error parsing completion images:",
                          error
                        );
                      }
                      return (
                        <p className="text-sm text-gray-500 italic col-span-3">
                          No completion images available
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

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

            {/* Edit/Save Buttons at Bottom - Disabled if status is COMPLETED or CANCELLED */}
            {selectedProject.status !== "COMPLETED" &&
              selectedProject.status !== "CANCELLED" && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  {isEditingProject ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingProject(false);
                          setEditProjectData({
                            priority: selectedProject.priority,
                            status: selectedProject.status,
                            cancellationReason:
                              selectedProject.cancellationReason || "",
                            completionImages: selectedProject.completionImages
                              ? JSON.parse(selectedProject.completionImages)
                              : [],
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProjectEdit}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProject(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsAndDocuments;
