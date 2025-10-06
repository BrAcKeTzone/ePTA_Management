import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

export const settingsApi = {
  // Penalty settings
  getPenaltySettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getPenaltySettings();
    }
    return await fetchClient.get("/api/settings/penalty");
  },

  updatePenaltySettings: async (penaltyData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updatePenaltySettings(penaltyData);
    }
    return await fetchClient.put("/api/settings/penalty", penaltyData);
  },

  // Payment basis settings
  getPaymentBasisSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getPaymentBasisSettings();
    }
    return await fetchClient.get("/api/settings/payment-basis");
  },

  updatePaymentBasisSettings: async (paymentData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updatePaymentBasisSettings(paymentData);
    }
    return await fetchClient.put("/api/settings/payment-basis", paymentData);
  },

  // Contribution amount settings
  getContributionSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getContributionSettings();
    }
    return await fetchClient.get("/api/settings/contributions");
  },

  updateContributionSettings: async (contributionData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateContributionSettings(
        contributionData
      );
    }
    return await fetchClient.put(
      "/api/settings/contributions",
      contributionData
    );
  },

  // Document category settings
  getDocumentCategories: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getDocumentCategories();
    }
    return await fetchClient.get("/api/settings/document-categories");
  },

  updateDocumentCategories: async (categories) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateDocumentCategories(categories);
    }
    return await fetchClient.put(
      "/api/settings/document-categories",
      categories
    );
  },

  addDocumentCategory: async (categoryData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.addDocumentCategory(categoryData);
    }
    return await fetchClient.post(
      "/api/settings/document-categories",
      categoryData
    );
  },

  deleteDocumentCategory: async (categoryId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteDocumentCategory(categoryId);
    }
    return await fetchClient.delete(
      `/api/settings/document-categories/${categoryId}`
    );
  },

  // System settings
  getSystemSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getSystemSettings();
    }
    return await fetchClient.get("/api/settings/system");
  },

  updateSystemSettings: async (systemData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateSystemSettings(systemData);
    }
    return await fetchClient.put("/api/settings/system", systemData);
  },

  // School year settings
  getSchoolYearSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getSchoolYearSettings();
    }
    return await fetchClient.get("/api/settings/school-year");
  },

  updateSchoolYearSettings: async (schoolYearData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateSchoolYearSettings(schoolYearData);
    }
    return await fetchClient.put("/api/settings/school-year", schoolYearData);
  },

  // Notification settings
  getNotificationSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getNotificationSettings();
    }
    return await fetchClient.get("/api/settings/notifications");
  },

  updateNotificationSettings: async (notificationData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateNotificationSettings(
        notificationData
      );
    }
    return await fetchClient.put(
      "/api/settings/notifications",
      notificationData
    );
  },

  // All settings (for settings page)
  getAllSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllSettings();
    }
    return await fetchClient.get("/api/settings");
  },

  // Backup settings
  backupSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.backupSettings();
    }
    return await fetchClient.post(
      "/api/settings/backup",
      {},
      {
        responseType: "blob",
      }
    );
  },

  restoreSettings: async (backupFile) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.restoreSettings(backupFile);
    }
    const formData = new FormData();
    formData.append("backup", backupFile);

    return await fetchClient.post("/api/settings/restore", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Reset to defaults
  resetToDefaults: async (settingType = "all") => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.resetToDefaults(settingType);
    }
    return await fetchClient.post("/api/settings/reset", { settingType });
  },
};
