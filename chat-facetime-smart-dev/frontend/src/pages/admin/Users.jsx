import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  UserCheck, 
  UserX, 
  Trash2, 
  Edit, 
  UserPlus,
  Search,
  Filter,
  X,
  Eye,
  Crown,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Form states
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'USER',
    active: true
  });
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'USER',
      active: true
    });
    setShowUserModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName || '',
      role: user.role,
      active: user.active
    });
    setShowUserModal(true);
  };

  const closeModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'USER',
      active: true
    });
    setError('');
    setSuccess('');
  };

  const handleSaveUser = async () => {
    try {
      setError('');
      setSuccess('');
      
      // Validation
      if (!userForm.username.trim()) {
        setError('Username không được để trống');
        return;
      }
      if (!userForm.email.trim()) {
        setError('Email không được để trống');
        return;
      }
      if (!editingUser && !userForm.password.trim()) {
        setError('Password không được để trống');
        return;
      }

      if (editingUser) {
        // Update user
        const updateData = {
          username: userForm.username.trim(),
          email: userForm.email.trim(),
          fullName: userForm.fullName.trim(),
          role: userForm.role,
          active: userForm.active
        };
        if (userForm.password.trim()) {
          updateData.password = userForm.password;
        }
        await api.put(`/api/admin/users/${editingUser.id}`, updateData);
        setSuccess('Cập nhật người dùng thành công');
      } else {
        // Create user
        await api.post('/api/admin/users', userForm);
        setSuccess('Tạo người dùng thành công');
      }
      
      await fetchUsers();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.error || 'Có lỗi xảy ra khi lưu người dùng');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      setError('');
      await api.put(`/api/admin/users/${userId}/toggle-status`);
      setSuccess('Cập nhật trạng thái thành công');
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Lỗi khi cập nhật trạng thái');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        setError('');
        await api.delete(`/api/admin/users/${userId}`);
        setSuccess('Xóa người dùng thành công');
        await fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Lỗi khi xóa người dùng');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setError('');
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setSuccess('Cập nhật quyền thành công');
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Lỗi khi cập nhật quyền');
      setTimeout(() => setError(''), 3000);
    }
  };

  const viewUserDetail = async (userId) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      setViewingUser(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      setError('Lỗi khi lấy thông tin người dùng');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.active) ||
                         (filterStatus === 'inactive' && !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    user: users.filter(u => u.role === 'USER').length
  };

  if (loading) {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
              <p className="text-gray-600">Quản lý tất cả tài khoản người dùng trong hệ thống</p>
            </div>
            <button
              onClick={openCreateModal}
              className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl hover:from-primaryHover hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <UserPlus className="h-5 w-5" />
              <span>Thêm người dùng</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <User className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tạm khóa</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <UserX className="h-8 w-8 text-red-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admin</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.admin}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.user}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
              
              <button
                onClick={fetchUsers}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Làm mới</span>
              </button>
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

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-hero-gradient">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">
                              {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName || user.username}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.role === 'ADMIN' ? (
                          <Crown className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          user.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.active ? (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewUserDetail(user.id)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-primary hover:text-primaryHover p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
              <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              {users.length === 0 && (
                <button
                  onClick={openCreateModal}
                  className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl hover:from-primaryHover hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  Thêm người dùng đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {(error || success) && (
                <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                  error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  {error ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  <span>{error || success}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Nhập username..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Nhập email..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Nhập họ và tên..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!editingUser && <span className="text-red-500">*</span>}
                    {editingUser && <span className="text-gray-500 text-xs">(Để trống nếu không đổi)</span>}
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder={editingUser ? "Nhập mật khẩu mới (tùy chọn)..." : "Nhập mật khẩu..."}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò
                    </label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={userForm.active}
                          onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })}
                          className="rounded mr-2"
                        />
                        <span className="text-sm text-gray-700">Hoạt động</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white py-3 px-4 rounded-lg hover:from-primaryHover hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                >
                  {editingUser ? 'Cập nhật' : 'Tạo mới'}
                </button>
                
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chi tiết người dùng</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setViewingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {(viewingUser.fullName || viewingUser.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{viewingUser.fullName || viewingUser.username}</h3>
                    <p className="text-gray-600">@{viewingUser.username}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {viewingUser.role === 'ADMIN' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Shield className="h-3 w-3 mr-1" />
                          User
                        </span>
                      )}
                      {viewingUser.active ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <UserX className="h-3 w-3 mr-1" />
                          Tạm khóa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{viewingUser.email}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                    <p className="font-medium text-gray-900">{viewingUser.fullName || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
                    <p className="font-medium text-gray-900">{formatDate(viewingUser.createdAt)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Cập nhật lần cuối</p>
                    <p className="font-medium text-gray-900">{formatDate(viewingUser.updatedAt)}</p>
                  </div>
                  
                  {viewingUser.lastLogin && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Đăng nhập lần cuối</p>
                      <p className="font-medium text-gray-900">{formatDate(viewingUser.lastLogin)}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditModal(viewingUser);
                    }}
                    className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white py-2 px-4 rounded-lg hover:from-primaryHover hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    Chỉnh sửa
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setViewingUser(null);
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Users;
