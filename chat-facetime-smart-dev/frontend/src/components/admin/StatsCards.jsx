import React from 'react';
import { 
  Users, 
  User, 
  Shield, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  Video,
  Code,
  Database,
  Clock,
  Zap,
  Globe,
  Star,
  Award
} from 'lucide-react';

const StatsCards = ({ stats = {}, loading = false }) => {
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
      description: "Tăng 12% so với tháng trước",
      details: "Người dùng đã đăng ký"
    },
    {
      title: "Người dùng thường",
      value: stats.regularUsers || 0,
      icon: User,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: 8,
      trend: "up",
      description: "Người dùng đang hoạt động",
      details: "Quyền truy cập cơ bản"
    },
    {
      title: "Quản trị viên",
      value: stats.adminUsers || 0,
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: 0,
      trend: "neutral",
      description: "Quyền truy cập cao",
      details: "Quản lý hệ thống"
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
      description: "Phiên đăng nhập",
      details: "Trong 24 giờ qua"
    },
    {
      title: "Tin nhắn",
      value: "5,678",
      icon: MessageCircle,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      change: 15,
      trend: "up",
      description: "Tin nhắn hôm nay",
      details: "Tăng 15% so với hôm qua"
    },
    {
      title: "Video calls",
      value: "89",
      icon: Video,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      change: 23,
      trend: "up",
      description: "Cuộc gọi hôm nay",
      details: "Tăng 23% so với hôm qua"
    },
    {
      title: "Code sessions",
      value: "156",
      icon: Code,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      change: 7,
      trend: "up",
      description: "Phiên code hôm nay",
      details: "Tăng 7% so với hôm qua"
    },
    {
      title: "Hiệu suất",
      value: "99.9%",
      icon: Zap,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: 0.1,
      trend: "up",
      description: "Uptime hệ thống",
      details: "Trong 30 ngày qua"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-24 h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
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
              <p className="text-xs text-gray-500 mb-1">{card.description}</p>
              <p className="text-xs text-gray-400">{card.details}</p>
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
  );
};

export default StatsCards;
