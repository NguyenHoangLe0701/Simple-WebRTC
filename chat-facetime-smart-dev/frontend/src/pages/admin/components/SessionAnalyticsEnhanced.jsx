import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import sessionAnalyticsService from "../../../services/sessionAnalyticsService";

const SessionAnalyticsEnhanced = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sessionAnalyticsService.getCompleteAnalytics({ timeRange });
      setAnalytics(data);
    } catch (err) {
      setError('Không thể tải dữ liệu phân tích. Vui lòng thử lại.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  // MÀU ĐỒNG BỘ VỚI ADMIN DASHBOARD
  const COLORS = {
    active: '#10B981',
    expired: '#6B7280',
    forceLogout: '#EF4444',
    ipColors: ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B'],
    deviceColors: ['#EC4899', '#8B5CF6', '#06B6D4', '#84CC16', '#F59E0B']
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-6 text-xl font-semibold text-gray-700">Đang tải phân tích phiên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <div>
                <h3 className="text-lg font-bold text-red-900">Lỗi tải dữ liệu</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const sessionData = [
    { name: 'Đang hoạt động', value: analytics.summary.activeSessions, color: COLORS.active },
    { name: 'Hết hạn', value: analytics.summary.expiredSessions, color: COLORS.expired },
    { name: 'Buộc thoát', value: analytics.summary.forceLogoutSessions, color: COLORS.forceLogout }
  ];

  const topIPs = analytics.topIPs.slice(0, 10);
  const topDevices = analytics.topDevices.slice(0, 10);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Session Analytics
              </h1>
              <p className="text-gray-600 mt-2">Theo dõi và phân tích toàn bộ phiên đăng nhập hệ thống</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-purple-100"
              >
                <option value="1h">1 giờ gần nhất</option>
                <option value="24h">24 giờ</option>
                <option value="7d">7 ngày</option>
                <option value="30d">30 ngày</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-3 transition-all duration-300 disabled:opacity-70"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-10 w-10 text-green-600" />
              <span className="text-5xl font-bold text-gray-900">{analytics.summary.activeSessions.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Phiên đang hoạt động</h3>
            <p className="text-green-600 font-semibold mt-2">Đang trực tuyến</p>
            <div className="mt-4 h-2 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-gray-500" />
              <span className="text-5xl font-bold text-gray-900">{analytics.summary.expiredSessions.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Phiên hết hạn</h3>
            <p className="text-gray-500 font-semibold mt-2">Tự động đóng</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <span className="text-5xl font-bold text-gray-900">{analytics.summary.forceLogoutSessions.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Buộc thoát</h3>
            <p className="text-red-600 font-semibold mt-2">Nghi ngờ bảo mật</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Phân bố trạng thái phiên</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={sessionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top IPs Bar Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Top 10 IP truy cập nhiều nhất</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topIPs} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="ip" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top IPs Table */}
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-x-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Chi tiết IP truy cập</h3>
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-sm font-bold text-gray-600 border-b-2 border-gray-200">
                  <th className="pb-4">IP Address</th>
                  <th className="pb-4 text-center">Số phiên</th>
                  <th className="pb-4 text-center">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {topIPs.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.ipColors[i % 5] }}></div>
                        <code className="font-mono text-sm">{item.ip}</code>
                      </div>
                    </td>
                    <td className="py-4 text-center font-bold">{item.count.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <span 
                        className="px-3 py-1 rounded-full text-white text-sm font-bold inline-block min-w-[48px]"
                        style={{ backgroundColor: COLORS.ipColors[i % 5] }}
                      >
                        {((item.count / analytics.summary.activeSessions) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Devices Table */}
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-x-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Thiết bị phổ biến</h3>
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-sm font-bold text-gray-600 border-b-2 border-gray-200">
                  <th className="pb-4">Thiết bị / Hệ điều hành</th>
                  <th className="pb-4 text-center">Số phiên</th>
                  <th className="pb-4">Tỷ lệ sử dụng</th>
                </tr>
              </thead>
              <tbody>
                {topDevices.map((device, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.deviceColors[i % 5] }}></div>
                        <span className="font-medium">{device.device}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-bold">{device.count.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: topDevices[0] ? `${(device.count / topDevices[0].count) * 100}%` : '0%',
                            backgroundColor: COLORS.deviceColors[i % 5]
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SessionAnalyticsEnhanced;