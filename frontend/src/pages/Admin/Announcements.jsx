import React, { useState, useEffect } from "react";
import { announcementsApi } from "../../api/announcementsApi";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";
import { useAuthStore } from "../../store/authStore";

const AnnouncementsManagement = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "MEDIUM",
    expiryDate: "",
    isFeatured: false,
    isPublished: true, // Default to published
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsApi.getAllAnnouncements();
      // Response structure: response.data.data.announcements
      setAnnouncements(response.data?.data?.announcements || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      // Convert expiryDate to ISO format if provided
      const announcementData = {
        ...newAnnouncement,
        expiryDate: newAnnouncement.expiryDate
          ? new Date(newAnnouncement.expiryDate).toISOString()
          : null,
        createdById: user.id, // Add the current user's ID
      };

      await announcementsApi.createAnnouncement(announcementData);
      setShowCreateModal(false);
      setNewAnnouncement({
        title: "",
        content: "",
        priority: "MEDIUM",
        expiryDate: "",
        isFeatured: false,
        isPublished: true,
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleEditAnnouncement = async (e) => {
    e.preventDefault();
    try {
      // Convert expiryDate to ISO format if provided
      const announcementData = {
        ...selectedAnnouncement,
        expiryDate: selectedAnnouncement.expiryDate
          ? new Date(selectedAnnouncement.expiryDate).toISOString()
          : null,
      };

      await announcementsApi.updateAnnouncement(
        selectedAnnouncement.id,
        announcementData
      );
      setShowEditModal(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error updating announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementsApi.deleteAnnouncement(announcementId);
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const handleToggleFeatured = async (announcementId) => {
    try {
      await announcementsApi.toggleFeatured(announcementId);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  const handleArchiveAnnouncement = async (announcementId) => {
    try {
      await announcementsApi.archiveAnnouncement(announcementId);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error archiving announcement:", error);
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Announcements Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage announcements for parents
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full md:w-auto"
        >
          Create Announcement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">
            Total Announcements
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {announcements.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Featured</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {announcements.filter((a) => a.isFeatured).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-bold text-green-600">
            {
              announcements.filter(
                (a) => !isExpired(a.expiryDate) && !a.isArchived
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Expired</h3>
          <p className="text-2xl font-bold text-red-600">
            {announcements.filter((a) => isExpired(a.expiryDate)).length}
          </p>
        </div>
      </div>

      {/* Announcements Grid */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">All Announcements</h2>
        </div>

        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header with Title and Badges */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-2">
                      {announcement.title}
                    </h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={announcement.isFeatured}
                        onChange={() => handleToggleFeatured(announcement.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        title="Featured"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        announcement.priority === "URGENT"
                          ? "bg-red-100 text-red-800"
                          : announcement.priority === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : announcement.priority === "LOW"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {announcement.priority.charAt(0) +
                        announcement.priority.slice(1).toLowerCase()}
                    </span>
                    {announcement.isFeatured && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        ⭐ Featured
                      </span>
                    )}
                    {isExpired(announcement.expiryDate) && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Expired
                      </span>
                    )}
                    {announcement.isArchived && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {announcement.content}
                  </p>
                </div>

                {/* Dates Info */}
                <div className="mb-4 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Created:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                  {announcement.expiryDate && (
                    <div className="flex justify-between text-gray-600">
                      <span>Expires:</span>
                      <span
                        className={`font-medium ${
                          isExpired(announcement.expiryDate)
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {formatDate(announcement.expiryDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setShowEditModal(true);
                    }}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchiveAnnouncement(announcement.id)}
                    className="flex-1"
                  >
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-6">
            <p className="text-gray-500">No announcements found</p>
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Announcement"
        size="lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Input
            label="Title"
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={6}
              value={newAnnouncement.content}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  content: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newAnnouncement.priority}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    priority: e.target.value,
                  })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <Input
              label="Expiry Date (Optional)"
              type="date"
              value={newAnnouncement.expiryDate}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  expiryDate: e.target.value,
                })
              }
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={newAnnouncement.isFeatured}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  isFeatured: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="featured"
              className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
            >
              Mark as featured announcement
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Announcement</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Announcement"
        size="lg"
      >
        {selectedAnnouncement && (
          <form onSubmit={handleEditAnnouncement} className="space-y-4">
            <Input
              label="Title"
              value={selectedAnnouncement.title}
              onChange={(e) =>
                setSelectedAnnouncement({
                  ...selectedAnnouncement,
                  title: e.target.value,
                })
              }
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={6}
                value={selectedAnnouncement.content}
                onChange={(e) =>
                  setSelectedAnnouncement({
                    ...selectedAnnouncement,
                    content: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedAnnouncement.priority}
                  onChange={(e) =>
                    setSelectedAnnouncement({
                      ...selectedAnnouncement,
                      priority: e.target.value,
                    })
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <Input
                label="Expiry Date (Optional)"
                type="date"
                value={selectedAnnouncement.expiryDate || ""}
                onChange={(e) =>
                  setSelectedAnnouncement({
                    ...selectedAnnouncement,
                    expiryDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editFeatured"
                checked={selectedAnnouncement.isFeatured}
                onChange={(e) =>
                  setSelectedAnnouncement({
                    ...selectedAnnouncement,
                    isFeatured: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="editFeatured"
                className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
              >
                Mark as featured announcement
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Announcement</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementsManagement;
