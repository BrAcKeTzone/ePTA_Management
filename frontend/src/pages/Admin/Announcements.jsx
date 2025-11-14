import React, { useState, useEffect } from "react";
import { announcementsApi } from "../../api/announcementsApi";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "normal",
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
      await announcementsApi.createAnnouncement(newAnnouncement);
      setShowCreateModal(false);
      setNewAnnouncement({
        title: "",
        content: "",
        priority: "normal",
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
      await announcementsApi.updateAnnouncement(
        selectedAnnouncement.id,
        selectedAnnouncement
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

  const handleTogglePublish = async (announcementId) => {
    try {
      await announcementsApi.togglePublish(announcementId);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const announcementColumns = [
    {
      key: "title",
      header: "Title",
      render: (announcement) => (
        <div>
          <div className="font-medium">{announcement.title}</div>
          <div className="text-sm text-gray-600">
            {announcement.content.substring(0, 100)}
            {announcement.content.length > 100 ? "..." : ""}
          </div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (announcement) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            announcement.priority === "urgent"
              ? "bg-red-100 text-red-800"
              : announcement.priority === "high"
              ? "bg-orange-100 text-orange-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {announcement.priority}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (announcement) => (
        <div className="flex flex-col space-y-1">
          {announcement.isFeatured && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Featured
            </span>
          )}
          {isExpired(announcement.expiryDate) && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Expired
            </span>
          )}
          {announcement.isArchived && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Archived
            </span>
          )}
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (announcement) => (
        <div className="text-sm">
          <div>Created: {formatDate(announcement.createdAt)}</div>
          {announcement.expiryDate && (
            <div
              className={
                isExpired(announcement.expiryDate)
                  ? "text-red-600"
                  : "text-gray-600"
              }
            >
              Expires: {formatDate(announcement.expiryDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (announcement) => (
        <div className="flex flex-col space-y-1">
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAnnouncement(announcement);
                setShowEditModal(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleFeatured(announcement.id)}
            >
              {announcement.isFeatured ? "Unfeature" : "Feature"}
            </Button>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTogglePublish(announcement.id)}
              className={
                announcement.isPublished
                  ? ""
                  : "bg-green-50 text-green-700 border-green-300"
              }
            >
              {announcement.isPublished ? "Unpublish" : "Publish"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleArchiveAnnouncement(announcement.id)}
            >
              Archive
            </Button>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteAnnouncement(announcement.id)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
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

      {/* Announcements Table/Cards */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">All Announcements</h2>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table
            data={announcements}
            columns={announcementColumns}
            emptyMessage="No announcements found"
          />
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {announcements.length > 0 ? (
            <div className="space-y-4 p-6">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {announcement.priority.charAt(0) +
                          announcement.priority.slice(1).toLowerCase()}{" "}
                        Priority
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {announcement.isFeatured && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                      {isExpired(announcement.expiryDate) && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                    {announcement.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires:</span>
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
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="text-gray-900 font-medium">
                        {announcement.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 mb-1">Content:</span>
                      <span className="text-gray-900 text-sm line-clamp-3">
                        {announcement.content}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const formattedAnnouncement = {
                          ...announcement,
                          expiryDate: announcement.expiryDate
                            ? new Date(announcement.expiryDate)
                                .toISOString()
                                .split("T")[0]
                            : "",
                        };
                        setSelectedAnnouncement(formattedAnnouncement);
                        setShowEditModal(true);
                      }}
                      className="w-full"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(announcement.id)}
                      className={`w-full ${
                        announcement.isPublished
                          ? ""
                          : "bg-green-50 text-green-700 border-green-300"
                      }`}
                    >
                      {announcement.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFeatured(announcement.id)}
                      className="w-full"
                    >
                      {announcement.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchiveAnnouncement(announcement.id)}
                      className="w-full"
                    >
                      Archive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 p-6">
              <p className="text-gray-500">No announcements found</p>
            </div>
          )}
        </div>
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
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
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
          <div className="space-y-2">
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
                className="mr-2"
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium text-gray-700"
              >
                Mark as featured announcement
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={newAnnouncement.isPublished}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    isPublished: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label
                htmlFor="published"
                className="text-sm font-medium text-gray-700"
              >
                Publish immediately (visible to parents)
              </label>
            </div>
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
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
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
            <div className="space-y-2">
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
                  className="mr-2"
                />
                <label
                  htmlFor="editFeatured"
                  className="text-sm font-medium text-gray-700"
                >
                  Mark as featured announcement
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editPublished"
                  checked={selectedAnnouncement.isPublished}
                  onChange={(e) =>
                    setSelectedAnnouncement({
                      ...selectedAnnouncement,
                      isPublished: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label
                  htmlFor="editPublished"
                  className="text-sm font-medium text-gray-700"
                >
                  Publish (visible to parents)
                </label>
              </div>
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
