import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Clock,
  MapPin,
  Monitor,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  AlertTriangle
} from 'lucide-react';
import securityService from '../../services/securityService';

function Security() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    activeSessions: 0,
    todayLogins: 0,
    totalSessions: 0
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);
  const [showHistory, setShowHistory] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    fetchData();
    // Auto-refresh mỗi 30 giây
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch active sessions
      const sessionsData = await securityService.getActiveSessions();
      setSessions(sessionsData);
      
      // Fetch stats
      const statsData = await securityService.getSessionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching security data:', error);
      setError('Lỗi khi tải dữ liệu bảo mật');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      setError('');
      const historyData = await securityService.getLoginHistory(historyDays);
      setLoginHistory(historyData);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching login history:', error);
      setError('Lỗi khi tải lịch sử đăng nhập');
    }
  };

  const handleForceLogout = async (sessionId) => {
    try {
      setError('');
      setSuccess('');
      await securityService.forceLogout(sessionId);
      setSuccess('Force logout thành công');
      await fetchData();
      setShowConfirmDialog(false);
      setSelectedSession(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error forcing logout:', error);
      setError(error.response?.data?.error || 'Lỗi khi force logout');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleForceLogoutAll = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn force logout tất cả sessions của user này?')) {
      try {
        setError('');
        setSuccess('');
        await securityService.forceLogoutAllUserSessions(userId);
        setSuccess('Force logout tất cả sessions thành công');
        await fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error forcing logout all:', error);
        setError(error.response?.data?.error || 'Lỗi khi force logout');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const openConfirmDialog = (session) => {
    setSelectedSession(session);
    setShowConfirmDialog(true);
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <Monitor className="h-4 w-4" />;
    const device = deviceInfo.toLowerCase();
    if (device.includes('mobile')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (device.includes('tablet')) {
      return <Tablet className="h-4 w-4" />;
    } else {
      return <Laptop className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý bảo mật</h1>
              <p className="text-gray-600">Quản lý phiên đăng nhập và bảo mật hệ thống</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <button
                onClick={fetchData}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Làm mới</span>
              </button>
              <button
                onClick={fetchLoginHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl hover:from-primaryHover hover:to-blue-700 transition-colors"
              >
                <Calendar className="h-5 w-5" />
                <span>Lịch sử đăng nhập</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Phiên đang hoạt động</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeSessions || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đăng nhập hôm nay</p>
                  <p className="text-2xl font-bold text-green-600">{stats.todayLogins || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng phiên</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalSessions || 0}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Active Sessions Table */}
        {!showHistory && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Phiên đăng nhập đang hoạt động</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-hero-gradient">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thiết bị
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thời gian đăng nhập
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thời lượng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Hoạt động cuối
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Shield className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">Không có phiên đăng nhập đang hoạt động</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-sm">
                                  {(session.fullName || session.username || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {session.fullName || session.username}
                              </div>
                              <div className="text-sm text-gray-500">{session.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getDeviceIcon(session.deviceInfo)}
                            <span className="text-sm text-gray-900">{session.deviceInfo || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Globe className="h-4 w-4 mr-2 text-gray-400" />
                            {session.ipAddress || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {formatDate(session.loginTime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(session.duration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-gray-400" />
                            {formatDate(session.lastActivity)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openConfirmDialog(session)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Force logout"
                            >
                              <LogOut className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleForceLogoutAll(session.userId)}
                              className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                              title="Force logout tất cả sessions của user"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Login History */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lịch sử đăng nhập</h2>
                <p className="text-sm text-gray-600 mt-1">Lịch sử đăng nhập trong {historyDays} ngày qua</p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={historyDays}
                  onChange={(e) => {
                    setHistoryDays(parseInt(e.target.value));
                    fetchLoginHistory();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="1">1 ngày</option>
                  <option value="7">7 ngày</option>
                  <option value="30">30 ngày</option>
                  <option value="90">90 ngày</option>
                </select>
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-hero-gradient">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thiết bị
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thời gian đăng nhập
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loginHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">Không có lịch sử đăng nhập</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    loginHistory.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-sm">
                                  {(session.fullName || session.username || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {session.fullName || session.username}
                              </div>
                              <div className="text-sm text-gray-500">{session.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getDeviceIcon(session.deviceInfo)}
                            <span className="text-sm text-gray-900">{session.deviceInfo || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Globe className="h-4 w-4 mr-2 text-gray-400" />
                            {session.ipAddress || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {formatDate(session.loginTime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              session.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : session.status === 'FORCE_LOGOUT'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {session.status === 'ACTIVE' ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Hoạt động
                              </>
                            ) : session.status === 'FORCE_LOGOUT' ? (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Force logout
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Hết hạn
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Xác nhận Force Logout</h2>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedSession(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Bạn có chắc chắn muốn force logout phiên đăng nhập này?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {selectedSession.fullName || selectedSession.username}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedSession.ipAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(selectedSession.deviceInfo)}
                    <span className="text-sm text-gray-600">{selectedSession.deviceInfo}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatDate(selectedSession.loginTime)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleForceLogout(selectedSession.sessionId)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg"
                >
                  Force Logout
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedSession(null);
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Security;

