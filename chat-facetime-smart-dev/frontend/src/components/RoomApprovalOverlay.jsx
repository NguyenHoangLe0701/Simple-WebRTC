import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import socketService from '../services/socket';

const RoomApprovalOverlay = ({ 
  roomId, 
  currentUser, 
  isHost, 
  onApproved, 
  onRejected, 
  onClose 
}) => {
  const [waitingRequests, setWaitingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [approvalStatus, setApprovalStatus] = useState(null); // 'pending', 'approved', 'rejected'

  useEffect(() => {
    if (!socketService.isConnected) {
      socketService.connect().catch(console.error);
    }

    // Subscribe to approval events if host
    let approvalSub = null;
    if (isHost) {
      approvalSub = socketService.subscribeToApproval(roomId, (frame) => {
        try {
          const data = JSON.parse(frame.body);
          if (data.type === 'waiting_user_request') {
            setWaitingRequests(prev => {
              // Check if user already exists
              const exists = prev.find(r => r.user.id === data.user.id);
              if (!exists) {
                return [...prev, data];
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Error handling approval event:', error);
        }
      });
    }

    // Subscribe to approval status if not host
    let statusSub = null;
    if (!isHost) {
      statusSub = socketService.subscribeToApprovalStatus(currentUser.id, (frame) => {
        try {
          const data = JSON.parse(frame.body);
          setApprovalStatus(data.status);
          
          if (data.status === 'approved') {
            setTimeout(() => {
              onApproved?.();
            }, 1000);
          } else if (data.status === 'rejected') {
            setTimeout(() => {
              onRejected?.();
            }, 2000);
          }
        } catch (error) {
          console.error('Error handling approval status:', error);
        }
      });
    }

    // Request approval if not host
    if (!isHost && !approvalStatus) {
      socketService.requestApproval(roomId, {
        id: currentUser.id,
        username: currentUser.username,
        fullName: currentUser.fullName,
        email: currentUser.email
      });
      setApprovalStatus('pending');
    }

    return () => {
      if (approvalSub) socketService.unsubscribe(`/topic/room/${roomId}/approval`);
      if (statusSub) socketService.unsubscribe(`/user/${currentUser.id}/queue/approval-status`);
    };
  }, [roomId, currentUser, isHost]);

  const handleApprove = (request) => {
    socketService.approveUser(roomId, request.user.id, currentUser.id, {
      username: request.user.username,
      fullName: request.user.fullName
    });
    
    setWaitingRequests(prev => prev.filter(r => r.user.id !== request.user.id));
  };

  const handleReject = (request) => {
    socketService.rejectUser(roomId, request.user.id, currentUser.id);
    setWaitingRequests(prev => prev.filter(r => r.user.id !== request.user.id));
  };

  // If user is waiting (not host)
  if (!isHost && approvalStatus === 'pending') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold">Lời mời kết bạn</h2>
            <p className="text-blue-100 mt-1">Phòng: {roomId}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-center flex-col py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đang chờ duyệt</h3>
              <p className="text-gray-600 text-center">
                Yêu cầu tham gia phòng của bạn đang được chủ phòng xem xét.
                <br />
                Bạn sẽ được thông báo khi có kết quả.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5 animate-pulse" />
                <span className="font-medium">Đang chờ...</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Hủy yêu cầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is rejected
  if (!isHost && approvalStatus === 'rejected') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold">Yêu cầu bị từ chối</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center flex-col py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Yêu cầu bị từ chối</h3>
              <p className="text-gray-600 text-center">
                Chủ phòng đã từ chối yêu cầu tham gia phòng của bạn.
              </p>
            </div>
            <button
              onClick={onRejected}
              className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Host view - show waiting requests
  if (isHost) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold">Lời mời kết bạn</h2>
            <p className="text-blue-100 mt-1">Phòng: {roomId}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'received'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Đã nhận
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Đã gửi
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'received' && (
              <div className="space-y-4">
                {waitingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Không có yêu cầu nào</p>
                  </div>
                ) : (
                  waitingRequests.map((request) => (
                    <div
                      key={request.user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                          {(request.user.fullName || request.user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {request.user.fullName || request.user.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{request.user.username || request.user.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          title="Chấp nhận"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Từ chối"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'sent' && (
              <div className="text-center py-8 text-gray-500">
                <p>Bạn chưa gửi yêu cầu nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RoomApprovalOverlay;

