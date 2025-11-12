import api from './api';

const securityService = {
  /**
   * Lấy danh sách active sessions
   */
  getActiveSessions: async () => {
    const response = await api.get('/api/admin/security/sessions/active');
    return response.data;
  },

  /**
   * Force logout session
   */
  forceLogout: async (sessionId) => {
    const response = await api.post(`/api/admin/security/sessions/${sessionId}/invalidate`);
    return response.data;
  },

  /**
   * Lấy login history
   */
  getLoginHistory: async (days = 7) => {
    const response = await api.get(`/api/admin/security/sessions/history?days=${days}`);
    return response.data;
  },

  /**
   * Lấy session statistics
   */
  getSessionStats: async () => {
    const response = await api.get('/api/admin/security/sessions/stats');
    return response.data;
  },

  /**
   * Force logout tất cả sessions của user
   */
  forceLogoutAllUserSessions: async (userId) => {
    const response = await api.post(`/api/admin/security/users/${userId}/sessions/invalidate-all`);
    return response.data;
  }
};

export default securityService;


