import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings,
  User,
  Crown,
  Shield
} from 'lucide-react';
import api from '../services/api';

const ProfessionalWaitingRoom = ({ roomId, currentUser, onApproved, onRejected }) => {
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [previewVideoRef, setPreviewVideoRef] = useState(null);

  useEffect(() => {
    // Kiểm tra xem user có phải chủ phòng không
    const checkHostStatus = async () => {
      try {
        const response = await api.get(`/api/rooms/${roomId}/info`);
        setRoomInfo(response.data);
        setIsHost(response.data.hostId === currentUser.id);
      } catch (error) {
        console.error('Error checking room info:', error);
      }
    };

    checkHostStatus();
    initializePreview();
  }, [roomId, currentUser]);

  const initializePreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (previewVideoRef) {
        previewVideoRef.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media:', error);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.post(`/api/rooms/${roomId}/approve`, { userId });
      setWaitingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await api.post(`/api/rooms/${roomId}/reject`, { userId });
      setWaitingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const joinRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    onApproved();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sảnh chờ phòng họp</h1>
                <p className="text-blue-100">Phòng: {roomId}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{waitingUsers.length + (roomInfo?.participants?.length || 0)} người</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Đang chờ duyệt</span>
                  </div>
                </div>
              </div>
            </div>
            {isHost && (
              <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                <Crown className="h-5 w-5" />
                <span className="font-medium">Chủ phòng</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video relative">
              {localStream ? (
                <video
                  ref={setPreviewVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8" />
                    </div>
                    <p>Đang tải camera...</p>
                  </div>
                </div>
              )}
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full ${
                    micEnabled 
                      ? 'bg-white/20 hover:bg-white/30' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white transition-colors`}
                >
                  {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${
                    videoEnabled 
                      ? 'bg-white/20 hover:bg-white/30' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white transition-colors`}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Room Info */}
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Thông tin phòng</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tên phòng:</span>
                  <span className="font-medium">{roomId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chủ phòng:</span>
                  <span className="font-medium">{roomInfo?.hostName || 'Đang tải...'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số người tham gia:</span>
                  <span className="font-medium">{roomInfo?.participants?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="font-medium text-green-600">Đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>

          {/* Waiting List */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Danh sách chờ duyệt
              </h3>
              
              {waitingUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Không có người chờ duyệt</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {isHost && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            title="Duyệt"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            title="Từ chối"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current User Status */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin của bạn
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {currentUser.fullName?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{currentUser.fullName || currentUser.username}</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span>Microphone:</span>
                    <span className={`font-medium ${micEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {micEnabled ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Camera:</span>
                    <span className={`font-medium ${videoEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {videoEnabled ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isHost ? (
                <button
                  onClick={joinRoom}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  Vào phòng họp
                </button>
              ) : (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Đang chờ chủ phòng duyệt</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Bạn sẽ được thông báo khi được phép vào phòng
                  </p>
                </div>
              )}
              
              <button
                onClick={onRejected}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Rời khỏi sảnh chờ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWaitingRoom;
