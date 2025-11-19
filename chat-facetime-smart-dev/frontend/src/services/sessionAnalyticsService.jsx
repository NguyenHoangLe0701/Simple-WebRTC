// services/sessionAnalyticsService.js
import api from './api';

export const sessionAnalyticsService = {
  async getSessionSummary() {
    const response = await api.get('/api/admin/analytics/sessions/summary');
    return response.data;
  },

  async getTopIPs() {
    const response = await api.get('/api/admin/analytics/sessions/top-ip');
    return response.data.ips;
  },

  async getTopDevices() {
    const response = await api.get('/api/admin/analytics/sessions/top-devices');
    return response.data.devices;
  },

  async getCompleteAnalytics() {
    const response = await api.get('/api/admin/analytics/sessions/complete');
    return response.data;
  }
};

export default sessionAnalyticsService;