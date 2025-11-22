import React, { useState, useEffect, useRef } from 'react';
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
  EyeOff,
  VideoOff 
} from 'lucide-react';
import socketService from '../services/socket';

import WebRTCService from '../services/WebRTCService'; 


const ProfessionalVideoCall = ({ roomId, currentUser, isHost, onEndCall }) => {
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false); 
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [roomSettings, setRoomSettings] = useState({
    allowScreenShare: true,
    allowChat: true,
    isLocked: false,
    maxParticipants: 50
  });

  const localVideoRef = useRef(null);
  useEffect(() => {
    // 1. Khởi tạo media và socket
    initializeCall();
    
    // 2. Cài đặt các callback cho WebRTCService
    // Đây là cầu nối giữa Service (logic) và Component (UI)
    setupServiceCallbacks();

    // 3. Hàm dọn dẹp khi component unmount
    return () => cleanup();
  }, [roomId, currentUser]); // Thêm dependency

  // ---- LOGIC MỚI: CÀI ĐẶT SERVICE ---- 
  /**
   * Cài đặt các hàm callback để WebRTCService có thể
   * "nói chuyện" ngược lại với React Component
   */
  const setupServiceCallbacks = () => {
    WebRTCService.setRoomId(roomId);

    // KHI CÓ STREAM TỪ NGƯỜI KHÁC: Cập nhật state để React render
    WebRTCService.setOnRemoteStream((userId, stream) => {
      console.log('Component: Nhận remote stream từ', userId);
      setRemoteStreams(prev => new Map(prev).set(userId, stream));
    });

    // KHI SERVICE TẠO ICE CANDIDATE: Gửi nó qua socket - THÊM fromUserId
    WebRTCService.setOnIceCandidate((userId, candidate) => {
      // 🔇 Giảm log - không log mỗi ICE candidate
      // console.log('Component: Gửi ICE candidate cho', userId);
      socketService.sendSignal(roomId, {
        type: 'ice-candidate',
        candidate: candidate,
        fromUserId: currentUser.id, // 🔥 QUAN TRỌNG: Đảm bảo có fromUserId
        targetUserId: userId,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.fullName
        }
      });
    });

    // (Tùy chọn) Theo dõi trạng thái kết nối
    WebRTCService.setOnConnectionStateChange((userId, state) => {
      console.log('Component: Trạng thái kết nối với', userId, ':', state);
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        // Xóa stream của người đó nếu kết nối hỏng
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      }
    });
  };
  // ⬆️ ---- KẾT THÚC LOGIC MỚI ---- ⬆️

  const initializeCall = async () => {
    try {
      // 1. Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // ---- THAY ĐỔI QUAN TRỌNG ----
      // 2. Đưa local stream cho WebRTCService quản lý
      WebRTCService.setLocalStream(stream);
      // ---- KẾT THÚC THAY ĐỔI ----

      // 3. Join room signaling
      await joinRoomSignaling();
      
    } catch (error) {
      console.error('Lỗi khi truy cập media:', error);
    }
  };

  const joinRoomSignaling = async () => {
    if (!socketService.isConnected) {
      await socketService.connect();
    }

    // ---- THAY ĐỔI LOGIC ----
    // 1. Lắng nghe các tín hiệu WebRTC (offer, answer, ice...)
    socketService.subscribeToSignaling(roomId, handleSignalingMessage);

    // 2. Lắng nghe tín hiệu Presence (ai đang trong phòng)
    // Server (Java) gửi danh sách user qua topic "/topic/presence/{roomId}"
    socketService.subscribeToPresence(roomId, handlePresenceMessage);

    
    // 3. Gửi tín hiệu 'join' để báo cho mọi người
    socketService.sendSignal(roomId, {
      type: 'join',
      user: currentUser, // user object được controller xử lý
      fromUserId: currentUser.id // Thêm fromUserId để controller dễ xử lý
    });
  };

  // ⬇️ ---- LOGIC MỚI: XỬ LÝ PRESENCE ---- ⬇️
  /**
   * Xử lý tin nhắn từ topic /presence/ (do WebRTCSignalController.java gửi)
   * Cập nhật danh sách 'participants' để hiển thị
   */
  const handlePresenceMessage = (frame) => {
    try {
      const data = JSON.parse(frame.body);
      if (data.type === 'webrtc_presence_update' && data.users) {
        // Lọc ra những người khác, không bao gồm bản thân
        const otherUsers = data.users.filter(u => u.id !== currentUser.id);
        setParticipants(otherUsers);
        console.log('Cập nhật presence, có', otherUsers.length, 'người khác');
      }
    } catch (error) {
      console.error('Lỗi xử lý presence message:', error);
    }
  };


  const handleSignalingMessage = async (frame) => {
    try {
      const data = JSON.parse(frame.body);
      
      // ⬇️ ---- THAY ĐỔI LOGIC: UỶ THÁC CHO SERVICE ---- ⬇️
      // Controller đã thêm 'fromUserId', dùng nó để biết tin nhắn từ ai
      const fromUserId = data.fromUserId;

      // Bỏ qua tin nhắn do chính mình gửi (server broadcast lại)
      if (!fromUserId || fromUserId === currentUser.id) {
        return;
      }
      
      switch (data.type) {
        // MỘT NGƯỜI MỚI JOIN: Tôi (người cũ) sẽ tạo offer gửi cho họ
        case 'join':
          console.log('User mới join:', fromUserId, '-> Đang tạo offer...');
          // Dùng service tạo offer
          const offer = await WebRTCService.createOffer(fromUserId);
          // Gửi offer cho người mới
          socketService.sendSignal(roomId, {
            type: 'offer',
            offer: offer,
            fromUserId: currentUser.id,
            targetUserId: fromUserId
          });
          break;

        // MỘT NGƯỜI RỜI PHÒNG:
        case 'leave':
          console.log('User rời phòng:', fromUserId);
          // Dùng service đóng kết nối
          WebRTCService.closePeerConnection(fromUserId);
          // Xóa stream của họ khỏi UI
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(fromUserId);
            return newMap;
          });
          break;
        
        // NHẬN ĐƯỢC OFFER (từ người mới join):
        case 'offer':
          console.log('Nhận offer từ:', fromUserId);
          // Dùng service xử lý offer và tạo answer
          const answer = await WebRTCService.handleOffer(fromUserId, data.offer);
          // Gửi answer lại cho họ
          socketService.sendSignal(roomId, {
            type: 'answer',
            answer: answer,
            fromUserId: currentUser.id,
            targetUserId: fromUserId
          });
          break;
        
        // NHẬN ĐƯỢC ANSWER (sau khi mình gửi offer):
        case 'answer':
          console.log('Nhận answer từ:', fromUserId);
          // Dùng service xử lý answer
          await WebRTCService.handleAnswer(fromUserId, data.answer);
          break;
        
        // NHẬN ĐƯỢC ICE CANDIDATE:
        case 'ice-candidate':
          // 🔥 QUAN TRỌNG: Đảm bảo có fromUserId, nếu không thì dùng fallback
          const candidateUserId = fromUserId || data.fromUserId || data.user?.id || data.userId;
          if (candidateUserId) {
            // Dùng service xử lý candidate
            await WebRTCService.handleIceCandidate(candidateUserId, data.candidate);
          } else {
            console.warn('⚠️ ICE candidate missing userId:', data);
          }
          break;
        
      // TODO: Xử lý 'screen-share'
      // Logic screen-share cũ bị lỗi (không thể gửi stream qua JSON)
      // Cần một cơ chế offer/answer mới cho track màn hình.
        case 'screen-share':
          console.warn('Chưa hỗ trợ screen share');
          break;
      }

    } catch (error) {
      console.error('Lỗi xử lý signaling message:', error);
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
    // TODO: Logic chia sẻ màn hình cần được làm lại
    // Cách làm đúng là thêm track màn hình vào các PeerConnection
    // và gửi lại offer (re-negotiation)
    console.error('Chức năng chia sẻ màn hình (toggleScreenShare) cần được viết lại!');
    alert('Chức năng chia sẻ màn hình đang được phát triển.');
  };

  const cleanup = () => {
    console.log('Đang dọn dẹp...');
   
    // 1. Dùng service để dọn dẹp mọi kết nối và stream
    WebRTCService.cleanup();
    
    // 2. Cập nhật UI
    setLocalStream(null);
    setRemoteStreams(new Map());
    setParticipants([]);
   
    
    // 3. Gửi tin hiệu 'leave'
    socketService.sendSignal(roomId, {
      type: 'leave',
      user: currentUser,
      fromUserId: currentUser.id
    });

    // 4. (Tùy chọn) Ngắt kết nối socket
    // socketService.disconnect();
    
    // 5. Gọi callback kết thúc cuộc gọi (nếu có)
    if (onEndCall) onEndCall();
  };

  // Đếm số người: (Bạn) + (những người khác)
  const getParticipantCount = () => participants.length + 1;

  // 
  // ----- PHẦN RENDER GIAO DIỆN (GIỮ NGUYÊN) -----
  //
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

      <div className="flex-1 flex" style={{ minHeight: 0 }}> {/* Fix cho overflow */}
        {/* Main Video Area */}
        <div className="flex-1 relative bg-gray-800">
          {/* Grid Layout for Participants */}
          <div className="absolute inset-0 p-4 overflow-y-auto"> {/* Thêm overflow-y-auto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Local Video */}
              <div className="relative bg-gray-700 rounded-lg overflow-hidden aspect-video"> {/* Thêm aspect-video */}
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
              {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
                const hasVideo = stream && stream.getVideoTracks().length > 0;
                
                return (
                  <div key={userId} className="relative bg-gray-700 rounded-lg overflow-hidden aspect-video">
                    {hasVideo ? (
                      <video
                        autoPlay
                        playsInline
                        muted={false}
                        className="w-full h-full object-cover"
                        ref={videoRef => {
                          // 🔥 QUAN TRỌNG: Set srcObject mỗi lần render để đảm bảo video được cập nhật
                          if (videoRef && stream) {
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
                      <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {(participants.find(p => p.id === userId)?.fullName || userId || 'U').charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {participants.find(p => p.id === userId)?.fullName || userId}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-gray-800 text-white border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Người tham gia ({getParticipantCount()})
              </h3>
            </div>
            
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {/* Current User */}
            _ <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
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
                    {/* TODO: Cần thêm logic để biết trạng thái mic/video của người khác */}
                    {/* <Mic className="h-3 w-3" /> */}
                    {/* <Video className="h-3 w-3" /> */}
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
        _           type="checkbox"
                    checked={roomSettings.allowScreenShare}
                    onChange={(e) => setRoomSettings(prev => ({ ...prev, allowScreenShare: e.target.checked }))}
                    className="rounded"
                  />
        _       </label>
                
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
  _         className={`p-3 rounded-full ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            disabled // Tạm thời vô hiệu hóa
            className={`p-3 rounded-full ${
              isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            } disabled:opacity-50`}
            title="Chức năng đang phát triển"
          >
            <Monitor className="h-6 w-6" />
          </button>

          <button
            onClick={cleanup} // Sửa: onClick={cleanup} thay vì onEndCall
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