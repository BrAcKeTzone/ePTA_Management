// Dummy Data Service for PTA Management System
// Simulates API calls using local JSON data for demonstration purposes

import usersData from "../data/users.json";
import studentsData from "../data/students.json";
import attendanceData from "../data/attendance.json";
import contributionsData from "../data/contributions.json";
import announcementsData from "../data/announcements.json";
import projectsData from "../data/projects.json";
import clearanceData from "../data/clearance.json";

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to simulate API response
const createResponse = (data, success = true, message = "") => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const dummyDataService = {
  // Authentication
  async login(email, password) {
    await delay(800);

    const user = usersData.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate fake token
    const token = `fake-jwt-token-${user.id}-${Date.now()}`;

    return createResponse({
      user: userWithoutPassword,
      token,
      expiresIn: "24h",
    });
  },

  async register(userData) {
    await delay(600);

    // Check if email already exists
    const existingUser = usersData.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Create new user
    const newUser = {
      id: (usersData.length + 1).toString(),
      ...userData,
      isActive: true,
      verified: false,
      isVerified: false,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordChangedAt: new Date().toISOString(),
    };

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return createResponse(userWithoutPassword);
  },

  // Users
  async getUsers(params = {}) {
    await delay();

    let filteredUsers = [...usersData];

    // Apply filters
    if (params.role) {
      filteredUsers = filteredUsers.filter((u) => u.role === params.role);
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm) ||
          u.email?.toLowerCase().includes(searchTerm) ||
          u.firstName?.toLowerCase().includes(searchTerm) ||
          u.lastName?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove passwords from all users
    const usersWithoutPasswords = paginatedUsers.map(
      ({ password, ...user }) => user
    );

    return createResponse({
      users: usersWithoutPasswords,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredUsers.length / limit),
        totalUsers: filteredUsers.length,
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1,
      },
    });
  },

  async getUserById(userId) {
    await delay();

    const user = usersData.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;
    return createResponse(userWithoutPassword);
  },

  // Students
  async getStudents(params = {}) {
    await delay();

    let filteredStudents = [...studentsData.students];

    if (params.parentId) {
      filteredStudents = filteredStudents.filter(
        (s) => s.parentId === params.parentId
      );
    }

    if (params.gradeLevel) {
      filteredStudents = filteredStudents.filter(
        (s) => s.gradeLevel === params.gradeLevel
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(searchTerm) ||
          s.lastName?.toLowerCase().includes(searchTerm) ||
          s.studentId?.toLowerCase().includes(searchTerm)
      );
    }

    return createResponse(filteredStudents);
  },

  async getMyChildren(parentId = "current") {
    await delay();

    // Simulate children for current user
    const children = studentsData.students.filter(
      (s) => s.parentId === "parent1" || s.parentId === parentId
    );

    return createResponse(children);
  },

  async getAllStudents(params = {}) {
    await delay();

    let filteredStudents = [...studentsData.students];

    // Apply filters
    if (params.gradeLevel) {
      filteredStudents = filteredStudents.filter(
        (s) => s.gradeLevel === params.gradeLevel
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(searchTerm) ||
          s.lastName?.toLowerCase().includes(searchTerm) ||
          s.studentId?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    return createResponse({
      students: paginatedStudents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredStudents.length / limit),
        totalStudents: filteredStudents.length,
        hasNext: endIndex < filteredStudents.length,
        hasPrev: page > 1,
      },
    });
  },

  // Attendance
  async getMeetings(params = {}) {
    await delay();

    let meetings = [...attendanceData.meetings];

    if (params.status) {
      meetings = meetings.filter((m) => m.status === params.status);
    }

    return createResponse(meetings);
  },

  async getAttendance(params = {}) {
    await delay();

    let attendance = [...attendanceData.attendance];

    if (params.meetingId) {
      attendance = attendance.filter((a) => a.meetingId === params.meetingId);
    }

    if (params.parentId) {
      attendance = attendance.filter((a) => a.parentId === params.parentId);
    }

    return createResponse(attendance);
  },

  async getMyAttendance(parentId = "current") {
    await delay();

    // Simulate attendance data for current user
    const userAttendance = attendanceData.attendance.filter(
      (a) => a.parentId === "parent1" || a.parentId === parentId
    );

    // Calculate summary
    const total = userAttendance.length;
    const attended = userAttendance.filter((a) => a.isPresent).length;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    const recentMeetings = Math.min(3, total);

    return createResponse({
      attendance: userAttendance,
      total,
      attended,
      rate,
      recentMeetings,
    });
  },

  async getMyPenalties(parentId = "current") {
    await delay();

    // Simulate penalties for current user
    const penalties = [
      {
        id: "pen1",
        meetingId: "meeting1",
        meetingTitle: "Monthly PTA Meeting - September 2025",
        meetingDate: "2025-09-15T09:00:00Z",
        reason: "Absence from meeting",
        amount: 100,
        isPaid: false,
        dueDate: "2025-10-15T23:59:59Z",
      },
    ];

    const totalAmount = penalties.reduce((sum, p) => sum + p.amount, 0);

    return createResponse({ penalties, totalAmount });
  },

  async getUpcomingMeetings(params = {}) {
    await delay();

    const now = new Date();
    let upcomingMeetings = attendanceData.meetings.filter(
      (m) => new Date(m.date) > now && m.status === "scheduled"
    );

    // Apply limit if provided
    if (params.limit) {
      upcomingMeetings = upcomingMeetings.slice(0, params.limit);
    }

    return createResponse(upcomingMeetings);
  },

  async markAttendance(meetingId, parentId, studentId, status) {
    await delay();

    const newAttendance = {
      id: `att${Date.now()}`,
      meetingId,
      parentId,
      studentId,
      status,
      timeIn: status === "present" ? new Date().toISOString() : null,
      notes: "",
    };

    return createResponse(newAttendance);
  },

  async bulkRecordAttendance(bulkData) {
    await delay();

    const { meetingId, attendances } = bulkData;
    const results = [];

    for (const attendance of attendances) {
      const newAttendance = {
        id: `att${Date.now()}_${attendance.parentId}`,
        meetingId,
        parentId: attendance.parentId,
        status: attendance.status,
        timeIn:
          attendance.status === "PRESENT" ? new Date().toISOString() : null,
        notes: attendance.remarks || "",
        isLate: attendance.isLate || false,
        createdAt: new Date().toISOString(),
      };
      results.push(newAttendance);
    }

    return createResponse({
      count: results.length,
      attendances: results,
      message: `Successfully recorded ${results.length} attendance records`,
    });
  },

  // Contributions
  async getContributions(params = {}) {
    await delay();

    let contributions = [...contributionsData.contributions];

    if (params.parentId) {
      contributions = contributions.filter(
        (c) => c.parentId === params.parentId
      );
    }

    if (params.status) {
      contributions = contributions.filter((c) => c.status === params.status);
    }

    if (params.type) {
      contributions = contributions.filter((c) => c.type === params.type);
    }

    return createResponse(contributions);
  },

  async getMyContributions(parentId = "current") {
    await delay();

    // Simulate getting contributions for current user
    const contributions = contributionsData.contributions.filter(
      (c) => c.parentId === "parent1" || c.parentId === parentId
    );

    return createResponse(contributions);
  },

  async getMyBalance(parentId = "current") {
    await delay();

    // Calculate balance for current user
    const contributions = contributionsData.contributions.filter(
      (c) => c.parentId === "parent1" || c.parentId === parentId
    );

    const totalPaid = contributions
      .filter((c) => c.isVerified)
      .reduce((sum, c) => sum + c.amount, 0);

    const pendingVerification = contributions
      .filter((c) => !c.isVerified)
      .reduce((sum, c) => sum + c.amount, 0);

    const baseAmount = 2500; // Base contribution amount
    const totalRequired = baseAmount;
    const outstanding = Math.max(0, totalRequired - totalPaid);

    const balance = {
      totalPaid,
      outstanding,
      pendingVerification,
      totalRequired,
      children: [{ name: "Juan Santos", requiredAmount: baseAmount }],
    };

    return createResponse(balance);
  },

  async getPaymentBasis() {
    await delay();

    const paymentBasis = {
      isPerStudent: false,
      baseAmount: 2500,
      multipleChildrenDiscount: 10,
      description: "Annual PTA contribution",
    };

    return createResponse(paymentBasis);
  },

  async recordPayment(paymentData) {
    await delay();

    // Simulate payment processing
    const newPayment = {
      id: `pay${Date.now()}`,
      ...paymentData,
      parentId: "parent1",
      isVerified: false,
      createdAt: new Date().toISOString(),
      receiptNumber:
        paymentData.receiptNumber || `PTA-2025-${String(Date.now()).slice(-6)}`,
    };

    return createResponse(newPayment);
  },

  async getContributionTypes() {
    await delay();
    return createResponse(contributionsData.contributionTypes);
  },

  async getAllContributions(params = {}) {
    await delay();

    let filteredContributions = [...contributionsData.contributions];

    // Apply filters
    if (params.status) {
      filteredContributions = filteredContributions.filter(
        (c) => c.status === params.status
      );
    }

    if (params.type) {
      filteredContributions = filteredContributions.filter(
        (c) => c.type === params.type
      );
    }

    if (params.parentId) {
      filteredContributions = filteredContributions.filter(
        (c) => c.parentId === params.parentId
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredContributions = filteredContributions.filter(
        (c) =>
          c.parentName?.toLowerCase().includes(searchTerm) ||
          c.type?.toLowerCase().includes(searchTerm) ||
          c.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedContributions = filteredContributions.slice(
      startIndex,
      endIndex
    );

    return createResponse({
      contributions: paginatedContributions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredContributions.length / limit),
        totalContributions: filteredContributions.length,
        hasNext: endIndex < filteredContributions.length,
        hasPrev: page > 1,
      },
    });
  },

  // Announcements
  async getAnnouncements(params = {}) {
    await delay();

    let announcements = [...announcementsData.announcements];

    if (params.category) {
      announcements = announcements.filter(
        (a) => a.category === params.category
      );
    }

    if (params.featured) {
      announcements = announcements.filter((a) => a.isFeatured);
    }

    if (params.active) {
      const now = new Date();
      announcements = announcements.filter((a) => {
        const publishDate = new Date(a.publishDate);
        const expiryDate = new Date(a.expiryDate);
        return (
          publishDate <= now && expiryDate >= now && a.status === "published"
        );
      });
    }

    // Sort by publish date (newest first)
    announcements.sort(
      (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
    );

    return createResponse(announcements);
  },

  async getActiveAnnouncements(params = {}) {
    await delay();

    let announcements = [...announcementsData.announcements];

    // Filter only active announcements
    const now = new Date();
    announcements = announcements.filter((a) => {
      if (a.expiryDate) {
        const expiryDate = new Date(a.expiryDate);
        return expiryDate >= now && a.status === "published";
      }
      return a.status === "published";
    });

    // Apply limit if provided
    if (params.limit) {
      announcements = announcements.slice(0, params.limit);
    }

    // Sort by priority and date
    announcements.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, normal: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;

      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return createResponse(announcements);
  },

  async getUnreadCount(parentId = "current") {
    await delay();

    // Simulate unread count for current user
    const unreadCount = Math.floor(Math.random() * 5) + 1; // Random 1-5

    return createResponse({ count: unreadCount });
  },

  async markAnnouncementAsRead(announcementId, parentId = "current") {
    await delay();

    // Simulate marking as read
    return createResponse({
      success: true,
      message: "Announcement marked as read",
    });
  },

  async getMyReadStatus(parentId = "current") {
    await delay();

    // Simulate read status for announcements
    const readStatus = announcementsData.announcements.map((a) => ({
      announcementId: a.id,
      isRead: Math.random() > 0.3, // 70% chance of being read
    }));

    return createResponse(readStatus);
  },

  async getAnnouncementById(id) {
    await delay();

    const announcement = announcementsData.announcements.find(
      (a) => a.id === id
    );
    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // Increment view count (simulate)
    announcement.views = (announcement.views || 0) + 1;

    return createResponse(announcement);
  },

  async createAnnouncement(announcementData) {
    await delay();

    const newAnnouncement = {
      id: `ann${Date.now()}`,
      ...announcementData,
      authorId: "1", // Assume admin user
      authorName: "Maria Santos",
      publishDate: new Date().toISOString(),
      status: "published",
      views: 0,
      attachments: announcementData.attachments || [],
    };

    return createResponse(newAnnouncement);
  },

  // Projects
  async getProjects(params = {}) {
    await delay();

    let projects = [...projectsData.projects];

    if (params.status) {
      projects = projects.filter((p) => p.status === params.status);
    }

    if (params.category) {
      projects = projects.filter((p) => p.category === params.category);
    }

    if (params.organizer) {
      projects = projects.filter((p) => p.organizer === params.organizer);
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm)
      );
    }

    return createResponse(projects);
  },

  async getActiveProjects(params = {}) {
    await delay();

    let projects = [...projectsData.projects];

    // Filter only active projects
    projects = projects.filter(
      (p) =>
        p.status === "active" ||
        p.status === "in_progress" ||
        p.status === "planning"
    );

    // Apply limit if provided
    if (params.limit) {
      projects = projects.slice(0, params.limit);
    }

    return createResponse(projects);
  },

  async getPublicDocuments(params = {}) {
    await delay();

    // Simulate public documents
    const documents = [
      {
        id: "doc1",
        title: "PTA Meeting Minutes - October 2025",
        description: "Minutes from the monthly PTA meeting",
        category: "meeting_minutes",
        fileName: "pta-minutes-oct-2025.pdf",
        fileSize: 1024000,
        createdAt: "2025-10-01T09:00:00Z",
        projectTitle: null,
      },
      {
        id: "doc2",
        title: "School Building Fund Resolution",
        description: "Resolution approved for school building improvements",
        category: "resolution",
        fileName: "building-fund-resolution.pdf",
        fileSize: 512000,
        createdAt: "2025-09-15T14:00:00Z",
        projectTitle: "School Building Fund",
      },
      {
        id: "doc3",
        title: "Financial Report Q3 2025",
        description: "Quarterly financial report for PTA activities",
        category: "financial_report",
        fileName: "financial-report-q3-2025.pdf",
        fileSize: 2048000,
        createdAt: "2025-09-30T16:00:00Z",
        projectTitle: null,
      },
    ];

    return createResponse(documents);
  },

  async downloadDocument(documentId) {
    await delay();

    // Simulate file download
    const fileContent = `Document content for ${documentId}`;
    return new Blob([fileContent], { type: "application/pdf" });
  },

  async getProjectById(projectId) {
    await delay();

    const project = projectsData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    return createResponse(project);
  },

  async createProject(projectData) {
    await delay();

    const newProject = {
      id: `proj${Date.now()}`,
      ...projectData,
      organizer: "1", // Assume admin user
      organizerName: "Maria Santos",
      currentAmount: 0,
      status: "planning",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participants: [],
      milestones: [],
      documents: [],
      updates: [],
    };

    return createResponse(newProject);
  },

  async updateProject(projectId, projectData) {
    await delay();

    const project = projectsData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updatedProject = {
      ...project,
      ...projectData,
      updatedAt: new Date().toISOString(),
    };

    return createResponse(updatedProject);
  },

  async joinProject(projectId, parentId) {
    await delay();

    const project = projectsData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.participants.includes(parentId)) {
      project.participants.push(parentId);
    }

    return createResponse({
      success: true,
      message: "Successfully joined project",
    });
  },

  async addProjectUpdate(projectId, updateData) {
    await delay();

    const newUpdate = {
      id: `up${Date.now()}`,
      ...updateData,
      date: new Date().toISOString(),
      author: "1",
      authorName: "Maria Santos",
    };

    return createResponse(newUpdate);
  },

  async getProjectCategories() {
    await delay();
    return createResponse(projectsData.categories);
  },

  // Clearance
  async getClearanceRequests(params = {}) {
    await delay();

    let clearanceRequests = [...clearanceData.clearanceRequests];

    if (params.parentId) {
      clearanceRequests = clearanceRequests.filter(
        (c) => c.parentId === params.parentId
      );
    }

    if (params.studentId) {
      clearanceRequests = clearanceRequests.filter(
        (c) => c.studentId === params.studentId
      );
    }

    if (params.status) {
      clearanceRequests = clearanceRequests.filter(
        (c) => c.status === params.status
      );
    }

    if (params.clearanceType) {
      clearanceRequests = clearanceRequests.filter(
        (c) => c.clearanceType === params.clearanceType
      );
    }

    return createResponse(clearanceRequests);
  },

  async getMyClearanceStatus(parentId = "current") {
    await delay();

    // Simulate clearance status for current user
    const status = {
      isCleared: false,
      isEligible: true,
      message:
        "You need to complete all requirements before requesting clearance",
      attendance: {
        rate: 75, // 75% attendance rate
        attended: 3,
        total: 4,
        met: false, // Needs 80% minimum
      },
      financial: {
        outstanding: 500,
        met: false, // Still has outstanding balance
      },
      additionalRequirements: [],
    };

    return createResponse(status);
  },

  async getMyClearanceRequests(parentId = "current") {
    await delay();

    // Simulate clearance requests for current user
    const requests = clearanceData.clearanceRequests.filter(
      (r) => r.parentId === "parent1" || r.parentId === parentId
    );

    return createResponse(requests);
  },

  async requestClearance(purpose, studentId = null) {
    await delay();

    const newRequest = {
      id: `clear${Date.now()}`,
      parentId: "parent1",
      studentId,
      studentName: studentId ? "Juan Santos" : null,
      purpose,
      status: "pending",
      createdAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
    };

    return createResponse(newRequest);
  },

  async downloadMyClearance(requestId) {
    await delay();

    // Simulate PDF generation
    const pdfContent = `Clearance Certificate - Request ID: ${requestId}`;
    return new Blob([pdfContent], { type: "application/pdf" });
  },

  async getClearanceRequestById(requestId) {
    await delay();

    const request = clearanceData.clearanceRequests.find(
      (r) => r.id === requestId
    );
    if (!request) {
      throw new Error("Clearance request not found");
    }

    return createResponse(request);
  },

  async submitClearanceRequest(requestData) {
    await delay();

    const newRequest = {
      id: `clear${Date.now()}`,
      ...requestData,
      status: "pending",
      submittedAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
      requirements: clearanceData.clearanceRequirements.map((req) => ({
        id: req.id,
        name: req.name,
        description: req.description,
        status: "pending",
        completedAt: null,
        verifiedBy: null,
      })),
      documents: [],
    };

    return createResponse(newRequest);
  },

  async updateClearanceRequest(requestId, updateData) {
    await delay();

    const request = clearanceData.clearanceRequests.find(
      (r) => r.id === requestId
    );
    if (!request) {
      throw new Error("Clearance request not found");
    }

    const updatedRequest = {
      ...request,
      ...updateData,
      processedAt: new Date().toISOString(),
      processedBy: "1",
    };

    return createResponse(updatedRequest);
  },

  async approveClearanceRequest(requestId, approvalData = {}) {
    await delay();

    return await this.updateClearanceRequest(requestId, {
      status: "approved",
      notes: approvalData.notes || "All requirements completed successfully",
    });
  },

  async rejectClearanceRequest(requestId, rejectionData) {
    await delay();

    return await this.updateClearanceRequest(requestId, {
      status: "rejected",
      rejectionReason: rejectionData.reason,
      notes: rejectionData.notes,
    });
  },

  async getClearanceTypes() {
    await delay();
    return createResponse(clearanceData.clearanceTypes);
  },

  async getClearanceRequirements() {
    await delay();
    return createResponse(clearanceData.clearanceRequirements);
  },

  async uploadClearanceDocument(requestId, documentData) {
    await delay();

    const newDocument = {
      id: `cdoc${Date.now()}`,
      ...documentData,
      uploadedAt: new Date().toISOString(),
      size: "1.2 MB", // Simulated size
    };

    return createResponse(newDocument);
  },

  async downloadClearanceCertificate(requestId) {
    await delay();

    // Simulate PDF generation
    const pdfData = `Clearance Certificate for Request ${requestId}`;
    return new Blob([pdfData], { type: "application/pdf" });
  },

  // Statistics
  async getStats() {
    await delay();

    const stats = {
      users: {
        total: usersData.length,
        admin: usersData.filter((u) => u.role === "ADMIN").length,
        parents: usersData.filter((u) => u.role === "PARENT").length,
        active: usersData.filter((u) => u.isActive).length,
      },
      students: {
        total: studentsData.students.length,
        active: studentsData.students.filter((s) => s.status === "active")
          .length,
      },
      contributions: {
        total: contributionsData.contributions.length,
        paid: contributionsData.contributions.filter((c) => c.status === "paid")
          .length,
        pending: contributionsData.contributions.filter(
          (c) => c.status === "pending"
        ).length,
        totalAmount: contributionsData.contributions
          .filter((c) => c.status === "paid")
          .reduce((sum, c) => sum + c.amount, 0),
      },
      meetings: {
        total: attendanceData.meetings.length,
        upcoming: attendanceData.meetings.filter(
          (m) => new Date(m.date) > new Date() && m.status === "scheduled"
        ).length,
        completed: attendanceData.meetings.filter(
          (m) => m.status === "completed"
        ).length,
      },
    };

    return createResponse(stats);
  },

  // Projects
  async getAllProjects(params = {}) {
    await delay();

    let filteredProjects = [...projectsData.projects];

    // Apply filters
    if (params.status) {
      filteredProjects = filteredProjects.filter(
        (p) => p.status === params.status
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    return createResponse({
      projects: paginatedProjects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredProjects.length / limit),
        totalProjects: filteredProjects.length,
        hasNext: endIndex < filteredProjects.length,
        hasPrev: page > 1,
      },
    });
  },

  async getAllMeetingDocuments(params = {}) {
    await delay();

    // Mock meeting documents data
    const documents = [
      {
        id: "doc1",
        title: "PTA General Assembly Minutes - October 2025",
        type: "minutes",
        fileName: "PTA_Minutes_Oct2025.pdf",
        fileSize: "2.4 MB",
        uploadedBy: "Admin",
        uploadedAt: "2025-10-01T10:00:00Z",
        meetingId: "meeting1",
        downloadUrl: "/documents/pta-minutes-oct2025.pdf",
      },
      {
        id: "doc2",
        title: "Budget Proposal 2025-2026",
        type: "proposal",
        fileName: "Budget_Proposal_2025-2026.pdf",
        fileSize: "1.8 MB",
        uploadedBy: "Admin",
        uploadedAt: "2025-09-15T14:30:00Z",
        meetingId: "meeting2",
        downloadUrl: "/documents/budget-proposal-2025-2026.pdf",
      },
      {
        id: "doc3",
        title: "School Activity Guidelines",
        type: "guidelines",
        fileName: "Activity_Guidelines.pdf",
        fileSize: "950 KB",
        uploadedBy: "Admin",
        uploadedAt: "2025-09-20T09:15:00Z",
        meetingId: "meeting1",
        downloadUrl: "/documents/activity-guidelines.pdf",
      },
    ];

    let filteredDocuments = [...documents];

    // Apply filters
    if (params.type) {
      filteredDocuments = filteredDocuments.filter(
        (d) => d.type === params.type
      );
    }

    if (params.meetingId) {
      filteredDocuments = filteredDocuments.filter(
        (d) => d.meetingId === params.meetingId
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredDocuments = filteredDocuments.filter(
        (d) =>
          d.title?.toLowerCase().includes(searchTerm) ||
          d.fileName?.toLowerCase().includes(searchTerm)
      );
    }

    return createResponse(filteredDocuments);
  },

  // Announcements
  async getAllAnnouncements(params = {}) {
    await delay();

    let filteredAnnouncements = [...announcementsData.announcements];

    // Apply filters
    if (params.priority) {
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) => a.priority === params.priority
      );
    }

    if (params.status) {
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) => a.status === params.status
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchTerm) ||
          a.content?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedAnnouncements = filteredAnnouncements.slice(
      startIndex,
      endIndex
    );

    return createResponse({
      announcements: paginatedAnnouncements,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredAnnouncements.length / limit),
        totalAnnouncements: filteredAnnouncements.length,
        hasNext: endIndex < filteredAnnouncements.length,
        hasPrev: page > 1,
      },
    });
  },

  // Clearance
  async getAllClearanceRequests(params = {}) {
    await delay();

    let filteredRequests = [...clearanceData.clearanceRequests];

    // Apply filters
    if (params.status) {
      filteredRequests = filteredRequests.filter(
        (r) => r.status === params.status
      );
    }

    if (params.parentId) {
      filteredRequests = filteredRequests.filter(
        (r) => r.parentId === params.parentId
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredRequests = filteredRequests.filter(
        (r) =>
          r.parentName?.toLowerCase().includes(searchTerm) ||
          r.reason?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    return createResponse({
      requests: paginatedRequests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredRequests.length / limit),
        totalRequests: filteredRequests.length,
        hasNext: endIndex < filteredRequests.length,
        hasPrev: page > 1,
      },
    });
  },
};
