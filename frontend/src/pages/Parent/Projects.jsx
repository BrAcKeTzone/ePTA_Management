import React, { useState, useEffect } from "react";
import { projectsApi } from "../../api/projectsApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/formatDate";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(true);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getActiveProjects();
      console.log("Projects API Response:", response);
      console.log("Response data:", response.data);

      // Try multiple possible response structures
      const projectsData =
        response.data?.data?.projects ||
        response.data?.projects ||
        response.data ||
        [];

      console.log("Extracted projects:", projectsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      console.error("Error response:", error.response);
      setProjects([]); // Set empty array as fallback
    } finally {
      setLoading(false);
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

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleImageClick = (images, index) => {
    setGalleryImages(images);
    setCurrentImageIndex(index);
    setShowImageGallery(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageGallery) return;

      if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "Escape") {
        setShowImageGallery(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageGallery, galleryImages.length]);

  const parseCompletionImages = (completionImages) => {
    if (!completionImages) return [];
    try {
      return JSON.parse(completionImages);
    } catch (error) {
      console.error("Error parsing completion images:", error);
      return [];
    }
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
    <>
      {/* Image Gallery Modal - Outside main container */}
      {showImageGallery && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center"
          onClick={() => setShowImageGallery(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowImageGallery(false)}
            className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-[10000]"
            title="Close (ESC)"
          >
            ×
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-lg font-semibold">
            {currentImageIndex + 1} / {galleryImages.length}
          </div>

          {/* Previous button */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 text-white text-6xl font-bold hover:text-gray-300 z-[10000] transition-colors"
              title="Previous (←)"
            >
              ‹
            </button>
          )}

          {/* Current image */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[currentImageIndex]}
              alt={`Completion ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next button */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 text-white text-6xl font-bold hover:text-gray-300 z-[10000] transition-colors"
              title="Next (→)"
            >
              ›
            </button>
          )}

          {/* Thumbnail strip */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2 bg-black bg-opacity-50 rounded-lg">
              {galleryImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`h-16 w-16 object-cover rounded cursor-pointer transition-all ${
                    index === currentImageIndex
                      ? "border-4 border-blue-500 opacity-100"
                      : "border-2 border-gray-500 opacity-60 hover:opacity-100"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Container */}
      <div className="space-y-6">
        {/* About Modal */}
        <Modal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
          title="About PTA Projects"
          size="md"
        >
          <div className="space-y-4">
            <div className="text-gray-700 space-y-2">
              <p>• Click on any project to view full details</p>
              <p>
                • Projects show the current initiatives and activities of the
                PTA
              </p>
              <p>
                • Project progress is updated regularly by the PTA
                administration
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

              {/* Completion Images */}
              {selectedProject.status === "COMPLETED" &&
                selectedProject.completionImages && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Completion Images
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {parseCompletionImages(
                        selectedProject.completionImages
                      ).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-video cursor-pointer overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                          onClick={() =>
                            handleImageClick(
                              parseCompletionImages(
                                selectedProject.completionImages
                              ),
                              index
                            )
                          }
                        >
                          <img
                            src={image}
                            alt={`Completion ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PTA Projects</h1>
          <p className="text-gray-600 mt-1">View active PTA projects</p>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer flex flex-col"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="p-5 flex flex-col flex-1">
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

                    {/* Completion Images Preview */}
                    {project.status === "COMPLETED" &&
                      project.completionImages && (
                        <div className="mb-3">
                          <div className="grid grid-cols-3 gap-2">
                            {parseCompletionImages(project.completionImages)
                              .slice(0, 3)
                              .map((image, index) => (
                                <div
                                  key={index}
                                  className="relative aspect-video cursor-pointer overflow-hidden rounded hover:opacity-90 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageClick(
                                      parseCompletionImages(
                                        project.completionImages
                                      ),
                                      index
                                    );
                                  }}
                                >
                                  <img
                                    src={image}
                                    alt={`Completion ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                          </div>
                          {parseCompletionImages(project.completionImages)
                            .length > 3 && (
                            <p className="text-xs text-gray-500 mt-1">
                              +
                              {parseCompletionImages(project.completionImages)
                                .length - 3}{" "}
                              more images
                            </p>
                          )}
                        </div>
                      )}

                    {/* Footer Info - Always at bottom */}
                    <div className="pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600 mt-auto">
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
      </div>
    </>
  );
};

export default Projects;
