import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Search, Plus, Hash, Lock, Users, Video, Phone } from 'lucide-react';

const Sidebar = ({ currentUser, roomId, sidebarQuery, setSidebarQuery , onlineUsers = [] }) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const createNewRoom = async () => {
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    navigate(`/chat/${id}`);
    try {
      const inviteUrl = `${window.location.origin}/chat/${id}`;
      await navigator.clipboard.writeText(inviteUrl);
      alert(`Đã tạo phòng mới: ${id}\nLink đã copy vào clipboard!`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert(`Đã tạo phòng mới: ${id}`);
    }
  };

  const publicRooms = [
    { id: 'general', name: 'general', description: 'Thảo luận chung', icon: '💬' },
    { id: 'team', name: 'team', description: 'Làm việc nhóm', icon: '👥' },
    { id: 'random', name: 'random', description: 'Trò chuyện ngẫu nhiên', icon: '🎲' },
    { id: 'webrtc', name: 'webrtc', description: 'Video call & Screen share', icon: '📹' },
    { id: 'support', name: 'support', description: 'Hỗ trợ kỹ thuật', icon: '🛠️' }
  ];

  const privateRooms = Object.keys(localStorage)
    .filter(k => k.startsWith('room_') && k.endsWith('_owner'))
    .map(key => key.replace('room_', '').replace('_owner', ''));

  return (
    <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-xl">
      {/* Current user card */}
      <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{currentUser?.fullName || currentUser?.username || 'User'}</h3>
              <p className="text-xs text-gray-500">{currentUser?.email || 'user@example.com'}</p>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cài đặt"
            >
              <Settings className="h-5 w-5 text-gray-500" />
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng, người dùng..."
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 text-sm"
          />
        </div>
      </div>

      {/* Room Groups */}
      <div className="flex-1 overflow-y-auto">
        {/* Public Rooms */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phòng công khai</h2>
            <button
              onClick={createNewRoom}
              className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center space-x-1 shadow-sm"
            >
              <Plus className="h-3 w-3" />
              <span>Tạo phòng</span>
            </button>
          </div>
          <div className="space-y-1">
            {publicRooms.filter(room => 
              room.name.includes(sidebarQuery.toLowerCase()) || 
              room.description.toLowerCase().includes(sidebarQuery.toLowerCase())
            ).map((room) => (
              <div 
                key={room.id} 
                onClick={() => navigate(`/chat/${room.id}`)}
                className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                  room.id === roomId 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-500 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    room.id === roomId 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                  }`}>
                    <span className="text-sm">{room.icon}</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{room.name}</span>
                    <div className="text-xs text-gray-500 mt-0.5">{room.description}</div>
                  </div>
                  {room.id === roomId && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Private Rooms */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phòng riêng tư</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {privateRooms.length}
            </span>
          </div>
          <div className="space-y-1">
            {privateRooms.filter(roomId => 
              roomId.includes(sidebarQuery.toLowerCase())
            ).map((roomId) => (
              <div 
                key={roomId} 
                onClick={() => navigate(`/chat/${roomId}`)}
                className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                  roomId === roomId 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-l-4 border-purple-500 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    roomId === roomId 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                  }`}>
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{roomId}</span>
                    <div className="text-xs text-gray-500 mt-0.5">Phòng riêng</div>
                  </div>
                  {roomId === roomId && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
            {privateRooms.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🏠</span>
                </div>
                <p className="text-xs">Chưa có phòng riêng nào</p>
                <p className="text-xs mt-1">Tạo phòng để bắt đầu!</p>
              </div>
            )}
          </div>
        </div>

        {/* Online Users */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đang trực tuyến</h2>
            <span className="text-xs text-gray-400 bg-green-100 text-green-600 px-2 py-1 rounded-full">
              {onlineUsers.length}
            </span>
          </div>
          <div className="space-y-2">
            {onlineUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center space-x-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">
                    {user.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    user.status === 'online' ? 'bg-green-400' : 
                    user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                </div>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">Chưa có ai online</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
