import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  Video, 
  Code, 
  Settings, 
  Shield, 
  Activity,
  UserPlus,
  Database,
  Zap,
  Crown,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Award,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Mail,
  Download,
  Filter,
  X
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'Người dùng mới đã đăng ký', time: '2 phút trước' },
    { id: 2, type: 'warning', message: 'Hệ thống cần bảo trì', time: '1 giờ trước' },
    { id: 3, type: 'info', message: 'Cập nhật phiên bản mới', time: '3 giờ trước' },
    { id: 4, type: 'success', message: 'Sao lưu dữ liệu thành công', time: '5 giờ trước' }
  ]);

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'users', name: 'Người dùng', icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'analytics', name: 'Phân tích', icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'chat', name: 'Chat', icon: MessageCircle, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'video', name: 'Video Call', icon: Video, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'code', name: 'Code Editor', icon: Code, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'security', name: 'Bảo mật', icon: Shield, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'database', name: 'Database', icon: Database, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { id: 'settings', name: 'Cài đặt', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  ];

  const statCards = [
    {
      title: "Tổng người dùng",
      value: 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: 12,
      trend: "up",
      description: "Tăng 12% so với tháng trước"
    },
    {
      title: "Người dùng thường",
      value: 0,
      icon: User,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: 8,
      trend: "up",
      description: "Người dùng đang hoạt động"
    },
    {
      title: "Quản trị viên",
      value: 0,
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: 0,
      trend: "neutral",
      description: "Quyền truy cập cao"
    },
    {
      title: "Hoạt động hôm nay",
      value: "1,234",
      icon: Activity,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: -2,
      trend: "down",
      description: "Phiên đăng nhập"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-hero-gradient">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-opacity-20 rounded-xl">
              {/* <Crown className="h-8 w-8 text-white" /> */}
              <Link to="/"><img src="images/icons/logo-simplewebrtc.svg" alt="Admin" className="ml-5 h-14 w-34  " /></Link>
            </div>
            <div>
              {/* <h1 className="text-white font-bold text-xl">Admin Panel</h1>
              <p className="text-blue-100 text-sm">Smart Chat System</p> */}
            </div>
              </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
              </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-r rounded-full flex items-center justify-center shadow-lg">
              {/* <User className="h-6 w-6 text-white" /> */}
              <Link to="/admin"><img src="/images/icons/admin-logo.png" alt="Admin" className="h-14 w-14 rounded-full" /></Link>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Administrator</p>
              <p className="text-sm text-gray-600">admin@smartchat.com</p>
          </div>
        </div>
      </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
                return (
                  <button
                    key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? `${tab.bgColor} ${tab.color} shadow-md`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? tab.color : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <span className="font-medium">{tab.name}</span>
                  {isActive && (
                    <div className={`ml-auto w-2 h-2 rounded-full ${tab.color.replace('text-', 'bg-')}`} />
                  )}
                  </button>
                );
              })}
          </div>

          {/* Quick Stats */}
          {/* <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Thống kê nhanh</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Người dùng online</span>
                <span className="text-sm font-bold text-blue-900">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Phiên hoạt động</span>
                <span className="text-sm font-bold text-blue-900">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Tin nhắn hôm nay</span>
                <span className="text-sm font-bold text-blue-900">5,678</span>
              </div>
            </div>
          </div> */}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Đăng xuất</span>
          </button>
          </div>
        </div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-hero-gradient shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold bg-primary hover:text-primaryHover bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-sm text-primary hover:text-primaryHover">Quản lý hệ thống thông minh</p>
                </div>
            </div>

              {/* Center - Search */}
              <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng, tin nhắn, hoạt động..."
                    className="w-full pl-10 pr-4 py-2 border border-black rounded-lg focus:outline-none transition-all duration-200"
                  />
                      </div>
                    </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Quick Actions */}
                <div className="hidden lg:flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative group">
                    <Activity className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                  </button>
                  
                  <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative group">
                    <Database className="h-5 w-5" />
                  </button>
                  
                  <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors relative group">
                    <Zap className="h-5 w-5" />
                  </button>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative transition-colors">
                    <Bell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.length}
                      </span>
                  </button>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      {/* <User className="h-4 w-4 text-white" /> */}
                      <img src="/images/icons/admin-logo.png" alt="Admin" className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">Administrator</p>
                      <p className="text-xs text-gray-500">admin@smartchat.com</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center">
                            {/* <User className="h-6 w-6 text-white" /> */}
                            <img src="/images/icons/admin-logo.png" alt="Admin" className="h-12 w-12 rounded-full" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Administrator</p>
                            <p className="text-sm text-gray-600">admin@smartchat.com</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 py-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => {
                  const Icon = card.icon;
                  
                  return (
                    <div 
                      key={index}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-6 w-6 text-white" />
            </div>
            
                        {card.change !== 0 && (
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                            card.trend === 'up' ? 'bg-green-100 text-green-600' : 
                            card.trend === 'down' ? 'bg-red-100 text-red-600' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {card.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : card.trend === 'down' ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            <span className="text-xs font-medium">
                              {card.trend === 'up' ? '+' : card.trend === 'down' ? '' : ''}{card.change}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                          <div>
                        <p className="text-3xl font-bold text-gray-900 mb-1 group-hover:scale-105 transition-transform duration-200">
                          {card.value}
                        </p>
                        <p className="text-sm font-semibold text-gray-600 mb-2">{card.title}</p>
                        <p className="text-xs text-gray-500">{card.description}</p>
                            </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${card.color} transition-all duration-1000`}
                            style={{ 
                              width: `${Math.min(Math.abs(card.change) * 5, 100)}%` 
                            }}
                          ></div>
                        </div>
            </div>
          </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
                  <button 
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">Làm mới</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group shadow-md hover:shadow-lg">
                    <UserPlus className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-blue-900">Thêm người dùng</span>
                  </button>
                  <button className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group shadow-md hover:shadow-lg">
                    <Database className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-green-900">Sao lưu dữ liệu</span>
                  </button>
                  <button className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group shadow-md hover:shadow-lg">
                    <Settings className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-purple-900">Cài đặt hệ thống</span>
                  </button>
                  <button className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 group shadow-md hover:shadow-lg">
                    <BarChart3 className="h-8 w-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-orange-900">Xuất báo cáo</span>
                  </button>
            </div>
          </div>

              {/* System Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái hệ thống</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900">Database</span>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900">WebSocket</span>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Connected</span>
            </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900">API Server</span>
          </div>
                      <span className="text-sm text-green-600 font-medium">Running</span>
            </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900">Cache</span>
          </div>
                      <span className="text-sm text-yellow-600 font-medium">Warning</span>
            </div>
          </div>
      </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất</h3>
            <div className="space-y-4">
              <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">CPU Usage</span>
                        <span className="font-medium">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
              </div>
              <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Memory</span>
                        <span className="font-medium">67%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '67%'}}></div>
                      </div>
              </div>
              <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Disk Space</span>
                        <span className="font-medium">23%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '23%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Database className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quản lý Database</h3>
                <p className="text-gray-600 mb-6">Tính năng quản lý cơ sở dữ liệu</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-cyan-50 rounded-xl">
                    <Database className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-cyan-900">Quản lý DB</p>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-xl">
                    <Zap className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-cyan-900">Tối ưu hóa</p>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-xl">
                    <Settings className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-cyan-900">Cài đặt</p>
                  </div>
              </div>
              </div>
            </div>
          )}

          {/* Other tabs */}
          {activeTab !== 'overview' && activeTab !== 'database' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h3>
                <p className="text-gray-600 mb-6">Tính năng đang được phát triển</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;