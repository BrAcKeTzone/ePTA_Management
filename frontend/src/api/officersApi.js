import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/officers";

const officersApi = {
  // Get all officers
  getAllOfficers: async () => {
    const response = await fetchClient.get(API_BASE);
    return response.data;
  },

  // Assign an officer to a position
  assignOfficer: async (position, userId) => {
    const response = await fetchClient.post(API_BASE, { position, userId });
    return response.data;
  },

  // Remove an officer from a position
  removeOfficer: async (position) => {
    const response = await fetchClient.delete(`${API_BASE}/${position}`);
    return response.data;
  },
};

export default officersApi;
