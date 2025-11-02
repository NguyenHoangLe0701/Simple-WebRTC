import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Users,
  Settings,
  Mic,
  MicOff,
  PhoneOff,
  VideoOff,
  Monitor,
  Share2,
  FileText,
  Bot,
  LogOut,
  Crown,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Lock,
  Unlock
} from 'lucide-react';
import ProfessionalWaitingRoom from '../components/ProfessionalWaitingRoom';
import ProfessionalVideoCall from '../components/ProfessionalVideoCall';
import ProfessionalRoomManager from '../components/ProfessionalRoomManager';
import AIAssistant from '../components/AIAssistant';
import RoomApprovalOverlay from '../components/RoomApprovalOverlay';
import socketService from '../services/socket';
import api from '../services/api';

const ProfessionalChatRoom = () => {
  const { roomId = 'general' } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [showRoomManager, setShowRoomManager] = useState(false);
  const [showApprovalOverlay, setShowApprovalOverlay] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [roomSettings, setRoomSettings] = useState({
    allowScreenShare: true,
    allowChat: true,
    isLocked: false,
    maxParticipants: 50
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Emoji data
  const emojis = [
    '😀','😄','😁','😂','🤣','😊','😍','😘','😎','🤩',
    '👍','👏','🙏','🔥','💯','🎉','❤️','💙','😢','😡',
    '😴','🤔','🙌','✅','❌','⚠️','💡','🚀','⭐','🎯'
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    
    if (!user.id) {
      navigate('/login');
      return;
    }
    
    checkRoomAccess();
  }, [roomId, navigate]);

  const checkRoomAccess = async () => {
    try {
      const response = await api.get(`/api/rooms/${roomId}/info`);
      setRoomInfo(response.data);
      setIsHost(response.data.hostId === currentUser.id);
      
      // Check if user is approved or if it's a default room
      const defaultRooms = ['general', 'team', 'random', 'webrtc', 'support'];
      const isDefaultRoom = defaultRooms.includes(roomId);
      const isApprovedUser = response.data.approvedUsers?.includes(currentUser.id);
      const isPublicRoom = !response.data.isPrivate;
      
      if (isDefaultRoom || isApprovedUser || isPublicRoom || response.data.hostId === currentUser.id) {
        setIsApproved(true);
      } else {
        // Show approval overlay for private rooms
        setShowApprovalOverlay(true);
      }
    } catch (error) {
      console.error('Error checking room access:', error);
      // For default rooms, allow access even if API fails
      const defaultRooms = ['general', 'team', 'random', 'webrtc', 'support'];
      if (defaultRooms.includes(roomId)) {
        setIsApproved(true);
      } else {
        // Show approval overlay if room needs approval
        setShowApprovalOverlay(true);
      }
    }
  };

  useEffect(() => {
    if (!isApproved) return;

    let chatSub, presenceSub, signalSub;
    const username = currentUser?.fullName || currentUser?.username || 'User';
    
    (async () => {
      if (!socketService.isConnected) {
        try { 
          await socketService.connect(); 
        } catch (e) { 
          console.error('Socket connection error:', e); 
        }
      }
      
      setIsConnected(socketService.isConnected);
      
      // Join room and subscribe
      socketService.joinRoom(roomId, username);
      
      chatSub = socketService.subscribeToChat(roomId, (messageFrame) => {
        try {
          const payload = JSON.parse(messageFrame.body);
          setMessages(prev => [...prev, payload]);
        } catch (error) {
          console.error('Error parsing chat message:', error);
        }
      });
      
      presenceSub = socketService.subscribeToPresence(roomId, (messageFrame) => {
        try {
          const payload = JSON.parse(messageFrame.body);
          if (payload?.users) {
            setParticipants(payload.users.map(u => ({ 
              id: u.id || u.username, 
              name: u.fullName || u.username, 
              avatar: (u.fullName || u.username || 'U').charAt(0).toUpperCase(), 
              status: u.status || 'online' 
            })));
          }
        } catch (error) {
          console.error('Error parsing presence message:', error);
        }
      });
      
      signalSub = socketService.subscribeToSignaling(roomId, (frame) => {
        try {
          const data = JSON.parse(frame.body);
          if (data?.type === 'typing') {
            const key = data.userId || data.username;
            if (!key) return;
            setTypingUsers(prev => {
              const next = { ...prev };
              if (data.typing) {
                next[key] = { username: data.username, at: Date.now() };
              } else {
                delete next[key];
              }
              return next;
            });
          }
        } catch (error) {
          console.error('Error parsing signaling message:', error);
        }
      });
    })();

    return () => {
      try { 
        socketService.leaveRoom(roomId, username); 
      } catch (error) {
        console.error('Error leaving room:', error);
      }
      if (chatSub) socketService.unsubscribe(`/topic/chat/${roomId}`);
      if (presenceSub) socketService.unsubscribe(`/topic/presence/${roomId}`);
      if (signalSub) socketService.unsubscribe(`/topic/room/${roomId}`);
    };
  }, [roomId, currentUser, isApproved]);

  const sendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: currentUser?.fullName || currentUser?.username || 'User',
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
      roomId: roomId,
      files: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      replyTo: replyTo
    };

    try {
      await socketService.sendMessage(roomId, message);
      setNewMessage('');
      setSelectedFiles([]);
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startCall = (type) => {
    if (type === 'video') {
      setIsVideoCall(true);
      setIsVoiceCall(false);
    } else {
      setIsVoiceCall(true);
      setIsVideoCall(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'busy': return 'bg-red-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReply = (message) => {
    setReplyTo({
      id: message.id,
      sender: message.sender,
      content: message.content
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return date.toLocaleDateString();
  };

  // Show waiting room if not approved
  if (!isApproved && !showApprovalOverlay) {
    return (
      <ProfessionalWaitingRoom 
        roomId={roomId}
        currentUser={currentUser}
        onApproved={() => {
          setIsApproved(true);
          setShowApprovalOverlay(false);
        }}
        onRejected={() => navigate('/rooms')}
      />
    );
  }

  // Show room manager if requested
  if (showRoomManager) {
    return (
      <ProfessionalRoomManager 
        currentUser={currentUser}
        onJoinRoom={(roomId) => {
          setShowRoomManager(false);
          navigate(`/chat/${roomId}`);
        }}
        onCreateRoom={() => setShowRoomManager(false)}
      />
    );
  }

  return (
    <>
      {/* Approval Overlay */}
      {showApprovalOverlay && (
        <RoomApprovalOverlay
          roomId={roomId}
          currentUser={currentUser}
          isHost={isHost}
          onApproved={() => {
            setIsApproved(true);
            setShowApprovalOverlay(false);
          }}
          onRejected={() => navigate('/rooms')}
          onClose={() => setShowApprovalOverlay(false)}
        />
      )}

      {/* Video Call Overlay */}
      {isVideoCall && (
        <ProfessionalVideoCall
          roomId={roomId}
          currentUser={currentUser}
          isHost={isHost}
          onEndCall={() => setIsVideoCall(false)}
        />
      )}

      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Room Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                #
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">{roomId}</h1>
                <p className="text-sm text-gray-500">
                  {participants.length} thành viên • {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
                </p>
              </div>
            </div>
            
            {isHost && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowApprovalOverlay(true)}
                  className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg hover:bg-yellow-200 transition-colors"
                  title="Xem yêu cầu tham gia phòng"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="text-xs font-medium">Yêu cầu</span>
                </button>
                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg">
                  <Crown className="h-4 w-4" />
                  <span className="text-xs font-medium">Chủ phòng</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Thành viên ({participants.length})</h3>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {participant.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(participant.status)}`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{participant.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{participant.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => startCall('voice')}
            className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Gọi thoại</span>
          </button>
          
          <button
            onClick={() => startCall('video')}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Video className="h-4 w-4" />
            <span>Gọi video</span>
          </button>
          
          <button
            onClick={() => setShowAIAssistant(true)}
            className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Bot className="h-4 w-4" />
            <span>AI Assistant</span>
          </button>
          
          <button
            onClick={() => setShowRoomManager(true)}
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Quản lý phòng</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              #
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{roomId}</h1>
              <p className="text-sm text-gray-500">
                {participants.length} thành viên • {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => startCall('voice')}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Gọi thoại"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button
              onClick={() => startCall('video')}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Gọi video"
            >
              <Video className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowAIAssistant(true)}
              className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              title="AI Assistant"
            >
              <Bot className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3 hover:bg-gray-50/50 p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                {(message.sender || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">{message.sender}</span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.senderId === currentUser.id && (
                    <span className="text-xs text-blue-600">(Bạn)</span>
                  )}
                </div>
                
                {message.replyTo && (
                  <div className="bg-gray-100 rounded-lg p-2 mb-2 text-sm text-gray-600 border-l-4 border-blue-500">
                    <span className="font-medium">{message.replyTo.sender}:</span> {message.replyTo.content}
                  </div>
                )}
                
                <p className="text-gray-700 text-sm leading-relaxed">{message.content}</p>
                
                {message.files && message.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.files.map((file, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-blue-600">
                        <FileText className="h-4 w-4" />
                        <span>{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={() => handleReply(message)}
                    className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                  >
                    Trả lời
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
            <p className="text-sm text-blue-600">
              {Object.values(typingUsers).map(u => u.username).join(', ')} đang soạn tin...
            </p>
          </div>
        )}

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Files đã chọn:</span>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center space-x-1 bg-white px-2 py-1 rounded border">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4">
          {replyTo && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-800">Trả lời {replyTo.sender}:</span>
                  <p className="text-sm text-blue-600">{replyTo.content}</p>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-end space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Đính kèm file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50/50"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-40">
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() && selectedFiles.length === 0}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              title="Gửi tin nhắn"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant 
          isOpen={showAIAssistant} 
          onClose={() => setShowAIAssistant(false)} 
          onMinimize={() => {}} 
        />
      )}
    </div>
    </>
  );
};

export default ProfessionalChatRoom;
