import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Settings } from 'lucide-react';

const RoomManager = ({ roomId }) => {
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  const generateRoomId = () => {
    // Tạo 6 số ngẫu nhiên
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const createNewRoom = async () => {
    const id = generateRoomId();
    
    try {
      const inviteUrl = `${window.location.origin}/chat/${id}`;
      await navigator.clipboard.writeText(inviteUrl);
      alert(`Đã tạo phòng mới: ${id}\nLink đã copy vào clipboard!\nBạn sẽ được chuyển đến phòng này.`);
      navigate(`/chat/${id}`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert(`Đã tạo phòng mới: ${id}\nBạn sẽ được chuyển đến phòng này.`);
      navigate(`/chat/${id}`);
    }
  };

  const copyCurrentRoomLink = async () => {
    try {
      const inviteUrl = `${window.location.origin}/chat/${roomId}`;
      await navigator.clipboard.writeText(inviteUrl);
      alert(`Đã copy link phòng hiện tại: ${roomId}`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert(`Link phòng hiện tại: ${roomId}`);
    }
  };

  const joinRoom = () => {
    const target = joinRoomInput.trim();
    if (target) {
      navigate(`/chat/${target}`);
      setJoinRoomInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white"
          title="Mở quản lý phòng"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Quản lý phòng</h3>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          title="Thu gọn"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={createNewRoom}
            className="flex-1 px-3 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center space-x-1 shadow-sm"
          >
            <span>✨</span>
            <span>Tạo phòng mới</span>
          </button>
          <button
            onClick={copyCurrentRoomLink}
            className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
            title="Copy link phòng hiện tại"
          >
            📋
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Tham gia phòng khác</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={joinRoomInput}
            onChange={(e) => setJoinRoomInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Nhập mã phòng..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
          />
          <button
            onClick={joinRoom}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
          >
            Vào
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomManager;
