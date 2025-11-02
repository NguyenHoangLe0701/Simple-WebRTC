import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socket';

const WaitingRoom = ({ onApproved, currentUser }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [waitingMessage, setWaitingMessage] = useState('Đang chờ chủ phòng duyệt...');
  const [isOwner, setIsOwner] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    // Kiểm tra xem user có phải là người đầu tiên vào phòng không (chủ phòng)
    const isFirstUser = !localStorage.getItem(`room_${roomId}_owner`);
    if (isFirstUser) {
      localStorage.setItem(`room_${roomId}_owner`, currentUser?.id || currentUser?.username || 'owner');
      setIsOwner(true);
    } else {
      // Nếu không phải chủ phòng, gửi yêu cầu tham gia
      const username = currentUser?.fullName || currentUser?.username || 'User';
      socketService.sendSignal(roomId, {
        type: 'join-request',
        userId: currentUser?.id || currentUser?.username || username,
        username: username
      });
    }

    // Lắng nghe phản hồi từ chủ phòng
    const signalSub = socketService.subscribeToSignaling(roomId, (frame) => {
      try {
        const data = JSON.parse(frame.body);
        
        if (data?.type === 'join-request' && isOwner) {
          // Chủ phòng nhận yêu cầu tham gia
          setPendingUsers(prev => {
            const exists = prev.find(r => r.userId === data.userId);
            return exists ? prev : [...prev, { userId: data.userId, username: data.username }];
          });
        }
        
        if (data?.type === 'admit' && data.userId === (currentUser?.id || currentUser?.username)) {
          // Được chủ phòng duyệt
          onApproved();
        }
        
        if (data?.type === 'deny' && data.userId === (currentUser?.id || currentUser?.username)) {
          // Bị từ chối
          setWaitingMessage('Bạn đã bị từ chối tham gia phòng này.');
          setTimeout(() => navigate('/chat'), 2000);
        }
      } catch (error) {
        console.error('Error processing signal:', error);
      }
    });

    return () => {
      if (signalSub) socketService.unsubscribe(`/topic/room/${roomId}`);
    };
  }, [roomId, currentUser, isOwner, onApproved, navigate]);

  const approveUser = (userId) => {
    socketService.sendSignal(roomId, { type: 'admit', userId });
    setPendingUsers(prev => prev.filter(p => p.userId !== userId));
  };

  const denyUser = (userId) => {
    socketService.sendSignal(roomId, { type: 'deny', userId });
    setPendingUsers(prev => prev.filter(p => p.userId !== userId));
  };

  if (isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏠</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Phòng {roomId}</h2>
            <p className="text-sm text-gray-600">Bạn là chủ phòng</p>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">⏳</span>
              </div>
              <p className="text-gray-600">Chưa có yêu cầu tham gia nào</p>
              <p className="text-xs text-gray-500 mt-2">Chia sẻ mã phòng: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span></p>
            </div>
          ) : (
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Yêu cầu tham gia ({pendingUsers.length})</h3>
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.username}</p>
                        <p className="text-xs text-gray-500">muốn tham gia phòng</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveUser(user.userId)}
                        className="px-3 py-1 text-xs rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        onClick={() => denyUser(user.userId)}
                        className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => navigate('/chat')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⏳</span>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Phòng {roomId}</h2>
        <p className="text-gray-600 mb-6">{waitingMessage}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Đang chờ phản hồi từ chủ phòng...</span>
          </div>
          
          <button
            onClick={() => navigate('/chat')}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy và quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
