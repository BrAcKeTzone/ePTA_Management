import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

export const projectsApi = {
  // Admin functions
  createProject: async (projectData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.createProject(projectData);
    }
    return await fetchClient.post("/api/projects", projectData);
  },

  updateProject: async (projectId, projectData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateProject(projectId, projectData);
    }
    return await fetchClient.put(`/api/projects/${projectId}`, projectData);
  },

  deleteProject: async (projectId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteProject(projectId);
    }
    return await fetchClient.delete(`/api/projects/${projectId}`);
  },

  getAllProjects: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllProjects(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/projects?${queryString}`);
  },

  getProject: async (projectId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getProject(projectId);
    }
    return await fetchClient.get(`/api/projects/${projectId}`);
  },

  updateProjectStatus: async (projectId, status) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateProjectStatus(projectId, status);
    }
    return await fetchClient.patch(`/api/projects/${projectId}/status`, {
      status,
    });
  },

  addProjectAccomplishment: async (projectId, accomplishmentData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.addProjectAccomplishment(
        projectId,
        accomplishmentData
      );
    }
    return await fetchClient.post(
      `/api/projects/${projectId}/accomplishments`,
      accomplishmentData
    );
  },

  updateProjectAccomplishment: async (
    projectId,
    accomplishmentId,
    accomplishmentData
  ) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateProjectAccomplishment(
        projectId,
        accomplishmentId,
        accomplishmentData
      );
    }
    return await fetchClient.put(
      `/api/projects/${projectId}/accomplishments/${accomplishmentId}`,
      accomplishmentData
    );
  },

  deleteProjectAccomplishment: async (projectId, accomplishmentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteProjectAccomplishment(
        projectId,
        accomplishmentId
      );
    }
    return await fetchClient.delete(
      `/api/projects/${projectId}/accomplishments/${accomplishmentId}`
    );
  },

  // Meeting Minutes & Resolutions
  uploadMeetingDocument: async (projectId, documentData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.uploadMeetingDocument(
        projectId,
        documentData
      );
    }
    const formData = new FormData();
    formData.append("file", documentData.file);
    formData.append("title", documentData.title);
    formData.append("description", documentData.description || "");
    formData.append("category", documentData.category);

    return await fetchClient.post(
      `/api/projects/${projectId}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  getMeetingDocuments: async (projectId, params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMeetingDocuments(projectId, params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/projects/${projectId}/documents?${queryString}`
    );
  },

  getAllMeetingDocuments: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllMeetingDocuments(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/projects/documents?${queryString}`);
  },

  downloadDocument: async (documentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.downloadDocument(documentId);
    }
    return await fetchClient.get(
      `/api/projects/documents/${documentId}/download`,
      {
        responseType: "blob",
      }
    );
  },

  updateDocument: async (documentId, documentData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateDocument(documentId, documentData);
    }
    return await fetchClient.put(
      `/api/projects/documents/${documentId}`,
      documentData
    );
  },

  deleteDocument: async (documentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteDocument(documentId);
    }
    return await fetchClient.delete(`/api/projects/documents/${documentId}`);
  },

  // Parent functions
  getActiveProjects: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getActiveProjects(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/projects/active?${queryString}`);
  },

  getPublicDocuments: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getPublicDocuments(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/projects/documents/public?${queryString}`
    );
  },

  // Project timeline
  addProjectTimeline: async (projectId, timelineData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.addProjectTimeline(projectId, timelineData);
    }
    return await fetchClient.post(
      `/api/projects/${projectId}/timeline`,
      timelineData
    );
  },

  getProjectTimeline: async (projectId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getProjectTimeline(projectId);
    }
    return await fetchClient.get(`/api/projects/${projectId}/timeline`);
  },

  updateProjectTimeline: async (projectId, timelineId, timelineData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateProjectTimeline(
        projectId,
        timelineId,
        timelineData
      );
    }
    return await fetchClient.put(
      `/api/projects/${projectId}/timeline/${timelineId}`,
      timelineData
    );
  },

  deleteProjectTimeline: async (projectId, timelineId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteProjectTimeline(
        projectId,
        timelineId
      );
    }
    return await fetchClient.delete(
      `/api/projects/${projectId}/timeline/${timelineId}`
    );
  },
};
