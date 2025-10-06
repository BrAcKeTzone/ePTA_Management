import { useState, useEffect } from "react";
import { useAnnouncementsStore } from "../../store/announcementsStore";
import { useAuthStore } from "../../store/authStore";
import { Card } from "../../components/UI/Card";
import { Badge } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Modal } from "../../components/UI/Modal";

export default function ParentAnnouncements() {
  const { user } = useAuthStore();
  const { announcements, fetchAnnouncements, loading } =
    useAnnouncementsStore();

  const [filter, setFilter] = useState("all"); // all, unread, important
  const [sortBy, setSortBy] = useState("date"); // date, title, priority
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Filter and sort announcements
  const filteredAnnouncements = announcements
    .filter((announcement) => {
      if (filter === "all") return true;
      if (filter === "unread") return !announcement.readBy?.includes(user?.id);
      if (filter === "important")
        return (
          announcement.priority === "HIGH" || announcement.priority === "URGENT"
        );
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "date") {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortBy === "title") {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      } else if (sortBy === "priority") {
        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate statistics
  const totalAnnouncements = announcements.length;
  const unreadCount = announcements.filter(
    (a) => !a.readBy?.includes(user?.id)
  ).length;
  const importantCount = announcements.filter(
    (a) => a.priority === "HIGH" || a.priority === "URGENT"
  ).length;
  const thisWeekCount = announcements.filter((a) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(a.createdAt) > weekAgo;
  }).length;

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementModal(true);

    // Mark as read if not already read
    if (!announcement.readBy?.includes(user?.id)) {
      // TODO: Call API to mark as read
      console.log("Marking announcement as read:", announcement.id);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "URGENT":
        return "🚨";
      case "HIGH":
        return "⚠️";
      case "MEDIUM":
        return "📢";
      case "LOW":
        return "ℹ️";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600">
              Stay updated with PTA news and important information
            </p>
          </div>
          <Button href="/parent/dashboard" variant="outline">
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totalAnnouncements}
            </p>
            <p className="text-sm text-gray-600">Total Announcements</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
            <p className="text-sm text-gray-600">Unread</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{importantCount}</p>
            <p className="text-sm text-gray-600">Important</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{thisWeekCount}</p>
            <p className="text-sm text-gray-600">This Week</p>
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Announcements</option>
                <option value="unread">Unread Only</option>
                <option value="important">Important Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="priority-desc">Priority (High to Low)</option>
                <option value="priority-asc">Priority (Low to High)</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredAnnouncements.length} of {totalAnnouncements}{" "}
            announcements
          </div>
        </div>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => {
            const isUnread = !announcement.readBy?.includes(user?.id);

            return (
              <Card
                key={announcement.id}
                className={`p-6 cursor-pointer hover:shadow-md transition-shadow ${
                  isUnread ? "border-l-4 border-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => handleAnnouncementClick(announcement)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">
                        {getPriorityIcon(announcement.priority)}
                      </span>
                      <h3
                        className={`text-lg font-semibold ${
                          isUnread ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {announcement.title}
                      </h3>
                      {isUnread && (
                        <Badge variant="info" size="sm">
                          New
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {announcement.content.substring(0, 200)}
                      {announcement.content.length > 200 && "..."}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>

                        {announcement.author && (
                          <span className="flex items-center space-x-1">
                            <span>👤</span>
                            <span>{announcement.author.name}</span>
                          </span>
                        )}

                        {announcement.category && (
                          <span className="flex items-center space-x-1">
                            <span>🏷️</span>
                            <span>{announcement.category}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                            announcement.priority
                          )}`}
                        >
                          {announcement.priority}
                        </span>

                        {announcement.attachments &&
                          announcement.attachments.length > 0 && (
                            <Badge variant="outline" size="sm">
                              📎 {announcement.attachments.length}
                            </Badge>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Announcements Found
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "No announcements have been posted yet."
                  : `No ${filter} announcements found.`}
              </p>
              {filter !== "all" && (
                <Button
                  onClick={() => setFilter("all")}
                  variant="outline"
                  className="mt-4"
                >
                  View All Announcements
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Announcement Detail Modal */}
      <Modal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        title={selectedAnnouncement?.title}
        size="lg"
      >
        {selectedAnnouncement && (
          <div className="space-y-4">
            {/* Header Info */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getPriorityIcon(selectedAnnouncement.priority)}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedAnnouncement.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>
                      📅{" "}
                      {new Date(
                        selectedAnnouncement.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {selectedAnnouncement.author && (
                      <span>👤 {selectedAnnouncement.author.name}</span>
                    )}
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(
                  selectedAnnouncement.priority
                )}`}
              >
                {selectedAnnouncement.priority}
              </span>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {selectedAnnouncement.content}
              </div>
            </div>

            {/* Category and Tags */}
            {(selectedAnnouncement.category ||
              selectedAnnouncement.tags?.length > 0) && (
              <div className="flex items-center space-x-4 pt-4 border-t">
                {selectedAnnouncement.category && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      Category:
                    </span>
                    <Badge variant="outline">
                      {selectedAnnouncement.category}
                    </Badge>
                  </div>
                )}
                {selectedAnnouncement.tags &&
                  selectedAnnouncement.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Tags:
                      </span>
                      <div className="flex space-x-1">
                        {selectedAnnouncement.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Attachments */}
            {selectedAnnouncement.attachments &&
              selectedAnnouncement.attachments.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Attachments:
                  </h4>
                  <div className="space-y-2">
                    {selectedAnnouncement.attachments.map(
                      (attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                        >
                          <span>📎</span>
                          <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                            {attachment.name || `Attachment ${index + 1}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({attachment.size || "Unknown size"})
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => setShowAnnouncementModal(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Important Announcements Notice */}
      {importantCount > 0 && (
        <Card className="p-6 border-l-4 border-red-500 bg-red-50">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-xl">🚨</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Important Announcements
              </h3>
              <p className="text-red-700 mb-4">
                You have {importantCount} important{" "}
                {importantCount === 1 ? "announcement" : "announcements"}
                that require your attention. Please review them carefully.
              </p>
              {filter !== "important" && (
                <Button
                  onClick={() => setFilter("important")}
                  variant="danger"
                  size="sm"
                >
                  View Important Announcements
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
