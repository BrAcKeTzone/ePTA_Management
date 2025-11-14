import React, { useState, useEffect } from "react";
import { announcementsApi } from "../../api/announcementsApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/formatDate";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, unread, featured
  const [readStatus, setReadStatus] = useState({});
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAnnouncements();
    fetchReadStatus();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, filter, readStatus]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsApi.getActiveAnnouncements();
      console.log("Announcements API Response:", response);
      console.log("Response data:", response.data);

      // Try multiple possible response structures
      const announcementsData =
        response.data?.data?.announcements ||
        response.data?.announcements ||
        response.data ||
        [];

      console.log("Extracted announcements:", announcementsData);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      console.error("Error response:", error.response);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadStatus = async () => {
    try {
      const response = await announcementsApi.getMyReadStatus();
      console.log("Read Status API Response:", response);

      const statusMap = {};
      // Try multiple possible response structures
      const announcements =
        response.data?.data?.announcements ||
        response.data?.announcements ||
        response.data ||
        [];

      console.log("Extracted read status announcements:", announcements);
      announcements.forEach((item) => {
        statusMap[item.id] = item.isRead;
      });
      setReadStatus(statusMap);
    } catch (error) {
      console.error("Error fetching read status:", error);
      console.error("Error response:", error.response);
    }
  };

  const filterAnnouncements = () => {
    let filtered = [...announcements];

    switch (filter) {
      case "unread":
        filtered = filtered.filter(
          (announcement) => !readStatus[announcement.id]
        );
        break;
      case "featured":
        filtered = filtered.filter((announcement) => announcement.isFeatured);
        break;
      case "all":
      default:
        // No filtering needed
        break;
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      // First by featured status
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      // Then by priority (URGENT > HIGH > MEDIUM > LOW)
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      if (aPriority !== bPriority) return bPriority - aPriority;

      // Finally by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
  };

  const handleMarkAsRead = async (announcementId) => {
    if (readStatus[announcementId]) return; // Already read

    try {
      await announcementsApi.markAnnouncementAsRead(announcementId);
      setReadStatus((prev) => ({
        ...prev,
        [announcementId]: true,
      }));
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  };

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailModal(true);
    handleMarkAsRead(announcement.id);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "LOW":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "MEDIUM":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(
    startIndex,
    endIndex
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* About Announcements Modal */}
      <Modal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About Announcements"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-gray-700 space-y-2">
            <p>• Click on any announcement to view full details</p>
            <p>
              • Featured announcements appear at the top and are marked with a
              star
            </p>
            <p>
              • Urgent and high priority announcements require immediate
              attention
            </p>
            <p>
              • Some announcements may have expiry dates after which they become
              inactive
            </p>
            <p>
              • Unread announcements have a darker background to help you
              identify them
            </p>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 italic">
              Click anywhere outside this box or press the × button to close
            </p>
          </div>
        </div>
      </Modal>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAnnouncement(null);
          }}
          title={selectedAnnouncement.title}
          size="lg"
        >
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {selectedAnnouncement.isFeatured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  ⭐ Featured
                </span>
              )}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                  selectedAnnouncement.priority
                )}`}
              >
                {selectedAnnouncement.priority?.charAt(0) +
                  selectedAnnouncement.priority?.slice(1).toLowerCase()}
              </span>
              {isExpired(selectedAnnouncement.expiryDate) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  Expired
                </span>
              )}
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {selectedAnnouncement.content}
              </p>
            </div>

            {/* Footer Info */}
            <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Posted on:</span>{" "}
                {formatDate(selectedAnnouncement.createdAt)}
              </p>
              {selectedAnnouncement.expiryDate && (
                <p>
                  <span className="font-medium">Expires on:</span>{" "}
                  <span
                    className={
                      isExpired(selectedAnnouncement.expiryDate)
                        ? "text-red-600 font-medium"
                        : ""
                    }
                  >
                    {formatDate(selectedAnnouncement.expiryDate)}
                  </span>
                </p>
              )}
              {selectedAnnouncement.createdBy && (
                <p>
                  <span className="font-medium">Posted by:</span>{" "}
                  {selectedAnnouncement.createdBy.firstName}{" "}
                  {selectedAnnouncement.createdBy.lastName}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-1">
          Stay updated with the latest PTA announcements
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Announcements
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Unread ({announcements.filter((a) => !readStatus[a.id]).length})
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "featured"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Featured
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Showing {currentAnnouncements.length} of{" "}
          {filteredAnnouncements.length} announcements
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {currentAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className={`rounded-lg shadow-sm border transition-all cursor-pointer hover:shadow-md ${
              !readStatus[announcement.id]
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200"
            } ${isExpired(announcement.expiryDate) ? "opacity-75" : ""}`}
            onClick={() => handleAnnouncementClick(announcement)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      className={`text-lg font-semibold ${
                        !readStatus[announcement.id]
                          ? "text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {announcement.title}
                    </h3>
                    {!readStatus[announcement.id] && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {announcement.isFeatured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      announcement.priority
                    )}`}
                  >
                    {announcement.priority?.charAt(0) +
                      announcement.priority?.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-3">
                <p className="text-gray-600 text-sm">
                  {truncateContent(announcement.content)}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Posted on {formatDate(announcement.createdAt)}</span>
                {announcement.expiryDate && (
                  <span
                    className={
                      isExpired(announcement.expiryDate) ? "text-red-600" : ""
                    }
                  >
                    Expires: {formatDate(announcement.expiryDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No announcements found
          </h3>
          <p className="text-gray-600">
            {filter === "unread"
              ? "You're all caught up! No unread announcements."
              : filter === "featured"
              ? "No featured announcements at the moment."
              : "No announcements have been posted yet."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Announcements;
