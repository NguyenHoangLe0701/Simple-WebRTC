import React, { useRef, useEffect, useState } from 'react';
import socketService from '../services/socket';
import webrtcService from '../services/webrtc.service';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Users, Camera, CameraOff } from 'lucide-react';

const EnhancedVideoCall = ({ isActive, onEndCall, roomId, currentUser, callType = 'video' }) => {
  const localVideoRef = useRef(null);
  const cleanupInProgress = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // 🆕 FIX: State management đơn giản hơn
  const [permissionStatus, setPermissionStatus] = useState('idle'); // idle -> requesting -> granted/denied
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 🆕 FIX: Xác định loại call (video hoặc voice)
  const isVideoCall = callType === 'video';

  // 🆕 FIX: Kiểm tra currentUser có hợp lệ không
  useEffect(() => {
    if (isActive && (!currentUser || (!currentUser.id && !currentUser.username))) {
      console.error('❌ Video call requires valid currentUser');
      alert('Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      onEndCall();
    }
  }, [isActive, currentUser, onEndCall]);

  // 🆕 FIX: Throttling cho ICE candidates để tránh gửi quá nhiều
  const iceCandidateQueue = useRef(new Map()); // Map<userId, candidate[]>
  const iceCandidateTimer = useRef(new Map()); // Map<userId, timer>
  const ICE_CANDIDATE_THROTTLE_MS = 100; // Gửi mỗi 100ms

  // 🆕 FIX: Kiểm tra WebRTC support - chỉ chạy 1 lần
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Trình duyệt không hỗ trợ WebRTC. Vui lòng dùng Chrome, Firefox hoặc Safari mới nhất.');
      onEndCall();
      return;
    }
  }, [onEndCall]);

  // 🆕 FIX: Effect chính - chỉ chạy khi isActive thay đổi
  useEffect(() => {
    if (isActive && !isInitialized) {
      setShowPermissionModal(true);
    }

    if (!isActive && isInitialized) {
      cleanup();
    }
  }, [isActive, isInitialized]);

  // 🆕 FIX: Setup WebRTC event handlers và set roomId
  useEffect(() => {
    if (!isActive || !roomId) return;

    // Set roomId cho webrtcService
    webrtcService.setRoomId(roomId);

    // Setup WebRTC event handlers
    webrtcService.setOnRemoteStream((userId, stream) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, stream);
        return newMap;
      });
    });

    webrtcService.setOnIceCandidate((userId, candidate) => {
      // 🆕 FIX: Chỉ gửi ICE candidate nếu có peer connection và đang ở trạng thái hợp lệ
      if (!webrtcService.canSendIceCandidate(userId)) {
        return; // Bỏ qua nếu chưa có peer connection hoặc không ở trạng thái hợp lệ
      }
      
      // Throttle ICE candidates - gom lại và gửi theo batch
      if (!iceCandidateQueue.current.has(userId)) {
        iceCandidateQueue.current.set(userId, []);
      }
      iceCandidateQueue.current.get(userId).push(candidate);

      // Clear existing timer
      if (iceCandidateTimer.current.has(userId)) {
        clearTimeout(iceCandidateTimer.current.get(userId));
      }

      // Set new timer để gửi batch
      const timer = setTimeout(() => {
        const candidates = iceCandidateQueue.current.get(userId) || [];
        if (candidates.length > 0) {
          // Gửi candidate mới nhất (thường là quan trọng nhất)
          const latestCandidate = candidates[candidates.length - 1];
          sendSignalSafely({
            type: 'ice-candidate',
            candidate: latestCandidate,
            targetUserId: userId,
            // 🔥 QUAN TRỌNG: fromUserId sẽ được thêm bởi sendSignal()
          });
          iceCandidateQueue.current.set(userId, []);
        }
        iceCandidateTimer.current.delete(userId);
      }, ICE_CANDIDATE_THROTTLE_MS);

      iceCandidateTimer.current.set(userId, timer);
    });

    webrtcService.setOnConnectionStateChange((userId, state) => {
      setConnectionStatus(state);
    });

    return () => {
      webrtcService.setOnRemoteStream(null);
      webrtcService.setOnIceCandidate(null);
      webrtcService.setOnConnectionStateChange(null);
      
      // 🆕 FIX: Cleanup ICE candidate timers
      iceCandidateTimer.current.forEach(timer => clearTimeout(timer));
      iceCandidateTimer.current.clear();
      iceCandidateQueue.current.clear();
    };
  }, [isActive, roomId]);

  // 🆕 FIX: Set local stream cho WebRTC service
  useEffect(() => {
    if (localStream) {
      webrtcService.setLocalStream(localStream);
      
      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [localStream]);

  // 🆕 FIX: Khởi tạo signaling khi có local stream và room
  useEffect(() => {
    if (isActive && localStream && roomId && permissionStatus === 'granted') {
      initializeSignaling();
    }
  }, [isActive, localStream, roomId, permissionStatus]);

  // 🆕 FIX: Hàm request media permission với fallback audio-only khi camera lỗi
  const requestMediaPermission = async () => {
    try {
      setPermissionStatus('requesting');
      setShowPermissionModal(false);

      let stream = null;
      let hasVideo = false;

      // Nếu là video call, thử lấy cả video và audio
      if (isVideoCall) {
        try {
          const videoConstraints = {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 }
            }
          };
          stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
          hasVideo = stream.getVideoTracks().length > 0;
        } catch (videoError) {
          // Nếu video lỗi, thử fallback chỉ audio
          if (videoError.name === 'NotFoundError' || videoError.name === 'NotReadableError' || videoError.name === 'OverconstrainedError') {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true
                },
                video: false
              });
              hasVideo = false;
            } catch (audioError) {
              // Nếu cả audio cũng lỗi, throw error
              throw audioError;
            }
          } else {
            throw videoError;
          }
        }
      } else {
        // Voice call: chỉ xin audio
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        hasVideo = false;
      }

      setPermissionStatus('granted');
      setLocalStream(stream);
      setIsInitialized(true);

    } catch (error) {
      setPermissionStatus('denied');
      
      const deviceType = isVideoCall ? 'camera/microphone' : 'microphone';
      let errorMessage = `Không thể truy cập ${deviceType}. `;
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Bạn đã từ chối cấp quyền. Vui lòng cho phép trong trình duyệt.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += isVideoCall ? 'Không tìm thấy camera/microphone.' : 'Không tìm thấy microphone.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Thiết bị đang được sử dụng bởi ứng dụng khác.';
      }
      
      alert(errorMessage);
      onEndCall();
    }
  };

  // 🆕 FIX: Hàm khởi tạo signaling với presence support
  const initializeSignaling = async () => {
    if (!isActive || !roomId || !localStream) {
      return;
    }

    // Kiểm tra currentUser trước khi join
    if (!currentUser || (!currentUser.id && !currentUser.username)) {
      console.error('❌ Cannot initialize signaling: currentUser is invalid');
      setConnectionStatus('error');
      return;
    }

    try {
      setConnectionStatus('connecting');

      // Kết nối socket
      if (!socketService.isConnected) {
        await socketService.connect();
      }

      // Subscribe to signaling
      console.log('📡 Subscribing to signaling for room:', roomId);
      await socketService.subscribeToSignaling(roomId, handleSignalingMessage);
      console.log('✅ Subscribed to signaling');

      // Subscribe to presence để nhận danh sách users hiện có
      console.log('📡 Subscribing to presence for room:', roomId);
      await socketService.subscribeToPresence(roomId, handlePresenceMessage);
      console.log('✅ Subscribed to presence');

      // Join room
      console.log('👤 Joining room with signaling:', roomId);
      await socketService.joinRoomWithSignaling(roomId, currentUser);
      console.log('✅ Joined room with signaling');

      setConnectionStatus('connected');
      console.log('✅ Signaling initialized successfully');

    } catch (error) {
      console.error('❌ Signaling initialization error:', error);
      setConnectionStatus('error');
      
      // Thử kết nối lại sau 3s
      setTimeout(() => {
        // 🔥 FIX: Check lại connectionStatus từ state mới nhất
        setConnectionStatus(currentStatus => {
          if (isActive && currentStatus !== 'connected') {
            initializeSignaling();
          }
          return currentStatus;
        });
      }, 3000);
    }
  };

  // 🆕 FIX: Hàm gửi signal với error handling tốt hơn - THÊM fromUserId
  const sendSignal = async (signal) => {
    try {
      if (!socketService.isConnected) {
        console.warn('⚠️ Cannot send signal - socket not connected');
        return false;
      }

      const currentUserId = currentUser?.id || currentUser?.username;
      
      if (!currentUserId) {
        console.error('❌ Cannot send signal - currentUser is invalid');
        return false;
      }
      
      const signalData = {
        type: signal.type,
        targetUserId: signal.targetUserId,
        fromUserId: currentUserId, // 🔥 QUAN TRỌNG: Thêm fromUserId cho mọi signal
        [signal.type]: signal[signal.type], // offer, answer, candidate
        user: {
          id: currentUserId,
          username: currentUser?.username,
          fullName: currentUser?.fullName
        },
        timestamp: Date.now()
      };

      // 🔥 DEBUG: Log signal gửi đi
      console.log('📤 Sending signal:', signal.type, 'to:', signal.targetUserId, signalData);
      
      await socketService.sendSignal(roomId, signalData);
      console.log('✅ Signal sent successfully:', signal.type);
      return true;

    } catch (error) {
      // 🆕 FIX: Suppress lỗi runtime.lastError từ Chrome extensions (harmless)
      if (error?.message?.includes('runtime.lastError') || 
          error?.message?.includes('Receiving end does not exist')) {
        // Đây là lỗi từ browser extension, không phải từ code của chúng ta
        // Có thể bỏ qua an toàn
        return false;
      }
      console.error('❌ Send signal error:', error);
      return false;
    }
  };

  // 🆕 FIX: Wrapper an toàn cho sendSignal với error suppression
  const sendSignalSafely = async (signal) => {
    try {
      return await sendSignal(signal);
    } catch (error) {
      // Suppress các lỗi không quan trọng từ browser extensions
      if (error?.message?.includes('runtime.lastError') || 
          error?.message?.includes('Receiving end does not exist') ||
          error?.message?.includes('Extension context invalidated')) {
        return false; // Bỏ qua lỗi từ extensions
      }
      throw error; // Re-throw các lỗi khác
    }
  };

  // 🆕 FIX: Xử lý signaling message
  const handleSignalingMessage = async (frame) => {
    try {
      // Parse message - có thể là frame với body hoặc object trực tiếp
      let data = frame;
      if (frame.body) {
        data = typeof frame.body === 'string' ? JSON.parse(frame.body) : frame.body;
      } else if (typeof frame === 'string') {
        data = JSON.parse(frame);
      }

      const currentUserId = currentUser?.id || currentUser?.username;
      const senderId = data.user?.id || data.fromUserId || data.userId;

      // Bỏ qua message từ chính mình
      if (senderId === currentUserId) {
        return;
      }

      // 🔥 DEBUG: Log signal type
      console.log('📨 Received signal type:', data.type, 'from:', senderId);
      
      switch (data.type) {
        case 'join':
          console.log('👤 Join signal from:', senderId);
          await handleUserJoin(data.user || { id: senderId, username: data.username });
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
          console.log('👋 Leave signal from:', senderId);
          handleUserLeave(data.user || { id: senderId, username: data.username });
          break;
      }
    } catch (error) {
      console.error('❌ Error handling signal:', error);
    }
  };

  // 🆕 FIX: Xử lý presence message để nhận danh sách users hiện có
  const handlePresenceMessage = async (message) => {
    try {
      let users = [];
      
      // Parse message - có thể là object hoặc string
      if (typeof message === 'string') {
        const parsed = JSON.parse(message);
        users = parsed.users || parsed.data?.users || [];
      } else if (message.body) {
        const parsed = JSON.parse(message.body);
        users = parsed.users || parsed.data?.users || [];
      } else {
        users = message.users || message.data?.users || [];
      }

      if (!Array.isArray(users) || users.length === 0) {
        return;
      }

      const currentUserId = currentUser?.id || currentUser?.username;
      
      // Lọc ra những user khác (không bao gồm chính mình)
      const otherUsers = users.filter(u => {
        const uid = u.id || u.userId || u.username;
        return uid && uid !== currentUserId;
      });

      // Cập nhật participants
      setParticipants(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newUsers = otherUsers.filter(u => {
          const uid = u.id || u.userId || u.username;
          return uid && !existingIds.has(uid);
        });
        return [...prev, ...newUsers];
      });

      // Tạo offer cho TẤT CẢ users hiện có trong room (chỉ khi đã có localStream)
      if (localStream && webrtcService.localStream) {
        console.log('📤 Creating offers for', otherUsers.length, 'users');
        for (const user of otherUsers) {
          const userId = user.id || user.userId || user.username;
          if (!userId) continue;

          try {
            // Kiểm tra xem đã có peer connection chưa
            if (!webrtcService.hasPeerConnection(userId)) {
              console.log('📤 Creating offer for:', userId);
              const offer = await webrtcService.createOffer(userId);
              
              if (offer) {
                console.log('✅ Offer created, sending to:', userId);
                await sendSignalSafely({
                  type: 'offer',
                  offer: offer,
                  targetUserId: userId
                });
                console.log('✅ Offer sent to:', userId);
              } else {
                console.warn('⚠️ No offer created for:', userId);
              }
            } else {
              console.log('ℹ️ Peer connection already exists for:', userId);
            }
          } catch (error) {
            console.error(`❌ Error creating offer for ${userId}:`, error);
          }
        }
      } else {
        console.warn('⚠️ Cannot create offers - localStream missing:', {
          localStream: !!localStream,
          webrtcLocalStream: !!webrtcService.localStream
        });
      }
    } catch (error) {
      console.error('❌ Error handling presence message:', error);
    }
  };

  // 🆕 FIX: Xử lý user join
  const handleUserJoin = async (user) => {
    const userId = user.id || user.userId || user.username;
    if (!userId) return;

    const currentUserId = currentUser?.id || currentUser?.username;
    if (userId === currentUserId) return;

    // Thêm vào participants - đảm bảo không trùng lặp
    setParticipants(prev => {
      const exists = prev.find(p => {
        const pid = p.id || p.userId || p.username;
        return pid === userId;
      });
      if (exists) return prev;
      // 🔥 FIX: Đảm bảo user object có đầy đủ thông tin
      return [...prev, {
        id: userId,
        userId: userId,
        username: user.username || user.userId || userId,
        fullName: user.fullName || user.username || userId,
        ...user
      }];
    });

    // Tạo offer cho user mới (chỉ nếu chưa có peer connection và đã có localStream)
    if (!localStream || !webrtcService.localStream) {
      return;
    }

    try {
      if (!webrtcService.hasPeerConnection(userId)) {
        console.log('📤 User joined, creating offer for:', userId);
        const offer = await webrtcService.createOffer(userId);
        
        if (offer) {
          console.log('✅ Offer created for new user:', userId);
          await sendSignalSafely({
            type: 'offer',
            offer: offer,
            targetUserId: userId
          });
          console.log('✅ Offer sent to new user:', userId);
        } else {
          console.warn('⚠️ No offer created for new user:', userId);
        }
      } else {
        console.log('ℹ️ Peer connection already exists for new user:', userId);
      }
      
    } catch (error) {
      console.error('❌ Create offer error:', error);
    }
  };

  // 🆕 FIX: Xử lý offer - SỬA để lấy userId đúng cách
  const handleOffer = async (data) => {
    // 🔥 QUAN TRỌNG: Ưu tiên fromUserId
    const userId = data.fromUserId || data.user?.id || data.userId;

    if (!userId) {
      console.error('❌ Offer missing userId:', data);
      return;
    }

    // 🔥 DEBUG: Log để kiểm tra
    console.log('📥 Received OFFER from:', userId, data);

    try {
      const answer = await webrtcService.handleOffer(userId, data.offer);
      
      if (answer) {
        console.log('✅ Created ANSWER for:', userId);
        await sendSignalSafely({
          type: 'answer', 
          answer: answer,
          targetUserId: userId
        });
        console.log('✅ Sent ANSWER to:', userId);
      } else {
        console.warn('⚠️ No answer created for:', userId);
      }
      
    } catch (error) {
      // Chỉ log lỗi thực sự, bỏ qua InvalidStateError khi state là stable
      if (error.name !== 'InvalidStateError' || error.message?.includes('stable')) {
        console.error('❌ Handle offer error:', error);
      }
    }
  };

  // 🆕 FIX: Xử lý answer - SỬA để lấy userId đúng cách
  const handleAnswer = async (data) => {
    // 🔥 QUAN TRỌNG: Ưu tiên fromUserId
    const userId = data.fromUserId || data.user?.id || data.userId;
    
    if (!userId) {
      console.error('❌ Answer missing userId:', data);
      return;
    }
    
    // 🔥 DEBUG: Log để kiểm tra
    console.log('📥 Received ANSWER from:', userId, data);
    
    try {
      await webrtcService.handleAnswer(userId, data.answer);
      console.log('✅ Processed ANSWER from:', userId);
    } catch (error) {
      // Chỉ log lỗi thực sự, bỏ qua InvalidStateError khi state là stable
      if (error.name !== 'InvalidStateError' || error.message?.includes('stable')) {
        console.error('❌ Handle answer error:', error);
      }
    }
  };

  // 🆕 FIX: Xử lý ICE candidate - SỬA để lấy userId đúng cách
  const handleIceCandidate = async (data) => {
    // 🔥 QUAN TRỌNG: Ưu tiên fromUserId, sau đó mới đến user.id
    const userId = data.fromUserId || data.user?.id || data.userId || data.targetUserId;
    
    if (!userId) {
      console.warn('⚠️ ICE candidate missing userId:', data);
      return;
    }
    
    // Bỏ qua nếu là từ chính mình
    const currentUserId = currentUser?.id || currentUser?.username;
    if (userId === currentUserId) {
      return;
    }
    
    // 🔥 DEBUG: Chỉ log mỗi 10 candidates để không spam
    if (Math.random() < 0.1) {
      console.log('📥 Received ICE candidate from:', userId);
    }
    
    try {
      await webrtcService.handleIceCandidate(userId, data.candidate);
    } catch (error) {
      // Bỏ qua lỗi thông thường của ICE candidate
      if (error.name !== 'OperationError' && error.name !== 'InvalidStateError') {
        console.warn('⚠️ Error handling ICE candidate:', error);
      }
    }
  };

  // 🆕 FIX: Xử lý user leave
  const handleUserLeave = (user) => {
    // 🔥 FIX: Thêm fallback như các hàm khác
    const userId = user?.id || user?.userId || user?.username;
    
    if (!userId) {
      console.warn('⚠️ User leave missing userId:', user);
      return;
    }

    // Xóa khỏi participants - sử dụng fallback để match
    setParticipants(prev => prev.filter(p => {
      const pid = p.id || p.userId || p.username;
      return pid !== userId;
    }));
    
    // Đóng peer connection
    webrtcService.closePeerConnection(userId);
    
    // Xóa remote stream
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  };

  // 🆕 FIX: Cleanup function
  const cleanup = () => {
    if (cleanupInProgress.current) return;
    cleanupInProgress.current = true;

    // Dừng local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }

    // Cleanup WebRTC
    webrtcService.cleanup();

    // Gửi leave signal
    if (socketService.isConnected && roomId) {
      sendSignalSafely({ type: 'leave' }).catch(() => {});
      socketService.leaveRoom(roomId, currentUser?.username).catch(() => {});
    }

    // Reset state
    setRemoteStreams(new Map());
    setParticipants([]);
    setConnectionStatus('disconnected');
    setPermissionStatus('idle');
    setIsInitialized(false);
    setShowPermissionModal(false);

    cleanupInProgress.current = false;
  };

  // 🆕 FIX: Toggle functions đơn giản hơn
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      const newMutedState = !audioTracks[0]?.enabled;
      
      audioTracks.forEach(track => {
        track.enabled = newMutedState;
      });
      
      setIsMuted(!newMutedState);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const newVideoState = !videoTracks[0]?.enabled;
      
      videoTracks.forEach(track => {
        track.enabled = newVideoState;
      });
      
      setIsVideoOff(!newVideoState);
    }
  };

  const toggleScreenShare = async () => {
    // 🆕 FIX: Chỉ cho phép screen share trong video call
    if (!isVideoCall) {
      alert('Chia sẻ màn hình chỉ khả dụng trong cuộc gọi video.');
      return;
    }
    
    try {
      if (isScreenSharing) {
        // Dừng chia sẻ màn hình, quay lại camera
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        setLocalStream(cameraStream);
        setIsScreenSharing(false);
        
      } else {
        // Bắt đầu chia sẻ màn hình
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true
        });

        setLocalStream(screenStream);
        setIsScreenSharing(true);

        // Tự động dừng khi user dừng chia sẻ
        screenStream.getTracks()[0].onended = () => {
          if (isScreenSharing) {
            toggleScreenShare();
          }
        };
      }
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        console.error('❌ Screen share error:', error);
        alert('Lỗi khi chia sẻ màn hình: ' + error.message);
      }
    }
  };

  // 🆕 FIX: Helper functions
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Đã kết nối';
      case 'connecting': return 'Đang kết nối...';
      case 'failed': return 'Lỗi kết nối';
      default: return 'Ngắt kết nối';
    }
  };

  // 🆕 FIX: Video Grid Component - hỗ trợ cả video và voice call
  const VideoGrid = () => {
    const totalParticipants = 1 + participants.length; // Local + remote
    const remoteVideos = Array.from(remoteStreams.entries());

    const getGridConfig = () => {
      if (totalParticipants === 1) return "grid-cols-1 max-w-2xl mx-auto";
      if (totalParticipants === 2) return "grid-cols-2";
      return "grid-cols-2 lg:grid-cols-2";
    };

    const getVideoSize = () => {
      if (totalParticipants === 1) return "h-96";
      if (totalParticipants === 2) return "h-80";
      return "h-64";
    };

    return (
      <div className="flex-1 bg-gray-900 p-4 overflow-auto">
        <div className={`grid ${getGridConfig()} gap-4 h-full`}>
          {/* Local Video/Audio */}
          <div className={`relative bg-black rounded-xl overflow-hidden border-2 ${isScreenSharing ? 'border-yellow-500' : 'border-blue-500'} ${getVideoSize()}`}>
            {isVideoCall && localStream?.getVideoTracks().length > 0 ? (
              <>
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
              </>
            ) : (
              // Voice call: hiển thị avatar thay vì video
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              👤 {currentUser?.fullName || 'Bạn'} {isScreenSharing && '🖥️'}
            </div>
            {isMuted && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs">
                🔇 MUTE
              </div>
            )}
          </div>

          {/* Remote Videos/Audio */}
          {remoteVideos.map(([userId, stream]) => {
            const participant = participants.find(p => p.id === userId);
            const hasVideo = stream && stream.getVideoTracks().length > 0;
            
            return (
              <div key={userId} className={`relative bg-black rounded-xl overflow-hidden border-2 border-green-500 ${getVideoSize()}`}>
                {hasVideo ? (
                  <video
                    autoPlay
                    playsInline
                    muted={false}
                    className="w-full h-full object-cover"
                    ref={(videoRef) => {
                      // 🔥 QUAN TRỌNG: Set srcObject mỗi lần render để đảm bảo video được cập nhật
                      if (videoRef && stream) {
                        // Chỉ set lại nếu khác nhau để tránh re-render không cần thiết
                        if (videoRef.srcObject !== stream) {
                          videoRef.srcObject = stream;
                          // 🔥 Đảm bảo video play
                          videoRef.play().catch(err => {
                            // Bỏ qua lỗi play nếu đã bị pause hoặc không ready
                            if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
                              console.warn('Video play error:', err);
                            }
                          });
                        }
                      }
                    }}
                  />
                ) : (
                  // Voice call: hiển thị avatar
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {(participant?.fullName || participant?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                  👥 {participant?.fullName || participant?.username || userId || 'Remote'}
                </div>
                <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 🆕 FIX: Permission Modal
  const PermissionModal = () => {
    if (!showPermissionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl max-w-md w-full p-8 text-center border border-gray-600">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            {isVideoCall ? (
              <Camera className="h-10 w-10 text-blue-400" />
            ) : (
              <Mic className="h-10 w-10 text-blue-400" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">
            Cho phép truy cập
          </h3>
          
          <p className="text-gray-300 mb-8 text-lg">
            {isVideoCall 
              ? 'Để tham gia cuộc gọi video, vui lòng cho phép truy cập camera và microphone.'
              : 'Để tham gia cuộc gọi thoại, vui lòng cho phép truy cập microphone.'}
          </p>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowPermissionModal(false);
                onEndCall();
              }}
              className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-all font-medium"
            >
              Hủy
            </button>
            
            <button
              onClick={requestMediaPermission}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center space-x-2"
            >
              {isVideoCall ? (
                <>
                  <Camera className="h-5 w-5" />
                  <span>Cho phép</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span>Cho phép</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 🆕 FIX: Render logic đơn giản hơn
  if (!isActive) {
    return null;
  }

  // Hiển thị permission modal đầu tiên
  if (showPermissionModal) {
    return <PermissionModal />;
  }

  // Hiển thị loading khi đang request permission
  if (permissionStatus === 'requesting') {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Đang kết nối...</h3>
          <p className="text-gray-400">
            {isVideoCall 
              ? 'Đang yêu cầu quyền truy cập camera và microphone'
              : 'Đang yêu cầu quyền truy cập microphone'}
          </p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi permission
  if (permissionStatus === 'denied') {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center border border-gray-600">
          {isVideoCall ? (
            <CameraOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
          ) : (
            <MicOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
          )}
          <h3 className="text-xl font-semibold text-white mb-2">Không thể truy cập</h3>
          <p className="text-gray-400 mb-6">
            {isVideoCall 
              ? 'Cần cấp quyền camera và microphone để tham gia cuộc gọi.'
              : 'Cần cấp quyền microphone để tham gia cuộc gọi.'}
          </p>
          <button
            onClick={onEndCall}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Thoát
          </button>
        </div>
      </div>
    );
  }

  // Main UI
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
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          {/* Chỉ hiển thị nút video và screen share trong video call */}
          {isVideoCall && (
            <>
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all ${
                  isVideoOff 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition-all ${
                  isScreenSharing 
                    ? 'bg-yellow-500 text-white shadow-lg' 
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                <Monitor className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoCall;
