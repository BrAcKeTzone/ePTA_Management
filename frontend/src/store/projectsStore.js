import { create } from "zustand";
import { projectsApi } from "../api/projectsApi";

export const useProjectsStore = create((set, get) => ({
  // State
  projects: [],
  activeProjects: [],
  selectedProject: null,
  documents: [],
  publicDocuments: [],
  loading: false,
  error: null,

  // Admin actions
  fetchAllProjects: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await projectsApi.getAllProjects(params);
      set({ projects: response.data || [], loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch projects",
        loading: false,
      });
    }
  },

  createProject: async (projectData) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.createProject(projectData);
      // Refresh projects list
      await get().fetchAllProjects();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create project",
        loading: false,
      });
      throw error;
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.updateProject(projectId, projectData);
      // Refresh projects list
      await get().fetchAllProjects();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update project",
        loading: false,
      });
      throw error;
    }
  },

  updateProjectStatus: async (projectId, status) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.updateProjectStatus(projectId, status);
      // Refresh projects list
      await get().fetchAllProjects();
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to update project status",
        loading: false,
      });
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.deleteProject(projectId);
      // Refresh projects list
      await get().fetchAllProjects();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete project",
        loading: false,
      });
      throw error;
    }
  },

  // Project accomplishments
  addProjectAccomplishment: async (projectId, accomplishmentData) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.addProjectAccomplishment(projectId, accomplishmentData);
      // Refresh projects list
      await get().fetchAllProjects();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add accomplishment",
        loading: false,
      });
      throw error;
    }
  },

  updateProjectAccomplishment: async (
    projectId,
    accomplishmentId,
    accomplishmentData
  ) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.updateProjectAccomplishment(
        projectId,
        accomplishmentId,
        accomplishmentData
      );
      // Refresh projects list
      await get().fetchAllProjects();
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to update accomplishment",
        loading: false,
      });
      throw error;
    }
  },

  deleteProjectAccomplishment: async (projectId, accomplishmentId) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.deleteProjectAccomplishment(
        projectId,
        accomplishmentId
      );
      // Refresh projects list
      await get().fetchAllProjects();
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to delete accomplishment",
        loading: false,
      });
      throw error;
    }
  },

  // Document management
  fetchAllDocuments: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await projectsApi.getAllMeetingDocuments(params);
      set({ documents: response.data || [], loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch documents",
        loading: false,
      });
    }
  },

  uploadDocument: async (projectId, documentData) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.uploadMeetingDocument(projectId, documentData);
      // Refresh documents list
      await get().fetchAllDocuments();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to upload document",
        loading: false,
      });
      throw error;
    }
  },

  updateDocument: async (documentId, documentData) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.updateDocument(documentId, documentData);
      // Refresh documents list
      await get().fetchAllDocuments();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update document",
        loading: false,
      });
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.deleteDocument(documentId);
      // Refresh documents list
      await get().fetchAllDocuments();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete document",
        loading: false,
      });
      throw error;
    }
  },

  downloadDocument: async (documentId) => {
    try {
      set({ loading: true, error: null });
      const response = await projectsApi.downloadDocument(documentId);
      set({ loading: false });
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to download document",
        loading: false,
      });
      throw error;
    }
  },

  // Parent actions
  fetchActiveProjects: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await projectsApi.getActiveProjects(params);
      set({ activeProjects: response.data || [], loading: false });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch active projects",
        loading: false,
      });
    }
  },

  fetchPublicDocuments: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await projectsApi.getPublicDocuments(params);
      set({ publicDocuments: response.data || [], loading: false });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch public documents",
        loading: false,
      });
    }
  },

  // Project details
  fetchProjectDetails: async (projectId) => {
    try {
      set({ loading: true, error: null });
      const response = await projectsApi.getProject(projectId);
      set({ selectedProject: response.data, loading: false });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch project details",
        loading: false,
      });
    }
  },

  // Timeline management
  addProjectTimeline: async (projectId, timelineData) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.addProjectTimeline(projectId, timelineData);
      // Refresh project details if currently selected
      if (get().selectedProject?.id === projectId) {
        await get().fetchProjectDetails(projectId);
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add timeline entry",
        loading: false,
      });
      throw error;
    }
  },

  updateProjectTimeline: async (projectId, timelineId, timelineData) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.updateProjectTimeline(
        projectId,
        timelineId,
        timelineData
      );
      // Refresh project details if currently selected
      if (get().selectedProject?.id === projectId) {
        await get().fetchProjectDetails(projectId);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to update timeline entry",
        loading: false,
      });
      throw error;
    }
  },

  deleteProjectTimeline: async (projectId, timelineId) => {
    try {
      set({ loading: true, error: null });
      await projectsApi.deleteProjectTimeline(projectId, timelineId);
      // Refresh project details if currently selected
      if (get().selectedProject?.id === projectId) {
        await get().fetchProjectDetails(projectId);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to delete timeline entry",
        loading: false,
      });
      throw error;
    }
  },

  // Statistics and summaries
  getProjectSummary: () => {
    const { projects } = get();
    const statusCounts = {};
    projects.forEach((project) => {
      statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
    });

    return {
      total: projects.length,
      statusCounts,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    };
  },

  getDocumentSummary: () => {
    const { documents } = get();
    const categoryCounts = {};
    documents.forEach((doc) => {
      categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
    });

    return {
      total: documents.length,
      categoryCounts,
    };
  },

  // Utility actions
  clearError: () => set({ error: null }),

  setSelectedProject: (project) => set({ selectedProject: project }),

  resetState: () =>
    set({
      projects: [],
      activeProjects: [],
      selectedProject: null,
      documents: [],
      publicDocuments: [],
      loading: false,
      error: null,
    }),
}));
