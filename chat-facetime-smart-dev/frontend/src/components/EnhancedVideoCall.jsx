import React, { useRef, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Users, Camera, CameraOff } from 'lucide-react';

const EnhancedVideoCall = ({ isActive, onEndCall, roomId, currentUser }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // State cho permission flow
  const [permissionStatus, setPermissionStatus] = useState('pending');
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Modal xin quyền
  const PermissionModal = () => {
    if (!showPermissionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="h-8 w-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cho phép truy cập camera & microphone
          </h3>
          
          <p className="text-gray-600 mb-6">
            Để tham gia cuộc gọi video, vui lòng cho phép truy cập camera và microphone. 
          </p>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowPermissionModal(false);
                setPermissionStatus('denied');
                onEndCall();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            
            <button
              onClick={() => requestMediaPermission()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>Cho phép</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Effect chính
  useEffect(() => {
    if (isActive) {
      initializeCall();
    } else {
      cleanup();
    }
    
    return () => {
      cleanup();
    };
  }, [isActive]);

  // Khởi tạo call
  const initializeCall = async () => {
    try {
      setConnectionStatus('initializing');

      // Lấy media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await initializeSignaling();

    } catch (error) {
      console.error('Failed to initialize call:', error);
      setConnectionStatus('error');
      alert('Không thể khởi động video call');
    }
  };

  // Khởi tạo signaling
  const initializeSignaling = async () => {
    try {
      setConnectionStatus('connecting');

      if (!socketService.isConnected) {
        await socketService.connect();
      }

      await socketService.subscribeToSignaling(roomId, handleSignalingMessage);

      setConnectionStatus('connected');

      // Gửi join signal
      await sendSignal({
        type: 'join',
        targetUserId: null
      });

    } catch (error) {
      console.error('Signaling failed:', error);
      setConnectionStatus('error');
    }
  };

  // Gửi signal
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
        to: signal.targetUserId || 'all',
        data: signal.data || {},
        user: userInfo,
        timestamp: new Date().toISOString()
      };

      await socketService.sendSignal(roomId, signalData);
      return true;

    } catch (error) {
      console.error('Failed to send signal');
      return false;
    }
  };

  // Tạo peer connection - FIX QUAN TRỌNG
  const createPeerConnection = (userId) => {
    if (peerConnections.has(userId)) {
      return peerConnections.get(userId);
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Thêm local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // 🎯 FIX: Xử lý remote stream đúng cách
    pc.ontrack = (event) => {
      console.log('Received remote stream from:', userId);
      
      // Lấy tất cả remote streams
      event.streams.forEach(remoteStream => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, remoteStream);
          return newMap;
        });
      });
    };

    // 🎯 FIX: Giảm ICE candidates spam
    let iceCandidates = [];
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        iceCandidates.push(event.candidate);
        
        // Gửi theo nhóm sau 300ms
        if (iceCandidates.length === 1) {
          setTimeout(() => {
            if (iceCandidates.length > 0) {
              sendSignal({
                type: 'ice-candidate',
                candidates: iceCandidates,
                targetUserId: userId
              });
              iceCandidates = [];
            }
          }, 300);
        }
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        console.log('Peer connected:', userId);
      }
    };

    const newPeerConnections = new Map(peerConnections);
    newPeerConnections.set(userId, pc);
    setPeerConnections(newPeerConnections);

    return pc;
  };

  // Tạo và gửi answer
  const createAndSendAnswer = async (pc, userId) => {
    try {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      await sendSignal({
        type: 'answer',
        answer: answer,
        targetUserId: userId
      });
      
    } catch (error) {
      console.error('Error creating answer');
    }
  };

  // Xử lý signaling messages - FIX: Giảm log
  const handleSignalingMessage = async (data) => {
    try {
      const currentUserId = currentUser?.id || currentUser?.username;
      const senderId = data.user?.id;

      // Bỏ qua signal từ chính mình (không log)
      if (senderId === currentUserId) return;

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
      console.error('Error handling signal');
    }
  };

  // Xử lý user join
  const handleUserJoin = async (user) => {
    const userId = user.id;

    // Thêm vào participants
    setParticipants(prev => {
      if (prev.find(p => p.id === userId)) return prev;
      return [...prev, user];
    });

    // Tạo peer connection và offer
    const pc = createPeerConnection(userId);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendSignal({
        type: 'offer',
        offer: offer,
        targetUserId: userId
      });

    } catch (error) {
      console.error('Failed to create offer');
    }
  };

  // Xử lý offer
  const handleOffer = async (data) => {
    const userId = data.user?.id;

    let pc = peerConnections.get(userId);
    if (!pc) {
      pc = createPeerConnection(userId);
    }

    try {
      await pc.setRemoteDescription(data.offer);
      await createAndSendAnswer(pc, userId);

    } catch (error) {
      console.error('Failed to handle offer');
    }
  };

  // Xử lý answer
  const handleAnswer = async (data) => {
    const userId = data.user?.id;

    const pc = peerConnections.get(userId);
    if (pc) {
      try {
        await pc.setRemoteDescription(data.answer);
      } catch (error) {
        console.error('Failed to set remote description');
      }
    }
  };

  // Xử lý ICE candidate - FIX: Xử lý nhiều candidates
  const handleIceCandidate = async (data) => {
    const userId = data.user?.id;
    
    const pc = peerConnections.get(userId);
    if (pc) {
      try {
        if (data.candidates) {
          for (const candidate of data.candidates) {
            await pc.addIceCandidate(candidate);
          }
        } else if (data.candidate) {
          await pc.addIceCandidate(data.candidate);
        }
      } catch (error) {
        // Bỏ qua lỗi ICE candidate
      }
    }
  };

  // Xử lý user leave
  const handleUserLeave = (user) => {
    const userId = user.id;

    // Remove from participants
    setParticipants(prev => prev.filter(p => p.id !== userId));

    // Close peer connection
    const pc = peerConnections.get(userId);
    if (pc) {
      pc.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }

    // Remove remote stream
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  };

  // Hàm xin quyền
  const requestMediaPermission = async () => {
    try {
      setPermissionStatus('requesting');
      setShowPermissionModal(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setPermissionStatus('granted');
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      await initializeSignaling();
      
    } catch (error) {
      setPermissionStatus('denied');
      alert('Không thể truy cập camera/microphone');
    }
  };

  // Kiểm tra permissions hiện có
  const checkExistingPermissions = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCameraPermission = devices.some(device => 
        device.kind === 'videoinput' && device.deviceId !== ''
      );
      const hasMicPermission = devices.some(device => 
        device.kind === 'audioinput' && device.deviceId !== ''
      );
      
      if (hasCameraPermission && hasMicPermission) {
        await requestMediaPermission();
      } else {
        setShowPermissionModal(true);
      }
      
    } catch (error) {
      setShowPermissionModal(true);
    }
  };

  // Cleanup
  const cleanup = () => {
    if (connectionStatus === 'disconnected') return;

    setConnectionStatus('disconnected');
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close peer connections
    peerConnections.forEach((pc, userId) => {
      pc.close();
    });
    setPeerConnections(new Map());
    setRemoteStreams(new Map());
    setParticipants([]);
    
    // Send leave signal
    if (socketService.isConnected && roomId) {
      sendSignal({
        type: 'leave',
        targetUserId: null
      });
    }
  };

  // Controls (giữ nguyên)
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

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        
        // Replace video tracks
        peerConnections.forEach((pc, userId) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setLocalStream(screenStream);
        setIsScreenSharing(true);

        videoTrack.onended = () => {
          toggleScreenShare();
        };

      } else {
        // Stop screen share and restore camera
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }

        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });

        const newVideoTrack = cameraStream.getVideoTracks()[0];
        
        // Restore video tracks
        peerConnections.forEach((pc, userId) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender && newVideoTrack) {
            sender.replaceTrack(newVideoTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }

        setLocalStream(cameraStream);
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen share error');
    }
  };

  // Helper functions
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'initializing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Đã kết nối';
      case 'connecting': return 'Đang kết nối...';
      case 'initializing': return 'Đang khởi tạo...';
      case 'error': return 'Lỗi kết nối';
      default: return 'Ngắt kết nối';
    }
  };
  
  const participantCount = participants.length + 1;

  // Render logic
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
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center">
          <CameraOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Không thể truy cập camera/micro</h3>
          <p className="text-gray-400 mb-6">
            Bạn cần cấp quyền camera và microphone để tham gia cuộc gọi video.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setPermissionStatus('pending');
                setShowPermissionModal(true);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={onEndCall}
              className="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Thoát
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main video call UI
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Video Call - {roomId}</h2>
            <p className="text-sm text-gray-300">
              {participantCount} người tham gia
              <span className={`ml-2 ${getConnectionStatusColor()}`}>
                • {getConnectionStatusText()}
              </span>
            </p>
          </div>
        </div>
        
        <button
          onClick={onEndCall}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
        >
          <PhoneOff className="h-5 w-5" />
          <span>Kết thúc</span>
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 relative bg-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local Video */}
          <div className="relative bg-gray-700 rounded-lg overflow-hidden border-2 border-blue-400">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
              {currentUser?.fullName || currentUser?.username || 'Bạn'}
              {isScreenSharing && ' (Đang chia sẻ màn hình)'}
            </div>
            {isMuted && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                🔇 Muted
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
            const participant = participants.find(p => p.id === userId);
            return (
              <div key={userId} className="relative bg-gray-700 rounded-lg overflow-hidden border-2 border-green-400">
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
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                  {participant?.fullName || participant?.username || 'Người tham gia'}
                </div>
                <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            );
          })}

          {/* Placeholder cho participants chưa có stream */}
          {participants.filter(p => !remoteStreams.has(p.id)).map(participant => (
            <div key={participant.id} className="relative bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-500 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-8 w-8" />
                </div>
                <p className="font-medium">{participant.fullName || participant.username}</p>
                <p className="text-sm text-gray-300">Đang kết nối...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted 
                ? 'bg-red-500 text-white shadow-lg transform scale-110' 
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
                ? 'bg-red-500 text-white shadow-lg transform scale-110' 
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
                ? 'bg-blue-500 text-white shadow-lg transform scale-110' 
                : 'bg-gray-600 text-white hover:bg-gray-500 hover:shadow-md'
            }`}
            title={isScreenSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}
          >
            <Monitor className="h-6 w-6" />
          </button>

          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all hover:shadow-lg hover:transform hover:scale-110"
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoCall;