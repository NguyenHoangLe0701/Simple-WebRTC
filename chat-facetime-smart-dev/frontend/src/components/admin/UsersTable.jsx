import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Crown,
  MoreVertical,
  Eye,
  EyeOff,
  Settings,
  MessageCircle,
  Video,
  Code
} from 'lucide-react';

const UsersTable = ({ users = [], loading = false, onToggleStatus, onDeleteUser, onUpdateRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showActions, setShowActions] = useState(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
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

  const getRoleIcon = (role) => {
    return role === 'ADMIN' ? Crown : Shield;
  };

  const getRoleColor = (role) => {
    return role === 'ADMIN' 
      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quản lý người dùng</h3>
            <p className="text-sm text-gray-600">Tổng {filteredUsers.length} người dùng</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg">
              <UserPlus className="h-4 w-4" />
              <span>Thêm người dùng</span>
            </button>
            
            {selectedUsers.length > 0 && (
              <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Xóa ({selectedUsers.length})</span>
              </button>
            )}
            
            <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mt-4 flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex space-x-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm khóa</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="username-asc">Tên A-Z</option>
              <option value="username-desc">Tên Z-A</option>
              <option value="lastLogin-desc">Đăng nhập gần nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hoạt động
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {user.fullName?.charAt(0) || user.username.charAt(0)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          user.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {user.fullName || user.username}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${getRoleColor(user.role)}`}>
                        <RoleIcon className="h-4 w-4" />
                      </div>
                      <select
                        value={user.role}
                        onChange={(e) => onUpdateRole(user.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3 mr-1" />
                          Tạm khóa
                        </>
                      )}
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MessageCircle className="h-3 w-3" />
                        <span>24</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Video className="h-3 w-3" />
                        <span>5</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Code className="h-3 w-3" />
                        <span>12</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {showActions === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="py-2">
                              <button className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <Eye className="h-4 w-4" />
                                <span>Xem chi tiết</span>
                              </button>
                              <button className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <Mail className="h-4 w-4" />
                                <span>Gửi email</span>
                              </button>
                              <button className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <Settings className="h-4 w-4" />
                                <span>Cài đặt</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
          <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
