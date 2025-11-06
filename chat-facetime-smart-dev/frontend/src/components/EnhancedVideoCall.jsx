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
  const [isReadyForSignaling, setIsReadyForSignaling] = useState(false);
  
  // State cho permission flow
  const [permissionStatus, setPermissionStatus] = useState('pending');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [requestedMedia, setRequestedMedia] = useState({ video: false, audio: false });
  const [isInitialized, setIsInitialized] = useState(false);

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
            Bạn có thể thay đổi quyền này sau trong cài đặt trình duyệt.
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
              onClick={() => requestMediaPermission({ video: true, audio: true })}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>Cho phép</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Hoặc chọn thiết bị cụ thể:</p>
            <div className="flex space-x-2">
              <button
                onClick={() => requestMediaPermission({ video: true, audio: false })}
                className="flex-1 px-3 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                Chỉ Camera
              </button>
              <button
                onClick={() => requestMediaPermission({ video: false, audio: true })}
                className="flex-1 px-3 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                Chỉ Micro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Effect chính
  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    let mounted = true;
    
    const initialize = async () => {
      try {
        if (mounted && permissionStatus === 'pending' && !isInitialized) {
          await checkExistingPermissions();
        }
      } catch (error) {
        console.error('❌ Initialization error:', error);
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (!isActive) {
        cleanup();
      }
    };
  }, [isActive]);

  // Hàm xin quyền
  const requestMediaPermission = async (constraints = { video: true, audio: true }) => {
    try {
      setPermissionStatus('requesting');
      setShowPermissionModal(false);
      setRequestedMedia(constraints);
      
      console.log('🎥 Requesting media with constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Media permission granted');
      setPermissionStatus('granted');
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      await initializeSignaling();
      
    } catch (error) {
      console.error('❌ Media permission denied:', error);
      setPermissionStatus('denied');
      
      let errorMessage = 'Không thể truy cập thiết bị. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Bạn đã từ chối cấp quyền. Vui lòng refresh trang và đồng ý cấp quyền.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Không tìm thấy camera/microphone.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  // Kiểm tra permissions hiện có
  const checkExistingPermissions = async () => {
    if (isInitialized) {
      console.log('⏩ Skip permission check - already initialized');
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCameraPermission = devices.some(device => 
        device.kind === 'videoinput' && device.deviceId !== ''
      );
      const hasMicPermission = devices.some(device => 
        device.kind === 'audioinput' && device.deviceId !== ''
      );
      
      if (hasCameraPermission && hasMicPermission) {
        console.log('✅ Already have media permissions');
        await requestMediaPermission({ video: true, audio: true });
      } else {
        console.log('🟡 Showing permission modal');
        setShowPermissionModal(true);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.warn('⚠️ Cannot check existing permissions:', error);
      setShowPermissionModal(true);
      setIsInitialized(true);
    }
  };

  // Khởi tạo signaling
  const initializeSignaling = async () => {
    if (!isActive || !roomId || !localStream) {
      console.log('⏩ Skip signaling - not ready');
      return;
    }

    try {
      console.log('🎯 Initializing WebRTC signaling...');
      setConnectionStatus('connecting');
      
      if (!socketService.isConnected) {
        console.log('🔄 Connecting to socket...');
        await socketService.connect();
      }

      const signalSub = await socketService.subscribeToSignaling(roomId, (messageData) => {
        console.log('📨 Signaling message received:', messageData);
        handleSignalingMessage(messageData);
      });
      
      if (signalSub) {
        setConnectionStatus('connected');
        setIsReadyForSignaling(true);
        console.log('✅ WebRTC signaling initialized');
        
        await sendSignal({
          type: 'join',
          targetUserId: null
        });
      }

    } catch (error) {
      console.error('❌ WebRTC signaling initialization error:', error);
      setConnectionStatus('error');
    }
  };

  // Hàm gửi signal
  const sendSignal = async (signal, retryCount = 0) => {
    try {
      if (!socketService.isConnected || !roomId) {
        console.warn('⏩ Skip sending signal - not connected or no roomId');
        return false;
      }

      console.log('📤 Sending signal:', signal.type, 'to:', signal.targetUserId || 'all');
      
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
      
      console.log('📨 Signal data being sent:', JSON.stringify(signalData, null, 2));
      await socketService.sendSignal(roomId, signalData);
      return true;
    } catch (error) {
      console.error('❌ Error sending signal:', error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying signal (${retryCount + 1}/2)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return sendSignal(signal, retryCount + 1);
      }
      
      return false;
    }
  };

  // Tạo peer connection
  const createPeerConnection = (userId) => {
    console.log('🔄 Creating peer connection for:', userId);
    
    if (peerConnections.has(userId)) {
      console.log('⏩ Peer connection already exists for:', userId);
      return peerConnections.get(userId);
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    });

    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('➕ Adding local track:', track.kind, 'to:', userId);
        pc.addTrack(track, localStream);
      });
    } else {
      console.warn('⚠️ No local stream available when creating PC for:', userId);
    }

    pc.ontrack = (event) => {
      console.log('🎬 Received remote track from:', userId, event.track.kind);
      const [remoteStream] = event.streams;
      
      if (remoteStream) {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, remoteStream);
          return newMap;
        });
        
        if (pc.remoteDescription && !pc.localDescription) {
          console.log('🔄 Auto-creating answer for:', userId);
          createAndSendAnswer(pc, userId);
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to:', userId);
        sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUserId: userId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`🔗 ${userId} connection state:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log('✅ Peer connection established with:', userId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ${userId} ICE state:`, pc.iceConnectionState);
    };

    const newPeerConnections = new Map(peerConnections);
    newPeerConnections.set(userId, pc);
    setPeerConnections(newPeerConnections);
    
    return pc;
  };

  // Hàm tạo và gửi answer
  const createAndSendAnswer = async (pc, userId) => {
    try {
      console.log('📝 Creating answer for:', userId);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      await sendSignal({
        type: 'answer',
        answer: answer,
        targetUserId: userId
      });
      
      console.log('✅ Answer sent to:', userId);
    } catch (error) {
      console.error('❌ Error creating answer for', userId, error);
    }
  };

  // Xử lý signaling message
  const handleSignalingMessage = async (data) => {
    try {
      const currentUserId = currentUser?.id || currentUser?.username;
      const senderId = data.user?.id;
      
      console.log('📨 Processing signal:', data.type, 'from:', senderId);
      
      if (senderId === currentUserId) {
        console.log('⏩ Skipping own signal');
        return;
      }

      switch (data.type) {
        case 'join':
          console.log('👋 User joined call:', senderId);
          await handleUserJoin(data.user);
          break;
          
        case 'leave':
          console.log('👋 User left call:', senderId);
          handleUserLeave(data.user);
          break;
          
        case 'offer':
          console.log('📨 Received offer from:', senderId);
          await handleOffer(data);
          break;
          
        case 'answer':
          console.log('📨 Received answer from:', senderId);
          await handleAnswer(data);
          break;
          
        case 'ice-candidate':
          console.log('🧊 Received ICE candidate from:', senderId);
          await handleIceCandidate(data);
          break;
          
        case 'user-joined':
          console.log('👤 User joined notification:', senderId);
          setParticipants(prev => {
            if (prev.find(p => p.id === senderId)) return prev;
            return [...prev, data.user];
          });
          break;
          
        default:
          console.warn('⚠️ Unknown signal type:', data.type);
      }
    } catch (error) {
      console.error('❌ Error handling signaling message:', error);
    }
  };

  // Xử lý user join
  const handleUserJoin = async (user) => {
    const userId = user.id;
    console.log('👋 Handling user join:', userId);
    
    setParticipants(prev => {
      if (prev.find(p => p.id === userId)) return prev;
      return [...prev, user];
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pc = createPeerConnection(userId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📝 Creating offer for:', userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log('📨 Sending offer to:', userId);
      await sendSignal({
        type: 'offer',
        offer: offer,
        targetUserId: userId
      });
      
    } catch (error) {
      console.error('❌ Error creating offer for', userId, error);
    }
  };

  // Xử lý offer
  const handleOffer = async (data) => {
    const userId = data.user?.id;
    console.log('📨 Handling offer from:', userId);
    
    if (!localStream) {
      console.warn('⚠️ No local stream available, delaying offer handling...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    let pc = peerConnections.get(userId);
    if (!pc) {
      pc = createPeerConnection(userId);
    }
    
    try {
      await pc.setRemoteDescription(data.offer);
      await createAndSendAnswer(pc, userId);
      
    } catch (error) {
      console.error('❌ Error handling offer from', userId, error);
    }
  };

  // Xử lý answer
  const handleAnswer = async (data) => {
    const userId = data.user?.id;
    console.log('📨 Handling answer from:', userId);
    
    const pc = peerConnections.get(userId);
    if (pc) {
      try {
        if (pc.signalingState !== 'stable') {
          console.log('⏳ Waiting for stable signaling state for:', userId);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await pc.setRemoteDescription(data.answer);
        console.log('✅ Remote description set for:', userId);
      } catch (error) {
        console.error('❌ Error handling answer from', userId, error);
      }
    } else {
      console.warn('⚠️ No peer connection found for answer from:', userId);
    }
  };

  // Xử lý ICE candidate
  const handleIceCandidate = async (data) => {
    const userId = data.user?.id;
    console.log('🧊 Handling ICE candidate from:', userId);
    
    const pc = peerConnections.get(userId);
    if (pc && data.candidate) {
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(data.candidate);
          console.log('✅ ICE candidate added for:', userId);
        } else {
          console.log('⏳ Delaying ICE candidate - waiting for remote description...');
          setTimeout(() => {
            if (pc.remoteDescription) {
              pc.addIceCandidate(data.candidate);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Error adding ICE candidate from', userId, error);
      }
    }
  };

  // Xử lý user leave
  const handleUserLeave = (user) => {
    const userId = user.id;
    console.log('👋 User leaving:', userId);
    
    setParticipants(prev => prev.filter(p => p.id !== userId));
    
    const pc = peerConnections.get(userId);
    if (pc) {
      pc.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  };

  // Hàm chia sẻ màn hình
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        console.log('🖥️ Starting screen share...');
        
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'window'
          },
          audio: true
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        
        if (!videoTrack) {
          throw new Error('Không thể lấy video track từ màn hình');
        }
        
        peerConnections.forEach((pc, userId) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(videoTrack);
            console.log('✅ Replaced video track for:', userId);
          }
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setLocalStream(screenStream);
        setIsScreenSharing(true);
        console.log('✅ Screen sharing started');
        
        videoTrack.onended = async () => {
          console.log('🖥️ Screen share ended by user');
          await stopScreenShare();
        };
        
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error('❌ Error sharing screen:', error);
      if (error.name !== 'NotAllowedError') {
        alert('Lỗi khi chia sẻ màn hình: ' + error.message);
      }
    }
  };

  // Hàm dừng chia sẻ màn hình
  const stopScreenShare = async () => {
    try {
      console.log('🖥️ Stopping screen share...');
      
      if (localStream) {
        localStream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      }
      
      const cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const newVideoTrack = cameraStream.getVideoTracks()[0];
      const newAudioTrack = cameraStream.getAudioTracks()[0];
      
      peerConnections.forEach((pc, userId) => {
        const videoSender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (videoSender && newVideoTrack) {
          videoSender.replaceTrack(newVideoTrack);
          console.log('✅ Restored camera video track for:', userId);
        }
        
        const audioSender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'audio'
        );
        if (audioSender && newAudioTrack) {
          audioSender.replaceTrack(newAudioTrack);
          console.log('✅ Restored camera audio track for:', userId);
        }
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream;
      }
      
      setLocalStream(cameraStream);
      setIsScreenSharing(false);
      console.log('✅ Screen sharing stopped, camera restored');
      
    } catch (error) {
      console.error('❌ Error restoring camera:', error);
      
      const emptyStream = new MediaStream();
      setLocalStream(emptyStream);
      setIsScreenSharing(false);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = emptyStream;
      }
      
      alert('Không thể khôi phục camera sau khi chia sẻ màn hình');
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (connectionStatus === 'disconnected') {
      console.log('⏩ Skip cleanup - already cleaned');
      return;
    }

    console.log('🧹 Cleaning up video call...');
    setConnectionStatus('disconnected');
    setIsInitialized(false);
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
          console.log('🛑 Stopped track:', track.kind);
        }
      });
      setLocalStream(null);
    }
    
    // Close peer connections
    peerConnections.forEach((pc, userId) => {
      if (pc.signalingState !== 'closed') {
        pc.close();
        console.log('🔒 Closed peer connection with:', userId);
      }
    });
    
    setPeerConnections(new Map());
    setRemoteStreams(new Map());
    setParticipants([]);
    setIsReadyForSignaling(false);
    
    // Chỉ gửi leave signal nếu thực sự active
    if (socketService.isConnected && roomId && isActive) {
      sendSignal({
        type: 'leave',
        targetUserId: null
      }).catch(error => {
        console.warn('⚠️ Failed to send leave signal:', error);
      });
    }
    
    console.log('✅ Video call cleanup completed');
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
                setIsInitialized(false);
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