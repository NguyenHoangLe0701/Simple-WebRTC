import React, { useRef, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Share2, Users } from 'lucide-react';

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

 
  // 🆕 SỬA HÀM sendSignal TRONG EnhancedVideoCall.jsx
  const sendSignal = async (signal, retryCount = 0) => {
    try {
      console.log('📤 Sending signal:', signal.type, 'to:', signal.targetUserId || 'all');
      
      // 🆕 TẠO USER OBJECT ĐẦY ĐỦ
      const userInfo = {
        id: currentUser?.id || currentUser?.username || 'unknown',
        username: currentUser?.username || 'user', 
        fullName: currentUser?.fullName || currentUser?.username || 'User'
      };
      
      const signalData = {
        type: signal.type,
        to: signal.targetUserId || 'all',
        data: signal.data || {},
        user: userInfo, // 🆕 QUAN TRỌNG: ĐẢM BẢO CÓ USER OBJECT
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

  // 🆕 EFFECT CHÍNH - ĐÃ SỬA THỨ TỰ KHỞI TẠO
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

  // 🆕 EFFECT CHO SIGNALING - CHỈ CHẠY KHI ĐÃ CÓ LOCAL STREAM
  useEffect(() => {
    if (!isActive || !roomId || !localStream) return;

    let signalSub;
    const initializeSignaling = async () => {
      try {
        console.log('🎯 Initializing WebRTC signaling...');
        
        // Đảm bảo kết nối WebSocket
        if (!socketService.isConnected) {
          setConnectionStatus('connecting');
          await socketService.connect();
        }

        // Subscribe to signaling
        signalSub = await socketService.subscribeToSignaling(roomId, (messageData) => {
          console.log('📨 Signaling message received:', messageData);
          handleSignalingMessage(messageData);
        });
        
        if (signalSub) {
          setConnectionStatus('connected');
          setIsReadyForSignaling(true);
          console.log('✅ WebRTC signaling initialized');
          
          // 🆕 GỬI JOIN SIGNAL SAU KHI ĐÃ SẴN SÀNG
          console.log('📤 Sending join signal...');
          await sendSignal({
            type: 'join',
            targetUserId: null
          });
          
        } else {
          setConnectionStatus('error');
          console.error('❌ Failed to initialize WebRTC signaling');
        }

      } catch (error) {
        console.error('❌ WebRTC signaling initialization error:', error);
        setConnectionStatus('error');
      }
    };

    initializeSignaling();

    return () => {
      if (signalSub) {
        socketService.unsubscribe(`/topic/signal/${roomId}`);
      }
      setIsReadyForSignaling(false);
    };
  }, [isActive, roomId, localStream]);

  // 🆕 Khởi tạo call - ĐÃ TỐI ƯU
  const initializeCall = async () => {
    try {
      setConnectionStatus('initializing');
      console.log('🎬 Initializing video call...');
      
      // 🆕 LẤY MEDIA STREAM TRƯỚC
      let stream;
      const constraints = [
        { 
          video: { width: 1280, height: 720, frameRate: 30 },
          audio: { echoCancellation: true, noiseSuppression: true }
        },
        { 
          video: true, 
          audio: true 
        },
        { 
          video: { width: 640, height: 480 }, 
          audio: true 
        }
      ];

      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('✅ Got media stream with constraints:', constraint);
          break;
        } catch (error) {
          console.warn('⚠️ Failed with constraints:', constraint, error);
          continue;
        }
      }

      if (!stream) {
        throw new Error('Không thể truy cập camera/microphone');
      }

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Media stream ready, waiting for signaling...');

    } catch (error) {
      console.error('❌ Error initializing video call:', error);
      setConnectionStatus('error');
      
      let errorMessage = 'Không thể khởi tạo cuộc gọi video. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Vui lòng cấp quyền truy cập camera và microphone.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Không tìm thấy camera/microphone.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      onEndCall();
    }
  };

  // 🆕 Tạo peer connection - ĐÃ CẢI THIỆN
  const createPeerConnection = (userId) => {
    console.log('🔄 Creating peer connection for:', userId);
    
    // 🆕 KIỂM TRA NẾU ĐÃ CÓ PEER CONNECTION
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

    // 🆕 THÊM LOCAL TRACKS - QUAN TRỌNG!
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('➕ Adding local track:', track.kind, 'to:', userId);
        pc.addTrack(track, localStream);
      });
    } else {
      console.warn('⚠️ No local stream available when creating PC for:', userId);
    }

    // XỬ LÝ REMOTE TRACKS
    pc.ontrack = (event) => {
      console.log('🎬 Received remote track from:', userId, event.track.kind);
      const [remoteStream] = event.streams;
      
      if (remoteStream) {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, remoteStream);
          return newMap;
        });
        
        // 🆕 TỰ ĐỘNG TẠO ANSWER NẾU NHẬN ĐƯỢC TRACK MÀ CHƯA CÓ ANSWER
        if (pc.remoteDescription && !pc.localDescription) {
          console.log('🔄 Auto-creating answer for:', userId);
          createAndSendAnswer(pc, userId);
        }
      }
    };

    // XỬ LÝ ICE CANDIDATES
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

    // THEO DÕI TRẠNG THÁI KẾT NỐI
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

  // 🆕 Hàm tạo và gửi answer
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
      
      // Bỏ qua signal từ chính mình
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

  // 🆕 Xử lý user join - ĐÃ CẢI THIỆN
  const handleUserJoin = async (user) => {
    const userId = user.id;
    console.log('👋 Handling user join:', userId);
    
    // Thêm vào participants
    setParticipants(prev => {
      if (prev.find(p => p.id === userId)) return prev;
      return [...prev, user];
    });
    
    // 🆕 ĐỢI MỘT CHÚT ĐỂ ĐẢM BẢO REMOTE SẴN SÀNG
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Tạo peer connection
    const pc = createPeerConnection(userId);
    
    try {
      // 🆕 THÊM DELAY TRƯỚC KHI TẠO OFFER
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

  // 🆕 Xử lý offer - ĐÃ CẢI THIỆN
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

  // 🆕 Xử lý answer - ĐÃ CẢI THIỆN
  const handleAnswer = async (data) => {
    const userId = data.user?.id;
    console.log('📨 Handling answer from:', userId);
    
    const pc = peerConnections.get(userId);
    if (pc) {
      try {
        // 🆕 KIỂM TRA TRẠNG THÁI TRƯỚC KHI SET REMOTE DESCRIPTION
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

  // 🆕 Xử lý ICE candidate - ĐÃ CẢI THIỆN
  const handleIceCandidate = async (data) => {
    const userId = data.user?.id;
    console.log('🧊 Handling ICE candidate from:', userId);
    
    const pc = peerConnections.get(userId);
    if (pc && data.candidate) {
      try {
        // 🆕 KIỂM TRA TRẠNG THÁI SIGNALING
        if (pc.remoteDescription) {
          await pc.addIceCandidate(data.candidate);
          console.log('✅ ICE candidate added for:', userId);
        } else {
          console.log('⏳ Delaying ICE candidate - waiting for remote description...');
          // Lưu candidate và thêm sau khi có remote description
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

  const handleUserLeave = (user) => {
    const userId = user.id;
    console.log('👋 User leaving:', userId);
    
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

  // 🆕 HÀM CHIA SẺ MÀN HÌNH - ĐÃ THÊM
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        console.log('🖥️ Starting screen share...');
        
        // Lấy stream màn hình
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
        
        // Thay thế video track trong tất cả peer connections
        peerConnections.forEach((pc, userId) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(videoTrack);
            console.log('✅ Replaced video track for:', userId);
          }
        });
        
        // Cập nhật local video hiển thị
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Cập nhật local stream state
        setLocalStream(screenStream);
        setIsScreenSharing(true);
        console.log('✅ Screen sharing started');
        
        // Xử lý khi user dừng chia sẻ màn hình từ browser UI
        videoTrack.onended = async () => {
          console.log('🖥️ Screen share ended by user');
          await stopScreenShare();
        };
        
      } else {
        // Dừng chia sẻ màn hình
        await stopScreenShare();
      }
    } catch (error) {
      console.error('❌ Error sharing screen:', error);
      if (error.name !== 'NotAllowedError') {
        alert('Lỗi khi chia sẻ màn hình: ' + error.message);
      }
    }
  };

  // 🆕 HÀM DỪNG CHIA SẺ MÀN HÌNH - ĐÃ THÊM
  const stopScreenShare = async () => {
    try {
      console.log('🖥️ Stopping screen share...');
      
      // Dừng tất cả tracks trong stream hiện tại (screen stream)
      if (localStream) {
        localStream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      }
      
      // Khôi phục camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const newVideoTrack = cameraStream.getVideoTracks()[0];
      const newAudioTrack = cameraStream.getAudioTracks()[0];
      
      // Thay thế tracks trong tất cả peer connections
      peerConnections.forEach((pc, userId) => {
        // Thay thế video track
        const videoSender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (videoSender && newVideoTrack) {
          videoSender.replaceTrack(newVideoTrack);
          console.log('✅ Restored camera video track for:', userId);
        }
        
        // Thay thế audio track (nếu cần)
        const audioSender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'audio'
        );
        if (audioSender && newAudioTrack) {
          audioSender.replaceTrack(newAudioTrack);
          console.log('✅ Restored camera audio track for:', userId);
        }
      });
      
      // Cập nhật local video hiển thị
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream;
      }
      
      // Cập nhật state
      setLocalStream(cameraStream);
      setIsScreenSharing(false);
      console.log('✅ Screen sharing stopped, camera restored');
      
    } catch (error) {
      console.error('❌ Error restoring camera:', error);
      
      // Fallback: tạo stream trống nếu không thể khôi phục camera
      const emptyStream = new MediaStream();
      setLocalStream(emptyStream);
      setIsScreenSharing(false);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = emptyStream;
      }
      
      alert('Không thể khôi phục camera sau khi chia sẻ màn hình');
    }
  };

  // 🆕 Cleanup - ĐÃ CẢI THIỆN
  const cleanup = () => {
    console.log('🧹 Cleaning up video call...');
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
      setLocalStream(null);
    }
    
    // Close peer connections
    peerConnections.forEach((pc, userId) => {
      pc.close();
      console.log('🔒 Closed peer connection with:', userId);
    });
    setPeerConnections(new Map());
    setRemoteStreams(new Map());
    setParticipants([]);
    setIsReadyForSignaling(false);
    
    // Send leave signal
    if (socketService.isConnected && roomId) {
      sendSignal({
        type: 'leave',
        targetUserId: null
      }).catch(console.error);
    }
    
    setConnectionStatus('disconnected');
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
  if (!isActive) return null;

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

          {/* 🆕 Placeholder cho participants chưa có stream */}
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