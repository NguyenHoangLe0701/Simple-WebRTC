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
  X,
  Plus,
  Lock,
  Unlock,
  Monitor,
  MessageCircle as ChatIcon,
  EyeOff,
  UserMinus,
  Star,
  TrendingUp as Growth,
  HardDrive,
  Server,
  Activity as ActivityIcon,
  FileText,
  History,
  Wrench,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Layers,
  Table,
  Database as DbIcon,
  Gauge,
  HardDrive as StorageIcon,
  Terminal,
  FileCheck,
  FileX
} from 'lucide-react';
import api from '../services/api';
import UsersComponent from './admin/Users';
import SecurityComponent from './admin/Security';
import SettingsComponent from './admin/Settings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    maxParticipants: 50,
    isPrivate: false,
    allowScreenShare: true,
    allowChat: true
  });
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'Người dùng mới đã đăng ký', time: '2 phút trước' },
    { id: 2, type: 'warning', message: 'Hệ thống cần bảo trì', time: '1 giờ trước' },
    { id: 3, type: 'info', message: 'Cập nhật phiên bản mới', time: '3 giờ trước' },
    { id: 4, type: 'success', message: 'Sao lưu dữ liệu thành công', time: '5 giờ trước' }
  ]);

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'users', name: 'Người dùng', icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'rooms', name: 'Phòng họp', icon: Video, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'analytics', name: 'Phân tích', icon: Activity, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'security', name: 'Bảo mật', icon: Shield, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'database', name: 'Database', icon: Database, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { id: 'settings', name: 'Cài đặt', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  ];

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: 12,
      trend: "up",
      description: "Tăng 12% so với tháng trước"
    },
    {
      title: "Người dùng hoạt động",
      value: stats.activeUsers || 0,
      icon: User,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: 8,
      trend: "up",
      description: "Người dùng đang hoạt động"
    },
    {
      title: "Tổng phòng họp",
      value: stats.totalRooms || 0,
      icon: Video,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: 5,
      trend: "up",
      description: "Phòng đã tạo"
    },
    {
      title: "Người tham gia",
      value: stats.totalParticipants || 0,
      icon: Activity,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: 15,
      trend: "up",
      description: "Tổng người tham gia"
    }
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await api.get('/api/admin/users');
      setUsers(usersResponse.data);
      
      // Fetch rooms
      const roomsResponse = await api.get('/api/rooms');
      setRooms(roomsResponse.data);
      
      // Calculate stats
      const totalUsers = usersResponse.data.length;
      const activeUsers = usersResponse.data.filter(user => user.active).length;
      const totalRooms = roomsResponse.data.length;
      const activeRooms = roomsResponse.data.filter(room => room.isActive).length;
      
      setStats({
        totalUsers,
        activeUsers,
        totalRooms,
        activeRooms,
        totalParticipants: roomsResponse.data.reduce((sum, room) => sum + (room.participants?.length || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const deleteRoom = async (roomId) => {
    try {
      await api.delete(`/api/rooms/${roomId}`);
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const toggleRoomLock = async (roomId, isLocked) => {
    try {
      await api.put(`/api/rooms/${roomId}/settings`, { isLocked: !isLocked });
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, isLocked: !isLocked } : room
      ));
    } catch (error) {
      console.error('Error toggling room lock:', error);
    }
  };

  const createRoom = async () => {
    try {
      const response = await api.post('/api/rooms', {
        ...newRoom,
        hostId: currentUser.id,
        hostName: currentUser.fullName || currentUser.username
      });
      
      setRooms(prev => [response.data, ...prev]);
      setShowCreateRoomModal(false);
      setNewRoom({
        name: '',
        description: '',
        maxParticipants: 50,
        isPrivate: false,
        allowScreenShare: true,
        allowChat: true
      });
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const getRoomStatus = (room) => {
    if (room.isLocked) return { text: 'Đã khóa', color: 'text-red-600', bg: 'bg-red-100' };
    if (room.participants?.length >= room.maxParticipants) return { text: 'Đầy', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (room.isActive) return { text: 'Hoạt động', color: 'text-green-600', bg: 'bg-green-100' };
    return { text: 'Chờ', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'active':
        return matchesSearch && room.isActive;
      case 'locked':
        return matchesSearch && room.isLocked;
      case 'private':
        return matchesSearch && room.isPrivate;
      default:
        return matchesSearch;
    }
  });

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

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Quản lý phòng họp</h3>
                    <p className="text-gray-600">Quản lý tất cả phòng họp trong hệ thống</p>
                  </div>
                  <button
                    onClick={() => setShowCreateRoomModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Tạo phòng mới</span>
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm phòng họp..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setFilter('active')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === 'active' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Hoạt động
                    </button>
                    <button
                      onClick={() => setFilter('locked')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === 'locked' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Đã khóa
                    </button>
                    <button
                      onClick={() => setFilter('private')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === 'private' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Riêng tư
                    </button>
                  </div>
                </div>
              </div>

              {/* Rooms Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => {
                    const status = getRoomStatus(room);
                    
                    return (
                      <div key={room.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
                        {/* Room Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Video className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{room.name}</h3>
                                <p className="text-purple-100 text-sm">{room.description}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-lg">
                              <Crown className="h-4 w-4" />
                              <span className="text-sm font-medium">Admin</span>
                            </div>
                          </div>
                        </div>

                        {/* Room Content */}
                        <div className="p-4">
                          {/* Status and Info */}
                          <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                              {status.text}
                            </span>
                            
                            <div className="flex items-center space-x-1 text-gray-500 text-sm">
                              <Users className="h-4 w-4" />
                              <span>{room.participants?.length || 0}/{room.maxParticipants}</span>
                            </div>
                          </div>

                          {/* Room Details */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Chủ phòng:</span>
                              <span className="font-medium">{room.hostName}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Tạo lúc:</span>
                              <span className="font-medium">{formatDate(room.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Cài đặt:</span>
                              <div className="flex items-center space-x-1">
                                {room.allowScreenShare && <Monitor className="h-4 w-4 text-green-500" />}
                                {room.allowChat && <ChatIcon className="h-4 w-4 text-green-500" />}
                                {room.isPrivate && <Lock className="h-4 w-4 text-red-500" />}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleRoomLock(room.id, room.isLocked)}
                              className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                                room.isLocked 
                                  ? 'bg-green-500 text-white hover:bg-green-600' 
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              {room.isLocked ? 'Mở khóa' : 'Khóa phòng'}
                            </button>
                            
                            <button
                              onClick={() => deleteRoom(room.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Xóa phòng"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredRooms.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Không có phòng nào</h3>
                  <p className="text-gray-600 mb-4">Hãy tạo phòng họp đầu tiên</p>
                  <button
                    onClick={() => setShowCreateRoomModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                  >
                    Tạo phòng mới
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Quản lý Database</h3>
                    <p className="text-gray-600 mt-1">Quản lý và giám sát cơ sở dữ liệu hệ thống</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
              </div>

              {/* 1. Thông tin tổng quan Database */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trạng thái Database */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Database className="h-5 w-5 mr-2 text-cyan-600" />
                      Trạng thái Database
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Connection Status */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Trạng thái kết nối</p>
                          <p className="text-sm text-gray-600">Database Server</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          Online
                        </span>
                      </div>
                    </div>

                    {/* Database Version */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <Server className="h-5 w-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phiên bản Database</p>
                            <p className="font-semibold text-gray-900">MySQL 8.0.35</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Storage Usage */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <StorageIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Dung lượng sử dụng</p>
                            <p className="font-semibold text-gray-900">2.5 GB / 10 GB</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full" style={{width: '25%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thống kê nhanh */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ActivityIcon className="h-5 w-5 mr-2 text-cyan-600" />
                      Thống kê nhanh
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Số lượng bảng */}
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Table className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Số lượng bảng</p>
                            <p className="text-2xl font-bold text-gray-900">24</p>
                          </div>
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    </div>

                    {/* Tổng số bản ghi */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tổng số bản ghi</p>
                            <p className="text-2xl font-bold text-gray-900">1,234,567</p>
                          </div>
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    </div>

                    {/* Truy vấn/giây */}
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Truy vấn/giây</p>
                            <p className="text-2xl font-bold text-gray-900">156</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Trung bình</p>
                          <p className="text-sm font-medium text-orange-600">+12%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Công cụ Quản lý Database */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Backup & Restore */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-cyan-600" />
                      Backup & Restore
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Backup Button */}
                    <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg">
                      <Download className="h-5 w-5" />
                      <span className="font-medium">Sao lưu dữ liệu</span>
                    </button>

                    {/* Restore Button */}
                    <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200">
                      <RotateCcw className="h-5 w-5" />
                      <span className="font-medium">Khôi phục dữ liệu</span>
                    </button>

                    {/* Backup History */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Lịch sử sao lưu</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-xs font-medium text-gray-900">backup_2024_01_15.sql</p>
                              <p className="text-xs text-gray-500">15/01/2024 14:30</p>
                            </div>
                          </div>
                          <span className="text-xs text-green-600 font-medium">2.3 GB</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-xs font-medium text-gray-900">backup_2024_01_14.sql</p>
                              <p className="text-xs text-gray-500">14/01/2024 14:30</p>
                            </div>
                          </div>
                          <span className="text-xs text-green-600 font-medium">2.2 GB</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-xs font-medium text-gray-900">backup_2024_01_13.sql</p>
                              <p className="text-xs text-gray-500">13/01/2024 14:30</p>
                            </div>
                          </div>
                          <span className="text-xs text-green-600 font-medium">2.1 GB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tối ưu hóa */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-cyan-600" />
                      Tối ưu hóa
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Clean Temp Tables */}
                    <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Trash2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Dọn dẹp bảng tạm</p>
                          <p className="text-xs text-gray-600">Xóa dữ liệu tạm thời</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">3 bảng</span>
                    </button>

                    {/* Optimize Index */}
                    <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Gauge className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Tối ưu Index</p>
                          <p className="text-xs text-gray-600">Cải thiện hiệu suất</p>
                        </div>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">12 index</span>
                    </button>

                    {/* Defragment Data */}
                    <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Layers className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Phân mảnh dữ liệu</p>
                          <p className="text-xs text-gray-600">Tối ưu lưu trữ</p>
                        </div>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">8%</span>
                    </button>

                    {/* Run All Optimization */}
                    <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg">
                      <Zap className="h-5 w-5" />
                      <span className="font-medium">Chạy tất cả tối ưu hóa</span>
                    </button>
                  </div>
                </div>

                {/* Logs & Monitoring */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Terminal className="h-5 w-5 mr-2 text-cyan-600" />
                      Logs & Monitoring
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Slow Queries */}
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <p className="font-medium text-gray-900">Truy vấn chậm</p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">5</span>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        <div className="text-xs bg-white p-2 rounded border border-yellow-100">
                          <p className="font-medium text-gray-900">SELECT * FROM users...</p>
                          <p className="text-gray-500">Thời gian: 2.5s</p>
                        </div>
                        <div className="text-xs bg-white p-2 rounded border border-yellow-100">
                          <p className="font-medium text-gray-900">JOIN messages...</p>
                          <p className="text-gray-500">Thời gian: 1.8s</p>
                        </div>
                      </div>
                      <button className="w-full mt-2 text-xs text-yellow-700 hover:text-yellow-800 font-medium">
                        Xem tất cả →
                      </button>
                    </div>

                    {/* Connection Warnings */}
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <p className="font-medium text-gray-900">Cảnh báo</p>
                        </div>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">2</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs bg-white p-2 rounded border border-red-100">
                          <p className="font-medium text-gray-900">Kết nối chậm</p>
                          <p className="text-gray-500">Latency: 150ms</p>
                        </div>
                        <div className="text-xs bg-white p-2 rounded border border-red-100">
                          <p className="font-medium text-gray-900">Pool gần đầy</p>
                          <p className="text-gray-500">80/100 connections</p>
                        </div>
                      </div>
                    </div>

                    {/* View All Logs */}
                    <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200">
                      <History className="h-4 w-4" />
                      <span className="text-sm font-medium">Xem tất cả logs</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UsersComponent />
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <SecurityComponent />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsComponent />
          )}

          {/* Other tabs */}
          {activeTab !== 'overview' && activeTab !== 'database' && activeTab !== 'rooms' && activeTab !== 'users' && activeTab !== 'security' && activeTab !== 'settings' && (
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

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo phòng họp mới</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên phòng</label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nhập tên phòng..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Mô tả phòng họp..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số người tối đa</label>
                  <input
                    type="number"
                    value={newRoom.maxParticipants}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="2"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRoom.isPrivate}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Phòng riêng tư</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRoom.allowScreenShare}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, allowScreenShare: e.target.checked }))}
                      className="rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Cho phép chia sẻ màn hình</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRoom.allowChat}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, allowChat: e.target.checked }))}
                      className="rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Cho phép chat</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={createRoom}
                  disabled={!newRoom.name.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  Tạo phòng
                </button>
                
                <button
                  onClick={() => setShowCreateRoomModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;