import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  Video, 
  Phone,
  Settings,
  Crown,
  Shield,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Activity,
  Monitor,
  MessageCircle,
  Eye
} from 'lucide-react';
import api from '../services/api';

const ProfessionalRoomsPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxParticipants: 50,
    allowScreenShare: true,
    allowChat: true
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    
    if (!user.id) {
      navigate('/login');
      return;
    }
    
    fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
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
      setShowCreateModal(false);
      setNewRoom({
        name: '',
        description: '',
        isPrivate: false,
        maxParticipants: 50,
        allowScreenShare: true,
        allowChat: true
      });
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const joinRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'my':
        return matchesSearch && room.hostId === currentUser.id;
      case 'active':
        return matchesSearch && room.isActive;
      case 'private':
        return matchesSearch && room.isPrivate;
      default:
        return matchesSearch;
    }
  });

  const getRoomStatus = (room) => {
    if (room.isLocked) return { text: 'Đã khóa', color: 'text-red-600', bg: 'bg-red-100' };
    if (room.participants?.length >= room.maxParticipants) return { text: 'Đầy', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (room.isActive) return { text: 'Hoạt động', color: 'text-green-600', bg: 'bg-green-100' };
    return { text: 'Chờ', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return date.toLocaleDateString();
  };

  const getStats = () => {
    const totalRooms = rooms.length;
    const myRooms = rooms.filter(room => room.hostId === currentUser.id).length;
    const activeRooms = rooms.filter(room => room.isActive).length;
    const totalParticipants = rooms.reduce((sum, room) => sum + (room.participants?.length || 0), 0);
    
    return { totalRooms, myRooms, activeRooms, totalParticipants };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Phòng họp trực tuyến</h1>
                <p className="text-gray-600">Kết nối và cộng tác với mọi người</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{currentUser?.fullName || currentUser?.username}</span>
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Tạo phòng mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng phòng</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalRooms}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Phòng của tôi</p>
                <p className="text-2xl font-bold text-gray-800">{stats.myRooms}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeRooms}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người tham gia</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalParticipants}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng họp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('my')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'my' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Của tôi
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đang hoạt động
              </button>
              <button
                onClick={() => setFilter('private')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'private' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const status = getRoomStatus(room);
              const isHost = room.hostId === currentUser.id;
              
              return (
                <div key={room.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group">
                  {/* Room Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{room.name}</h3>
                          <p className="text-blue-100 text-sm">{room.description}</p>
                        </div>
                      </div>
                      
                      {isHost && (
                        <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-lg">
                          <Crown className="h-4 w-4" />
                          <span className="text-sm font-medium">Chủ phòng</span>
                        </div>
                      )}
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
                        <span className="font-medium">{formatTime(room.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cài đặt:</span>
                        <div className="flex items-center space-x-1">
                          {room.allowScreenShare && <Monitor className="h-4 w-4 text-green-500" />}
                          {room.allowChat && <MessageCircle className="h-4 w-4 text-green-500" />}
                          {room.isPrivate && <Lock className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => joinRoom(room.id)}
                        disabled={room.isLocked || (room.participants?.length >= room.maxParticipants)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                      >
                        {room.isLocked ? 'Đã khóa' : 'Tham gia'}
                      </button>
                      
                      <button
                        onClick={() => joinRoom(room.id)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
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
            <p className="text-gray-600 mb-4">Hãy tạo phòng họp đầu tiên của bạn</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Tạo phòng mới
            </button>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tên phòng..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      value={newRoom.description}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Tạo phòng
                  </button>
                  
                  <button
                    onClick={() => setShowCreateModal(false)}
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
    </div>
  );
};

export default ProfessionalRoomsPage;
