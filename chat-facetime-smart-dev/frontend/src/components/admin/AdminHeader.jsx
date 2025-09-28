import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  Crown, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Database,
  Activity,
  Zap
} from 'lucide-react';

const AdminHeader = ({ setSidebarOpen, notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const notificationTypes = {
    success: { color: 'text-green-600', bg: 'bg-green-100', icon: '✓' },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠' },
    error: { color: 'text-red-600', bg: 'bg-red-100', icon: '✕' },
    info: { color: 'text-blue-600', bg: 'bg-blue-100', icon: 'ℹ' }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600">Quản lý hệ thống thông minh</p>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng, tin nhắn, hoạt động..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Hoạt động realtime
                </div>
              </button>
              
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative group">
                <Database className="h-5 w-5" />
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Trạng thái database
                </div>
              </button>
              
              <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors relative group">
                <Zap className="h-5 w-5" />
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Hiệu suất hệ thống
                </div>
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative transition-colors"
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              notificationTypes[notification.type]?.bg || 'bg-gray-100'
                            }`}>
                              <span className={`text-sm font-bold ${
                                notificationTypes[notification.type]?.color || 'text-gray-600'
                              }`}>
                                {notificationTypes[notification.type]?.icon || 'ℹ'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Không có thông báo mới</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700">
                        Xem tất cả thông báo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">Administrator</p>
                  <p className="text-xs text-gray-500">admin@smartchat.com</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Administrator</p>
                        <p className="text-sm text-gray-600">admin@smartchat.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4" />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="h-4 w-4" />
                      <span>Cài đặt</span>
                    </button>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <span>{darkMode ? 'Sáng' : 'Tối'}</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 py-2">
                    <button 
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/';
                      }}
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

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default AdminHeader;
