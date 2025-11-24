import api from './api';

const securityService = {
  getActiveSessions: async () => {
    const response = await api.get('/api/admin/security/sessions/active');
    return response.data;
  },

  forceLogout: async (sessionId) => {
    const response = await api.post(`/api/admin/security/sessions/${sessionId}/invalidate`);
    return response.data;
  },

  getLoginHistory: async (days = 7) => {
    const response = await api.get(`/api/admin/security/sessions/history?days=${days}`);
    return response.data;
  },

  getSessionStats: async () => {
    const response = await api.get('/api/admin/security/sessions/stats');
    return response.data;
  },

  forceLogoutAllUserSessions: async (userId) => {
    const response = await api.post(`/api/admin/security/users/${userId}/sessions/invalidate-all`);
    return response.data;
  }
};

export default securityService;


