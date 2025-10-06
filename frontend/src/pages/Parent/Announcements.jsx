import React, { useState, useEffect } from "react";
import { announcementsApi } from "../../api/announcementsApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/formatDate";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, unread, featured
  const [readStatus, setReadStatus] = useState({});
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
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadStatus = async () => {
    try {
      const response = await announcementsApi.getMyReadStatus();
      const statusMap = {};
      response.data?.forEach((item) => {
        statusMap[item.announcementId] = item.isRead;
      });
      setReadStatus(statusMap);
    } catch (error) {
      console.error("Error fetching read status:", error);
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

      // Then by priority
      const priorityOrder = { urgent: 3, high: 2, normal: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
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

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Announcements
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
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
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            All Announcements
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Unread ({announcements.filter((a) => !readStatus[a.id]).length})
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "featured"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Featured
          </button>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {currentAnnouncements.length} of{" "}
          {filteredAnnouncements.length} announcements
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {currentAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 transition-all cursor-pointer ${
              !readStatus[announcement.id] ? "border-l-4 border-l-blue-500" : ""
            } ${isExpired(announcement.expiryDate) ? "opacity-75" : ""}`}
            onClick={() => handleMarkAsRead(announcement.id)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3
                    className={`text-lg font-semibold ${
                      !readStatus[announcement.id]
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {announcement.title}
                  </h3>
                  {!readStatus[announcement.id] && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {announcement.isFeatured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      ⭐ Featured
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      announcement.priority
                    )}`}
                  >
                    {announcement.priority}
                  </span>
                  {isExpired(announcement.expiryDate) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      Expired
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {announcement.content}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Posted on {formatDate(announcement.createdAt)}
                  {announcement.expiryDate && (
                    <span
                      className={
                        isExpired(announcement.expiryDate)
                          ? "text-red-600 dark:text-red-400"
                          : ""
                      }
                    >
                      {" • "}Expires on {formatDate(announcement.expiryDate)}
                    </span>
                  )}
                </div>
                {!readStatus[announcement.id] && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(announcement.id);
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Mark as read
                  </button>
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No announcements found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
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

      {/* Help Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          About Announcements
        </h3>
        <div className="text-blue-800 dark:text-blue-200 space-y-2">
          <p>• Click on any announcement to mark it as read</p>
          <p>
            • Featured announcements appear at the top and are marked with a
            star
          </p>
          <p>
            • Urgent and high priority announcements require immediate attention
          </p>
          <p>
            • Some announcements may have expiry dates after which they become
            inactive
          </p>
          <p>
            • New announcements are highlighted with a blue border on the left
          </p>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
