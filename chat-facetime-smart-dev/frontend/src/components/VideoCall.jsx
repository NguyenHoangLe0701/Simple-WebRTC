import React, { useRef, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Share2 } from 'lucide-react';

const VideoCall = ({ isActive, onEndCall, roomId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    if (isActive) {
      initializeCall();
    } else {
      cleanup();
    }
  }, [isActive]);

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

      // Initialize peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      setPeerConnection(pc);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to other peer via signaling server
          sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };

    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const sendSignalingMessage = (message) => {
    if (socketService.isConnected) {
      socketService.sendSignal(roomId, message);
    } else {
      console.log('Sending signaling message (queued/log):', message);
    }
  };

  // Receive signaling
  useEffect(() => {
    let sub;
    (async () => {
      if (!roomId) return;
      if (!socketService.isConnected) {
        try { await socketService.connect(); } catch (e) { console.error(e); }
      }
      sub = socketService.subscribeToSignaling(roomId, async (frame) => {
        try {
          const data = JSON.parse(frame.body);
          if (!peerConnection) return;
          if (data.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            sendSignalingMessage({ type: 'answer', answer });
          } else if (data.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          } else if (data.type === 'ice-candidate') {
            try {
              await peerConnection.addIceCandidate(data.candidate);
            } catch (e) {
              console.error('Error adding ice candidate', e);
            }
          }
        } catch (e) {
          console.error('Signal parse error', e);
        }
      });
    })();
    return () => {
      if (sub) socketService.unsubscribe(`/topic/room/${roomId}`);
    };
  }, [roomId, peerConnection]);

  // Start call by creating an offer
  useEffect(() => {
    const startOffer = async () => {
      if (isActive && peerConnection && localStream) {
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          sendSignalingMessage({ type: 'offer', offer });
        } catch (e) {
          console.error('Offer error', e);
        }
      }
    };
    startOffer();
  }, [isActive, peerConnection, localStream]);

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setRemoteStream(null);
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
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          // Restore camera
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
              const newVideoTrack = stream.getVideoTracks()[0];
              if (sender) {
                sender.replaceTrack(newVideoTrack);
              }
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
              }
            });
        };
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <div className="absolute inset-0 bg-gray-800">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <p>Đang chờ người tham gia...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {localStream && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
        )}

        {/* Call Info */}
        <div className="absolute top-4 left-4 text-white">
          <h3 className="text-lg font-semibold">Video Call</h3>
          <p className="text-sm text-gray-300">Room: {roomId}</p>
          <p className="text-sm text-gray-300">2 người tham gia</p>
        </div>
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

export default VideoCall;