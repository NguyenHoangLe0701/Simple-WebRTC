import React, { useRef, useEffect, useState } from 'react';
import socketService from '../services/socketService';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Share2, Users } from 'lucide-react';

const EnhancedVideoCall = ({ isActive, onEndCall, roomId, currentUser }) => {
  const localVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (isActive) {
      initializeCall();
    } else {
      cleanup();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !roomId) return;

    let signalSub;
    (async () => {
      if (!socketService.isConnected) {
        try {
          await socketService.connect();
        } catch (e) {
          console.error('Socket connection error:', e);
        }
      }

      // Subscribe to signaling
      signalSub = socketService.subscribeToSignaling(roomId, handleSignalingMessage);

      // Send join signal
      socketService.sendSignal(roomId, {
        type: 'join',
        user: {
          id: currentUser?.id || currentUser?.username,
          username: currentUser?.username,
          fullName: currentUser?.fullName
        }
      });
    })();

    return () => {
      if (signalSub) socketService.unsubscribe(`/topic/room/${roomId}`);
    };
  }, [isActive, roomId, currentUser]);

  const handleSignalingMessage = async (frame) => {
    try {
      const data = JSON.parse(frame.body);
      
      switch (data.type) {
        case 'join':
          if (data.user?.id !== (currentUser?.id || currentUser?.username)) {
            handleUserJoin(data.user);
          }
          break;
        case 'leave':
          handleUserLeave(data.user);
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

      // Send join signal
      if (socketService.isConnected && roomId) {
        socketService.sendSignal(roomId, {
          type: 'join',
          user: {
            id: currentUser?.id || currentUser?.username,
            username: currentUser?.username,
            fullName: currentUser?.fullName
          }
        });
      }

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập.');
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
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, remoteStream);
        return newMap;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketService.isConnected) {
        socketService.sendSignal(roomId, {
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUserId: userId
        });
      }
    };

    setPeerConnections(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, pc);
      return newMap;
    });

    return pc;
  };

  const handleUserJoin = async (user) => {
    setParticipants(prev => {
      if (prev.find(p => p.id === user.id)) return prev;
      return [...prev, user];
    });
    
    // Create peer connection for new user
    const pc = createPeerConnection(user.id);
    
    // Create and send offer
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socketService.sendSignal(roomId, {
        type: 'offer',
        offer: offer,
        targetUserId: user.id
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleUserLeave = (user) => {
    setParticipants(prev => prev.filter(p => p.id !== user.id));
    
    const pc = peerConnections.get(user.id);
    if (pc) {
      pc.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(user.id);
        return newMap;
      });
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(user.id);
      return newMap;
    });
  };

  const handleOffer = async (data) => {
    const userId = data.userId || data.user?.id;
    let pc = peerConnections.get(userId);
    
    if (!pc) {
      pc = createPeerConnection(userId);
    }
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socketService.sendSignal(roomId, {
        type: 'answer',
        answer: answer,
        targetUserId: userId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data) => {
    const userId = data.userId || data.user?.id;
    const pc = peerConnections.get(userId);
    
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async (data) => {
    const userId = data.userId || data.user?.id;
    const pc = peerConnections.get(userId);
    
    if (pc && data.candidate) {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleScreenShare = (data) => {
    // Handle remote screen share
    if (data.userId !== (currentUser?.id || currentUser?.username)) {
      // Remote screen share would be handled via ontrack
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    peerConnections.forEach(pc => pc.close());
    setPeerConnections(new Map());
    setRemoteStreams(new Map());
    setParticipants([]);
    
    // Send leave signal
    if (socketService.isConnected && roomId) {
      socketService.sendSignal(roomId, {
        type: 'leave',
        user: {
          id: currentUser?.id || currentUser?.username
        }
      });
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
        
        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnections.forEach((pc) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
        
        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        videoTrack.onended = async () => {
          setIsScreenSharing(false);
          // Restore camera
          try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ 
              video: true, 
              audio: true 
            });
            const newVideoTrack = cameraStream.getVideoTracks()[0];
            
            peerConnections.forEach((pc) => {
              const sender = pc.getSenders().find(s => 
                s.track && s.track.kind === 'video'
              );
              if (sender) {
                sender.replaceTrack(newVideoTrack);
              }
            });
            
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = cameraStream;
            }
            
            setLocalStream(cameraStream);
          } catch (error) {
            console.error('Error restoring camera:', error);
          }
        };
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  if (!isActive) return null;

  const participantCount = participants.length + 1; // +1 for current user

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
            </p>
          </div>
        </div>
        
        <button
          onClick={onEndCall}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 relative bg-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
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
              {currentUser?.fullName || currentUser?.username || 'Bạn'}
            </div>
          </div>

          {/* Remote Videos */}
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
            const participant = participants.find(p => p.id === userId);
            return (
              <div key={userId} className="relative bg-gray-700 rounded-lg overflow-hidden">
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(videoRef) => {
                    if (videoRef) videoRef.srcObject = stream;
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {participant?.fullName || participant?.username || 'Người tham gia'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            <Monitor className="h-6 w-6" />
          </button>

          <button
            onClick={onEndCall}
            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoCall;

