import React, { useRef, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Users } from 'lucide-react';

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

  // 🎯 EFFECT CHÍNH - XỬ LÝ KẾT NỐI
  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    initializeCall();

    return () => {
      cleanup();
    };
  }, [isActive, roomId]);

  // 🎯 KHỞI TẠO CALL
  const initializeCall = async () => {
    try {
      console.log('🎬 Starting video call initialization...');
      setConnectionStatus('initializing');

      // 1. Lấy media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Media stream acquired');

      // 2. Khởi tạo signaling
      await initializeSignaling();

    } catch (error) {
      console.error('❌ Failed to initialize call:', error);
      setConnectionStatus('error');
      alert('Không thể khởi động video call: ' + error.message);
    }
  };

  // 🎯 KHỞI TẠO SIGNALING
  const initializeSignaling = async () => {
    try {
      console.log('🎯 Initializing signaling...');
      setConnectionStatus('connecting');

      // Đảm bảo socket kết nối
      if (!socketService.isConnected) {
        await socketService.connect();
      }

      // Subscribe to signaling
      await socketService.subscribeToSignaling(roomId, handleSignalingMessage);

      setConnectionStatus('connected');
      console.log('✅ Signaling ready - waiting for peers...');

      // Gửi join signal
      await sendSignal({
        type: 'join',
        targetUserId: null
      });

    } catch (error) {
      console.error('❌ Signaling initialization failed:', error);
      setConnectionStatus('error');
    }
  };

  // 🎯 GỬI SIGNAL
  const sendSignal = async (signal) => {
    try {
      if (!socketService.isConnected) {
        console.warn('⚠️ Socket not connected, skipping signal');
        return false;
      }

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

      console.log('📤 Sending signal:', signal.type);
      await socketService.sendSignal(roomId, signalData);
      return true;

    } catch (error) {
      console.error('❌ Failed to send signal:', error);
      return false;
    }
  };

  // 🎯 TẠO PEER CONNECTION
  const createPeerConnection = (userId) => {
    console.log('🔄 Creating peer connection for:', userId);

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

    // Xử lý remote stream
    pc.ontrack = (event) => {
      console.log('🎬 Received remote track from:', userId);
      const [remoteStream] = event.streams;
      
      if (remoteStream) {
        setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
      }
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUserId: userId
        });
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      console.log(`🔗 ${userId} state:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log('✅ Peer connected:', userId);
      }
    };

    const newPeerConnections = new Map(peerConnections);
    newPeerConnections.set(userId, pc);
    setPeerConnections(newPeerConnections);

    return pc;
  };

  // 🎯 XỬ LÝ SIGNALING MESSAGES
  const handleSignalingMessage = async (data) => {
    try {
      const currentUserId = currentUser?.id || currentUser?.username;
      const senderId = data.user?.id;

      // Bỏ qua signal từ chính mình
      if (senderId === currentUserId) return;

      console.log('📨 Processing signal:', data.type, 'from:', senderId);

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
      console.error('❌ Error handling signal:', error);
    }
  };

  // 🎯 XỬ LÝ USER JOIN
  const handleUserJoin = async (user) => {
    const userId = user.id;
    console.log('👋 User joined:', userId);

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

      console.log('✅ Offer sent to:', userId);
    } catch (error) {
      console.error('❌ Failed to create offer:', error);
    }
  };

  // 🎯 XỬ LÝ OFFER
  const handleOffer = async (data) => {
    const userId = data.user?.id;
    console.log('📨 Handling offer from:', userId);

    let pc = peerConnections.get(userId);
    if (!pc) {
      pc = createPeerConnection(userId);
    }

    try {
      await pc.setRemoteDescription(data.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendSignal({
        type: 'answer',
        answer: answer,
        targetUserId: userId
      });

      console.log('✅ Answer sent to:', userId);
    } catch (error) {
      console.error('❌ Failed to handle offer:', error);
    }
  };

  // 🎯 XỬ LÝ ANSWER
  const handleAnswer = async (data) => {
    const userId = data.user?.id;
    console.log('📨 Handling answer from:', userId);

    const pc = peerConnections.get(userId);
    if (pc) {
      try {
        await pc.setRemoteDescription(data.answer);
        console.log('✅ Remote description set for:', userId);
      } catch (error) {
        console.error('❌ Failed to set remote description:', error);
      }
    }
  };

  // 🎯 XỬ LÝ ICE CANDIDATE
  const handleIceCandidate = async (data) => {
    const userId = data.user?.id;
    console.log('🧊 Handling ICE candidate from:', userId);

    const pc = peerConnections.get(userId);
    if (pc && data.candidate) {
      try {
        await pc.addIceCandidate(data.candidate);
        console.log('✅ ICE candidate added for:', userId);
      } catch (error) {
        console.error('❌ Failed to add ICE candidate:', error);
      }
    }
  };

  // 🎯 XỬ LÝ USER LEAVE
  const handleUserLeave = (user) => {
    const userId = user.id;
    console.log('👋 User left:', userId);

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

  // 🎯 CLEANUP
  const cleanup = () => {
    console.log('🧹 Cleaning up...');

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

    setConnectionStatus('disconnected');
    console.log('✅ Cleanup completed');
  };

  // 🎯 CONTROLS
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
        
        // Replace video tracks in all peer connections
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
      console.error('❌ Screen share error:', error);
    }
  };

  // 🎯 HELPER FUNCTIONS
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
              {participants.length + 1} người tham gia
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

          {/* Placeholder for connecting users */}
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
          >
            <Monitor className="h-6 w-6" />
          </button>

          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all hover:shadow-lg hover:transform hover:scale-110"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoCall;