import React from 'react';
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  Video, 
  Code, 
  Settings,
  Crown,
  LogOut,
  Home,
  Database,
  Shield,
  Activity,
  Bell,
  User,
  X
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Admin Panel</h1>
              <p className="text-blue-100 text-sm">Smart Chat System</p>
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
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
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
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
          </div>
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
    </>
  );
};

export default AdminSidebar;
