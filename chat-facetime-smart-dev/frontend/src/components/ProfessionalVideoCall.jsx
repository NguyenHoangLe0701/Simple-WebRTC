import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Video, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Settings, 
  Share2, 
  Monitor,
  MoreVertical,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';
import socketService from '../services/socket';

const ProfessionalVideoCall = ({ roomId, currentUser, isHost, onEndCall }) => {
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [roomSettings, setRoomSettings] = useState({
    allowScreenShare: true,
    allowChat: true,
    isLocked: false,
    maxParticipants: 50
  });

  const localVideoRef = React.useRef(null);
  const screenShareRef = React.useRef(null);

  useEffect(() => {
    initializeCall();
    return () => cleanup();
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join room signaling
      await joinRoomSignaling();
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const joinRoomSignaling = async () => {
    if (!socketService.isConnected) {
      await socketService.connect();
    }

    // Subscribe to room events
    socketService.subscribeToSignaling(roomId, handleSignalingMessage);
    
    // Send join message
    socketService.sendSignal(roomId, {
      type: 'join',
      user: currentUser,
      isHost: isHost
    });
  };

  const handleSignalingMessage = async (frame) => {
    try {
      const data = JSON.parse(frame.body);
      
      switch (data.type) {
        case 'join':
          handleUserJoin(data);
          break;
        case 'leave':
          handleUserLeave(data);
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
        case 'screen-share':
          handleScreenShare(data);
          break;
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
    }
  };

  const handleUserJoin = (data) => {
    setParticipants(prev => [...prev, data.user]);
    
    // Create peer connection for new user
    if (data.user.id !== currentUser.id) {
      createPeerConnection(data.user.id);
    }
  };

  const handleUserLeave = (data) => {
    setParticipants(prev => prev.filter(p => p.id !== data.user.id));
    
    // Close peer connection
    const pc = peerConnections.get(data.user.id);
    if (pc) {
      pc.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.user.id);
        return newMap;
      });
    }
  };

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(userId, remoteStream));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendSignal(roomId, {
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUserId: userId
        });
      }
    };

    setPeerConnections(prev => new Map(prev.set(userId, pc)));
    return pc;
  };

  const handleOffer = async (data) => {
    const pc = peerConnections.get(data.userId) || createPeerConnection(data.userId);
    
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    socketService.sendSignal(roomId, {
      type: 'answer',
      answer: answer,
      targetUserId: data.userId
    });
  };

  const handleAnswer = async (data) => {
    const pc = peerConnections.get(data.userId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  };

  const handleIceCandidate = async (data) => {
    const pc = peerConnections.get(data.userId);
    if (pc && data.candidate) {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleScreenShare = (data) => {
    if (data.userId !== currentUser.id) {
      setRemoteStreams(prev => new Map(prev.set(`${data.userId}-screen`, data.stream)));
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Send screen share to all participants
        socketService.sendSignal(roomId, {
          type: 'screen-share',
          stream: screenStream,
          userId: currentUser.id
        });
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    peerConnections.forEach(pc => pc.close());
    
    socketService.sendSignal(roomId, {
      type: 'leave',
      user: currentUser
    });
  };

  const getParticipantCount = () => participants.length + 1; // +1 for current user

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{roomId}</h2>
            <p className="text-sm text-gray-300">
              {getParticipantCount()} người tham gia
              {isHost && <span className="ml-2 text-yellow-400">• Chủ phòng</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Danh sách người tham gia"
          >
            <Users className="h-5 w-5" />
          </button>
          
          {isHost && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Cài đặt phòng"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-gray-800">
          {/* Grid Layout for Participants */}
          <div className="absolute inset-0 p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
              {/* Local Video */}
              <div className="relative bg-gray-700 rounded-lg overflow-hidden">
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
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentUser.fullName || currentUser.username} (Bạn)
                </div>
              </div>

              {/* Remote Videos */}
              {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
                <div key={userId} className="relative bg-gray-700 rounded-lg overflow-hidden">
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={videoRef => {
                      if (videoRef) videoRef.srcObject = stream;
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {participants.find(p => p.id === userId)?.fullName || 'Người tham gia'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-gray-800 text-white border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Người tham gia ({getParticipantCount()})
              </h3>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-96">
              {/* Current User */}
              <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {(currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{currentUser.fullName || currentUser.username}</p>
                  <p className="text-xs text-gray-300">Bạn</p>
                </div>
                {isHost && <Crown className="h-4 w-4 text-yellow-400" />}
              </div>

              {/* Other Participants */}
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {(participant.fullName || participant.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{participant.fullName || participant.username}</p>
                    <p className="text-xs text-gray-300">Đang tham gia</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <Mic className="h-3 w-3" />
                    <Video className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && isHost && (
          <div className="w-80 bg-gray-800 text-white border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Cài đặt phòng
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span>Cho phép chia sẻ màn hình</span>
                  <input
                    type="checkbox"
                    checked={roomSettings.allowScreenShare}
                    onChange={(e) => setRoomSettings(prev => ({ ...prev, allowScreenShare: e.target.checked }))}
                    className="rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span>Cho phép chat</span>
                  <input
                    type="checkbox"
                    checked={roomSettings.allowChat}
                    onChange={(e) => setRoomSettings(prev => ({ ...prev, allowChat: e.target.checked }))}
                    className="rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span>Khóa phòng</span>
                  <input
                    type="checkbox"
                    checked={roomSettings.isLocked}
                    onChange={(e) => setRoomSettings(prev => ({ ...prev, isLocked: e.target.checked }))}
                    className="rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full ${
              isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            <Monitor className="h-6 w-6" />
          </button>

          <button
            onClick={onEndCall}
            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalVideoCall;
