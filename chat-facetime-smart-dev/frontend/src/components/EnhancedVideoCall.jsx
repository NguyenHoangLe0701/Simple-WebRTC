import React, { useRef, useEffect, useState } from 'react';
import socketService from '../services/socket';
import webrtcService from '../services/webrtc.service';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Users, Camera, CameraOff } from 'lucide-react';

const EnhancedVideoCall = ({ isActive, onEndCall, roomId, currentUser }) => {
  const localVideoRef = useRef(null);
  const cleanupInProgress = useRef(false); // 🆕 THÊM cleanup flag
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // 🆕 THÊM STATE cho connection retry
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);
  const maxRetries = 3;
  
  // State cho permission flow
  const [permissionStatus, setPermissionStatus] = useState('pending');
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Kiểm tra WebRTC support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Trình duyệt không hỗ trợ WebRTC. Vui lòng dùng Chrome, Firefox hoặc Safari mới nhất.');
      onEndCall();
    }
  }, []);

  // Effect chính
  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    // Tự động request media khi component active
    if (permissionStatus === 'pending') {
      setShowPermissionModal(true);
    }

    return () => {
      if (!isActive) {
        cleanup();
      }
    };
  }, [isActive]);

  // 🆕 SỬA: Setup WebRTC service event handlers với dependency đúng
  useEffect(() => {
    // Setup event handlers cho WebRTC service
    webrtcService.setOnRemoteStream((userId, stream) => {
      console.log('🔄 Updating remote stream for:', userId);
      setRemoteStreams(prev => new Map(prev).set(userId, stream));
    });

    webrtcService.setOnIceCandidate((userId, candidate) => {
      sendSignal({
        type: 'ice-candidate',
        candidate: candidate,
        targetUserId: userId
      });
    });

    webrtcService.setOnConnectionStateChange((userId, state) => {
      console.log(`🔗 Connection state for ${userId}:`, state);
      if (state === 'connected') {
        setConnectionStatus('connected');
      } else if (state === 'failed' || state === 'disconnected') {
        setConnectionStatus('error');
      }
    });

    webrtcService.setOnIceConnectionStateChange((userId, state) => {
      console.log(`❄️ ICE state for ${userId}:`, state);
    });

    return () => {
      // Cleanup event handlers
      webrtcService.setOnRemoteStream(null);
      webrtcService.setOnIceCandidate(null);
      webrtcService.setOnConnectionStateChange(null);
      webrtcService.setOnIceConnectionStateChange(null);
    };
  }, []); // 🆕 SỬA: Empty dependency array

  // 🆕 SỬA: Set local stream cho WebRTC service khi có stream
  useEffect(() => {
    if (localStream) {
      webrtcService.setLocalStream(localStream);
    }
  }, [localStream]);

  // Khởi tạo signaling khi có local stream
  useEffect(() => {
    if (isActive && localStream && roomId) {
      initializeSignaling();
    }
  }, [isActive, localStream, roomId]);

  // 🆕 SỬA: Khởi tạo signaling với retry logic
  const initializeSignaling = async () => {
    if (!isActive || !roomId || !localStream) return;

    try {
      setConnectionStatus('connecting');
      
      // 🆕 SỬA: Kết nối socket với retry
      if (!socketService.isConnected) {
        try {
          await socketService.connect();
        } catch (error) {
          console.warn('First connection attempt failed, retrying...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          await socketService.connect();
        }
      }

      // Subscribe to signaling
      await socketService.subscribeToSignaling(roomId, handleSignalingMessage);
      
      // Subscribe to room events
      await socketService.subscribeToRoomEvents(roomId, {
        onUserJoin: (user) => {
          handleUserJoin(user);
        },
        onUserLeave: (user) => {
          handleUserLeave(user);
        },
        onPresenceUpdate: (presence) => {
          // Cập nhật participants từ presence service
          if (presence.users) {
            setParticipants(presence.users);
          }
        }
      });
      
      setConnectionStatus('connected');
      setConnectionRetryCount(0); // 🆕 RESET retry count khi thành công
      
      // Dùng phương thức mới để join room
      await socketService.joinRoomWithSignaling(roomId, currentUser);
      
    } catch (error) {
      console.error('Signaling error:', error);
      
      // 🆕 THÊM RETRY LOGIC
      if (connectionRetryCount < maxRetries) {
        const nextRetryCount = connectionRetryCount + 1;
        setConnectionRetryCount(nextRetryCount);
        console.log(`🔄 Retrying connection... (${nextRetryCount}/${maxRetries})`);
        
        setTimeout(() => {
          initializeSignaling();
        }, 2000);
      } else {
        setConnectionStatus('error');
      }
    }
  };

  // Hàm xin quyền
  const requestMediaPermission = async (constraints = { video: true, audio: true }) => {
    try {
      setPermissionStatus('requesting');
      setShowPermissionModal(false);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setPermissionStatus('granted');
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
    } catch (error) {
      console.error('Media permission denied:', error);
      setPermissionStatus('denied');
      
      let errorMessage = 'Không thể truy cập camera/microphone. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Bạn đã từ chối cấp quyền.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Không tìm thấy thiết bị.';
      }
      
      alert(errorMessage);
      onEndCall();
    }
  };

  // Hàm gửi signal
  const sendSignal = async (signal) => {
    try {
      if (!socketService.isConnected) return false;

      const userInfo = {
        id: currentUser?.id || currentUser?.username || 'unknown',
        username: currentUser?.username || 'user', 
        fullName: currentUser?.fullName || currentUser?.username || 'User'
      };
      
      const signalData = {
        type: signal.type,
        to: signal.targetUserId || null,
        data: signal.data || {},
        user: userInfo,
        timestamp: new Date().toISOString()
      };
      
      await socketService.sendSignal(roomId, signalData);
      return true;
    } catch (error) {
      console.error('Send signal error:', error);
      return false;
    }
  };

  // 🆕 SỬA: Xử lý signaling message với WebRTC service
  const handleSignalingMessage = async (data) => {
    const currentUserId = currentUser?.id || currentUser?.username;
    const senderId = data.user?.id;
    
    if (senderId === currentUserId) return;

    try {
      switch (data.type) {
        case 'join':
          await handleUserJoin(data.user);
          break;
        case 'offer':
          await handleOffer(data);
          break;
        case 'answer':
          await handleAnswer(data);
          break;
        case 'ice-candidate':
          await handleIceCandidate(data);
          break;
        case 'leave':
          handleUserLeave(data.user);
          break;
      }
    } catch (error) {
      console.error('Handle signal error:', error);
    }
  };

  // 🆕 SỬA: Xử lý user join với WebRTC service
  const handleUserJoin = async (user) => {
    const userId = user.id;
    
    setParticipants(prev => {
      if (prev.find(p => p.id === userId)) return prev;
      return [...prev, user];
    });

    try {
      const offer = await webrtcService.createOffer(userId);
      
      await sendSignal({
        type: 'offer',
        offer: offer,
        targetUserId: userId
      });
    } catch (error) {
      console.error('Create offer error:', error);
    }
  };

  // 🆕 SỬA: Xử lý offer với WebRTC service
  const handleOffer = async (data) => {
    const userId = data.user?.id;
    
    try {
      const answer = await webrtcService.handleOffer(userId, data.offer);
      
      await sendSignal({
        type: 'answer',
        answer: answer,
        targetUserId: userId
      });
    } catch (error) {
      console.error('Handle offer error:', error);
    }
  };

  // 🆕 SỬA: Xử lý answer với WebRTC service
  const handleAnswer = async (data) => {
    const userId = data.user?.id;
    await webrtcService.handleAnswer(userId, data.answer);
  };

  // 🆕 SỬA: Xử lý ICE candidate với WebRTC service
  const handleIceCandidate = async (data) => {
    const userId = data.user?.id;
    await webrtcService.handleIceCandidate(userId, data.candidate);
  };

  // 🆕 SỬA: Xử lý user leave với WebRTC service
  const handleUserLeave = (user) => {
    const userId = user.id;
    
    setParticipants(prev => prev.filter(p => p.id !== userId));
    webrtcService.closePeerConnection(userId);
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  };

  // 🆕 SỬA: Cleanup function với WebRTC service và cleanup flag
  const cleanup = () => {
    if (cleanupInProgress.current) return;
    cleanupInProgress.current = true;
    
    console.log('🧹 Cleaning up video call...');
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Cleanup WebRTC service
    webrtcService.cleanup();
    
    setRemoteStreams(new Map());
    setParticipants([]);
    setConnectionStatus('disconnected');
    setConnectionRetryCount(0); // 🆕 RESET retry count
    
    // Gửi cả leave signal và room leave
    if (socketService.isConnected && roomId && isActive) {
      sendSignal({ type: 'leave' }).catch(() => {});
      socketService.leaveRoom(roomId, currentUser?.username).catch(() => {});
    }
    
    cleanupInProgress.current = false;
  };

  // Các hàm toggle
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!audioTracks[0]?.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!videoTracks[0]?.enabled);
    }
  };

  // 🆕 SỬA: Screen share function đơn giản hóa
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true
        });

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setLocalStream(screenStream);
        webrtcService.setLocalStream(screenStream);
        setIsScreenSharing(true);

        // 🆕 SỬA: Đơn giản hóa - chỉ thay đổi local stream
        const videoTrack = screenStream.getVideoTracks()[0];
        videoTrack.onended = () => {
          toggleScreenShare();
        };
        
      } else {
        // Stop screen share and revert to camera
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }

        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }

        setLocalStream(cameraStream);
        webrtcService.setLocalStream(cameraStream);
        setIsScreenSharing(false);
      }
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        console.error('Screen share error:', error);
        alert('Lỗi khi chia sẻ màn hình');
      }
    }
  };

  // 🆕 SỬA: Helper functions với retry status
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Đã kết nối';
      case 'connecting': 
        if (connectionRetryCount > 0) {
          return `Đang kết nối... (Thử lại ${connectionRetryCount}/${maxRetries})`;
        }
        return 'Đang kết nối...';
      case 'error': return 'Lỗi kết nối';
      default: return 'Ngắt kết nối';
    }
  };

  // Video Grid Component
  const VideoGrid = () => {
    const totalParticipants = participants.length + 1;
    const remoteVideos = Array.from(remoteStreams.entries());
    const waitingParticipants = participants.filter(p => !remoteStreams.has(p.id));

    const getGridConfig = () => {
      if (totalParticipants === 1) return "grid-cols-1 max-w-2xl mx-auto";
      if (totalParticipants === 2) return "grid-cols-2";
      if (totalParticipants <= 4) return "grid-cols-2 lg:grid-cols-2";
      if (totalParticipants <= 6) return "grid-cols-2 lg:grid-cols-3";
      return "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    };

    const getVideoSize = () => {
      if (totalParticipants === 1) return "h-96";
      if (totalParticipants === 2) return "h-80";
      if (totalParticipants <= 4) return "h-64";
      if (totalParticipants <= 6) return "h-48";
      return "h-40";
    };

    return (
      <div className="flex-1 bg-gray-800 p-4 overflow-auto">
        <div className={`grid ${getGridConfig()} gap-3 h-full`}>
          {/* Local Video */}
          <div className={`relative bg-gray-900 rounded-xl overflow-hidden border-2 border-blue-500 ${getVideoSize()}`}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="h-12 w-12 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
              👤 {currentUser?.fullName || 'Bạn'}
              {isScreenSharing && ' 🖥️'}
            </div>
            {isMuted && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                🔇 MUTE
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {remoteVideos.map(([userId, stream]) => {
            const participant = participants.find(p => p.id === userId);
            return (
              <div key={userId} className={`relative bg-gray-900 rounded-xl overflow-hidden border-2 border-green-500 ${getVideoSize()}`}>
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(videoRef) => {
                    if (videoRef && videoRef.srcObject !== stream) {
                      videoRef.srcObject = stream;
                    }
                  }}
                />
                <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
                  👥 {participant?.fullName || 'Người tham gia'}
                </div>
                <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            );
          })}

          {/* Waiting Participants */}
          {waitingParticipants.map(participant => (
            <div key={participant.id} className={`relative bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-600 flex items-center justify-center ${getVideoSize()}`}>
              <div className="text-center text-white p-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-500">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium text-lg mb-1">{participant.fullName || participant.username}</p>
                <div className="flex items-center justify-center space-x-2 text-gray-300">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <p className="text-sm">Đang kết nối...</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Participant Counter */}
        <div className="fixed top-20 right-6 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-gray-600">
          👥 <span className="font-bold">{totalParticipants}</span> người trong phòng
        </div>
      </div>
    );
  };

  // Permission Modal
  const PermissionModal = () => {
    if (!showPermissionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl max-w-md w-full p-8 text-center border border-gray-600">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="h-10 w-10 text-blue-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">
            Cho phép truy cập
          </h3>
          
          <p className="text-gray-300 mb-8 text-lg">
            Để tham gia cuộc gọi video, vui lòng cho phép truy cập camera và microphone.
          </p>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowPermissionModal(false);
                setPermissionStatus('denied');
                onEndCall();
              }}
              className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-all font-medium"
            >
              Hủy
            </button>
            
            <button
              onClick={() => requestMediaPermission({ video: true, audio: true })}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span>Cho phép</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 🆕 SỬA: Render logic với connection state chi tiết
  if (!isActive) return null;

  if (showPermissionModal) {
    return <PermissionModal />;
  }

  if (permissionStatus === 'requesting') {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Đang kết nối...</h3>
          <p className="text-gray-400">Vui lòng cho phép truy cập camera và microphone</p>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center border border-gray-600">
          <CameraOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Không thể truy cập</h3>
          <p className="text-gray-400 mb-6">
            Cần cấp quyền camera và microphone để tham gia cuộc gọi.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setPermissionStatus('pending');
                setShowPermissionModal(true);
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Thử lại
            </button>
            <button
              onClick={onEndCall}
              className="w-full px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Thoát
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🆕 THÊM: Connection retry loading state
  if (connectionStatus === 'connecting' && connectionRetryCount > 0) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Đang kết nối...</h3>
          <p className="text-gray-400 mb-2">Kết nối đến máy chủ video</p>
          <p className="text-yellow-400 text-sm">
            Thử lại {connectionRetryCount}/{maxRetries}
          </p>
        </div>
      </div>
    );
  }

  // Main video call UI
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Video Call</h2>
            <p className="text-gray-300">
              Phòng: <span className="font-mono">{roomId}</span>
              <span className={`ml-3 ${getConnectionStatusColor()}`}>
                • {getConnectionStatusText()}
              </span>
            </p>
          </div>
        </div>
        
        <button
          onClick={onEndCall}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 font-medium"
        >
          <PhoneOff className="h-5 w-5" />
          <span>Kết thúc</span>
        </button>
      </div>

      {/* Video Grid */}
      <VideoGrid />

      {/* Controls */}
      <div className="bg-gray-800 p-6 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted 
                ? 'bg-red-500 text-white shadow-lg scale-110' 
                : 'bg-gray-600 text-white hover:bg-gray-500 hover:shadow-md'
            }`}
            title={isMuted ? "Bật micro" : "Tắt micro"}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              isVideoOff 
                ? 'bg-red-500 text-white shadow-lg scale-110' 
                : 'bg-gray-600 text-white hover:bg-gray-500 hover:shadow-md'
            }`}
            title={isVideoOff ? "Bật camera" : "Tắt camera"}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all ${
              isScreenSharing 
                ? 'bg-blue-500 text-white shadow-lg scale-110' 
                : 'bg-gray-600 text-white hover:bg-gray-500 hover:shadow-md'
            }`}
            title={isScreenSharing ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
          >
            <Monitor className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoCall;