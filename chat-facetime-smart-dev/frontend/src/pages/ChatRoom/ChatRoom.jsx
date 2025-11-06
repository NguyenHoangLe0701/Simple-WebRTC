import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Code, 
  Users, 
  Settings,
  Mic,
  MicOff,
  PhoneOff,
  VideoOff,
  Monitor,
  Share2,
  FileText,
  Image,
  Download,
  Bot,
  LogOut,
  Copy,
  Check
} from 'lucide-react';
import AIAssistant from '../../components/AIAssistant';
import EnhancedVideoCall from '../../components/EnhancedVideoCall';
import CodeEditor from '../../components/CodeEditor';
import { Virtuoso } from 'react-virtuoso';

// Import các hooks đã tạo
import useWebSocket from '../../hooks/useWebSocket';
import useRooms from '../../hooks/useRooms';
import useMessages from '../../hooks/useMessages';

// Notification Component
const Notification = ({ notification, onClose }) => {
  const { id, title, message, type = 'info', action } = notification;
  
  const getNotificationStyles = () => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      case 'error': return 'bg-red-50 border-red-500 text-red-700';
      case 'success': return 'bg-green-50 border-green-500 text-green-700';
      default: return 'bg-blue-50 border-blue-500 text-blue-700';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg shadow-lg border-l-4 ${getNotificationStyles()} max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105`}
      onClick={() => {
        if (action) {
          action();
        }
        onClose();
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <div className="flex-1">
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-sm mt-1">{message}</div>
            {action && (
              <div className="text-xs mt-2 text-blue-600 font-medium">
                Click để tham gia →
              </div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const ChatRoom = () => {
  const { roomId = '1' } = useParams(); // Mặc định roomId là số 1
  const navigate = useNavigate();
  
  // Đảm bảo roomId là số
  const numericRoomId = useMemo(() => {
    const id = parseInt(roomId, 10);
    return isNaN(id) ? 1 : id; // Fallback về room 1 nếu không phải số
  }, [roomId]);

  // User authentication
  const currentUser = useMemo(() => {
    try {
      const rawSession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('user') : null;
      const rawLocal = localStorage.getItem('user');
      const raw = rawSession || rawLocal;
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Sử dụng các hooks đã tạo
  const {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    joinRoom: wsJoinRoom,
    leaveRoom: wsLeaveRoom,
    subscribeToRoomMessages,
    subscribeToPresence,
    subscribeToTyping,
    unsubscribeFromRoom
  } = useWebSocket();

  const {
    rooms,
    currentRoom,
    roomMembers,
    loading: roomsLoading,
    error: roomsError,
    fetchUserRooms,
    createRoom,
    joinRoom: apiJoinRoom,
    leaveRoom: apiLeaveRoom,
    fetchRoomMembers,
    subscribeToRoomEvents
  } = useRooms();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    hasMore,
    typingUsers,
    sendMessage,
    addReaction,
    removeReaction,
    deleteMessage,
    updateMessage,
    searchMessages,
    startTyping,
    stopTyping,
    loadMoreMessages,
    messagesEndRef,
    clearError: clearMessagesError
  } = useMessages(numericRoomId);

  // State management
  const [newMessage, setNewMessage] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isAIMinimized, setIsAIMinimized] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Constants and refs
  const EMOJIS = useMemo(() => (
    ['😀','😄','😁','😂','🤣','😊','😍','😘','😎','🤩','👍','👏','🙏','🔥','💯','🎉','❤️','💙','😢','😡','😴','🤔','🙌','✅']
  ), []);
  
  const listRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ========== ENUM CONSTANTS ==========
  
  // RoomType enum từ backend
  const ROOM_TYPES = useMemo(() => ({
    GENERAL: 'GENERAL',
    TEAM: 'TEAM', 
    RANDOM: 'RANDOM',
    SUPPORT: 'SUPPORT',
    PRIVATE: 'PRIVATE',
    DIRECT_MESSAGE: 'DIRECT_MESSAGE'
  }), []);

  // MessageType enum từ backend  
  const MESSAGE_TYPES = useMemo(() => ({
    TEXT: 'TEXT',
    CODE: 'CODE',
    FILE: 'FILE',
    IMAGE: 'IMAGE',
    SYSTEM: 'SYSTEM'
  }), []);

  // UserStatus enum từ backend
  const USER_STATUS = useMemo(() => ({
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE', 
    AWAY: 'AWAY',
    BUSY: 'BUSY'
  }), []);

  // ========== WEBSOCKET CONNECTION MANAGEMENT ==========

  useEffect(() => {
    // Kết nối WebSocket khi component mount
    const initializeWebSocket = async () => {
      try {
        await connect();
        console.log('✅ WebSocket connected successfully');
      } catch (error) {
        console.error('❌ Failed to connect WebSocket:', error);
        showNotification({
          title: '❌ Lỗi kết nối',
          message: 'Không thể kết nối real-time. Một số tính năng có thể bị hạn chế.',
          type: 'error',
          duration: 5000
        });
      }
    };

    if (currentUser) {
      initializeWebSocket();
    }

    return () => {
      // Cleanup khi component unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [connect, currentUser]);

  // ========== ROOM MANAGEMENT ==========

  // Tham gia phòng khi roomId thay đổi
  useEffect(() => {
    if (isConnected && currentUser && numericRoomId) {
      // Tham gia phòng qua WebSocket
      const userData = {
        id: currentUser.id || currentUser.userId,
        username: currentUser.username,
        fullName: currentUser.fullName,
        email: currentUser.email
      };
      
      const joinSuccess = wsJoinRoom(numericRoomId, userData);
      
      if (joinSuccess) {
        console.log(`✅ Joined room ${numericRoomId} via WebSocket`);
        
        // Tham gia phòng qua API (nếu cần)
        apiJoinRoom(numericRoomId, userData).catch(err => {
          console.warn('⚠️ API join room failed:', err);
        });
      }
    }

    return () => {
      // Rời phòng khi component unmount hoặc roomId thay đổi
      if (currentUser && numericRoomId) {
        wsLeaveRoom(numericRoomId, currentUser.username);
        unsubscribeFromRoom(numericRoomId);
      }
    };
  }, [isConnected, numericRoomId, currentUser, wsJoinRoom, wsLeaveRoom, unsubscribeFromRoom, apiJoinRoom]);

  // ========== MESSAGE HANDLING ==========

  /**
   * Gửi tin nhắn mới - ĐÃ SỬA THEO MessageRequest DTO
   */
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const messageData = {
      content: newMessage.trim(),
      type: MESSAGE_TYPES.TEXT, // Sử dụng enum từ backend
      replyToId: replyTo ? replyTo.id : undefined // Sửa theo DTO: replyToId là Long
    };

    sendMessage(messageData)
      .then(result => {
        if (result) {
          console.log('✅ Message sent via REST API');
        } else {
          console.log('✅ Message sent via WebSocket');
        }
      })
      .catch(error => {
        console.error('❌ Failed to send message:', error);
        showNotification({
          title: '❌ Lỗi gửi tin nhắn',
          message: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
          type: 'error',
          duration: 3000
        });
      });

    setNewMessage('');
    setReplyTo(null);
    stopTyping(); // Dừng typing indicator sau khi gửi
  }, [newMessage, replyTo, sendMessage, stopTyping, MESSAGE_TYPES]);

  /**
   * Gửi code từ CodeEditor - ĐÃ SỬA THEO MessageRequest DTO
   */
  const handleSendCode = useCallback((codeData) => {
    const messageData = {
      content: codeData.content,
      type: MESSAGE_TYPES.CODE, // Sử dụng enum từ backend
      language: codeData.language,
      fileName: codeData.fileName
    };

    sendMessage(messageData)
      .then(result => {
        console.log('✅ Code message sent');
      })
      .catch(error => {
        console.error('❌ Failed to send code message:', error);
        showNotification({
          title: '❌ Lỗi gửi mã',
          message: 'Không thể gửi mã code. Vui lòng thử lại.',
          type: 'error',
          duration: 3000
        });
      });
  }, [sendMessage, MESSAGE_TYPES]);

  /**
   * Xử lý typing indicators
   */
  const handleTypingStart = useCallback(() => {
    startTyping();
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1200);
  }, [startTyping]);

  const handleTypingStop = useCallback(() => {
    stopTyping();
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [stopTyping]);

  // ========== FILE UPLOAD HANDLING ==========

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', numericRoomId.toString());

    // Xác định loại tin nhắn dựa trên file type
    const isImage = file.type.startsWith('image/');
    const messageType = isImage ? MESSAGE_TYPES.IMAGE : MESSAGE_TYPES.FILE;

    // Hiển thị preview cho ảnh
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, { 
          name: file.name, 
          size: file.size, 
          dataUrl: e.target.result 
        }]);
      };
      reader.readAsDataURL(file);
    }

    // Tạo message data theo DTO
    const messageData = {
      content: file.name,
      type: messageType,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
      // fileUrl sẽ được set sau khi upload thành công
    };

    // TODO: Gọi API upload file trước, sau đó gửi message với fileUrl
    console.log(`📁 Uploading ${messageType.toLowerCase()}:`, file.name);
    
    showNotification({
      title: '📤 Đang upload file',
      message: `Đang upload ${file.name}...`,
      type: 'info',
      duration: 3000
    });

    // Tạm thời gửi message không có fileUrl
    sendMessage(messageData).catch(error => {
      console.error('❌ Failed to send file message:', error);
    });

  }, [numericRoomId, sendMessage, MESSAGE_TYPES]);

  // ========== ROOM OPERATIONS ==========

  /**
   * Tạo phòng mới với ID ngẫu nhiên (số) - ĐÃ SỬA THEO RoomRequest DTO VÀ ENUM
   */
  const generateRoomCode = useCallback(async () => {
    try {
      // Tạo room ID ngẫu nhiên (số)
      const randomRoomId = Math.floor(100000 + Math.random() * 900000); // 6 chữ số
      
      const roomData = {
        name: `Room ${randomRoomId}`, // @NotBlank, @Size 1-50
        description: `Phòng chat được tạo bởi ${currentUser?.fullName || currentUser?.username}`, // @Size max 255
        type: ROOM_TYPES.PRIVATE // Sử dụng enum từ backend - CHỈNH SỬA QUAN TRỌNG
      };

      showNotification({
        title: '🔄 Đang tạo phòng...',
        message: `Đang tạo phòng ${randomRoomId}`,
        type: 'info',
        duration: 3000
      });

      // Tạo phòng qua API
      const newRoom = await createRoom(roomData,localStorage.getItem("userId"));
      
      showNotification({
        title: '✅ Phòng đã tạo',
        message: `Đã tạo phòng ${newRoom.name} thành công!`,
        type: 'success',
        duration: 3000
      });

      // Chuyển hướng đến phòng mới
      setTimeout(() => {
        navigate(`/chat/${newRoom.id}`);
      }, 1000);

    } catch (error) {
      console.error('❌ Failed to create room:', error);
      showNotification({
        title: '❌ Lỗi tạo phòng',
        message: 'Không thể tạo phòng. Vui lòng thử lại.',
        type: 'error',
        duration: 5000
      });
    }
  }, [createRoom, currentUser, navigate, ROOM_TYPES]);

  /**
   * Tham gia phòng bằng mã số
   */
  const joinByCode = useCallback(() => {
    const code = String(joinRoomCode || '').trim();
    if (!code) return;

    // Chuyển đổi mã phòng thành số
    const roomId = parseInt(code, 10);
    if (isNaN(roomId)) {
      showNotification({
        title: '❌ Mã phòng không hợp lệ',
        message: 'Mã phòng phải là số. Vui lòng kiểm tra lại.',
        type: 'error',
        duration: 3000
      });
      return;
    }

    navigate(`/chat/${roomId}`);
    setJoinRoomCode('');
  }, [joinRoomCode, navigate]);

  // ========== CALL MANAGEMENT ==========

  const startVideoCall = useCallback(() => {
    setIsVideoCall(true);
    setIsVoiceCall(false);
    console.log('🎥 Starting video call');
  }, []);

  const startVoiceCall = useCallback(() => {
    setIsVoiceCall(true);
    setIsVideoCall(false);
    console.log('📞 Starting voice call');
  }, []);

  const endCall = useCallback(() => {
    setIsVideoCall(false);
    setIsVoiceCall(false);
    setIsScreenSharing(false);
    console.log('📵 Ending call');
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    console.log(isMuted ? '🔊 Unmuted' : '🔇 Muted');
  }, [isMuted]);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing(!isScreenSharing);
    console.log(isScreenSharing ? '🖥️ Stopped screen share' : '🖥️ Started screen share');
  }, [isScreenSharing]);

  // ========== UTILITY FUNCTIONS ==========

  const formatTime = useCallback((date) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) {
        return 'Vừa xong';
      }
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Vừa xong';
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case USER_STATUS.ONLINE: return 'bg-green-500';
      case USER_STATUS.AWAY: return 'bg-yellow-500';
      case USER_STATUS.BUSY: return 'bg-orange-500';
      case USER_STATUS.OFFLINE: return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  }, [USER_STATUS]);

  const copyRoomLink = useCallback(async () => {
    const roomLink = `${window.location.origin}/chat/${numericRoomId}`;
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      
      showNotification({
        title: '✅ Đã copy link',
        message: 'Link phòng đã được sao chép vào clipboard',
        type: 'success',
        duration: 2000
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [numericRoomId]);

  const shareRoom = useCallback(() => {
    setShowShareModal(true);
    copyRoomLink();
  }, [copyRoomLink]);

  // ========== NOTIFICATION MANAGEMENT ==========

  const showNotification = useCallback(({ title, message, type = 'info', action = null, duration = 5000 }) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = {
      id,
      title,
      message,
      type,
      action
    };

    setNotifications(prev => [...prev, notification]);

    // Tự động xóa notification sau duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // ========== DRAG & DROP HANDLING ==========

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const onDragOver = (e) => { 
      e.preventDefault(); 
      el.classList.add('ring-2', 'ring-blue-400'); 
    };
    
    const onDragLeave = (e) => { 
      e.preventDefault(); 
      el.classList.remove('ring-2', 'ring-blue-400'); 
    };
    
    const onDrop = (e) => {
      e.preventDefault();
      el.classList.remove('ring-2', 'ring-blue-400');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        handleFileUpload({ target: { files: [file] } });
      }
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);
    
    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [handleFileUpload]);

  // ========== AUTO-FETCH ROOMS ==========

  useEffect(() => {
    if (currentUser) {
      fetchUserRooms().catch(err => {
        console.error('❌ Failed to fetch user rooms:', err);
      });
    }
  }, [currentUser, fetchUserRooms]);

  // ========== REDIRECT IF NOT AUTHENTICATED ==========

  useEffect(() => {
    if (!currentUser) {
      if (numericRoomId && numericRoomId !== 1) {
        sessionStorage.setItem('redirectAfterLogin', `/chat/${numericRoomId}`);
      }
      navigate('/login');
    }
  }, [currentUser, navigate, numericRoomId]);

  // Hiển thị loading nếu chưa có user
  if (!currentUser) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ========== RENDER COMPONENT ==========

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r flex flex-col">
        {/* Current user card */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                  {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-1 -right-1 inline-block w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{currentUser?.fullName || currentUser?.username || 'User'}</p>
                <p className="text-xs text-gray-500">
                  {isConnected ? 'Đã kết nối' : 'Đang kết nối...'} • {connectionStatus}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(v => !v)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Cài đặt"
              >
                <Settings className="h-4 w-4" />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      disconnect();
                      if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.removeItem('token');
                        sessionStorage.removeItem('user');
                      }
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar search */}
        <div className="p-3 border-b">
          <input
            type="text"
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            placeholder="Tìm phòng hoặc người..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value)}
              placeholder="Nhập mã phòng (số)..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={joinByCode}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Vào
            </button>
          </div>
          <button
            onClick={generateRoomCode}
            disabled={roomsLoading}
            className="mt-2 w-full text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {roomsLoading ? 'Đang tạo...' : 'Tạo phòng ngẫu nhiên'}
          </button>
        </div>
        
        {/* Channels */}
        <div className="p-3 border-b">
          <h2 className="text-xs font-semibold text-gray-500 mb-2">Phòng của bạn</h2>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {roomsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              rooms
                .filter(room => room.name.toLowerCase().includes(sidebarQuery.toLowerCase()))
                .map((room) => (
                  <div 
                    key={room.id} 
                    onClick={() => navigate(`/chat/${room.id}`)}
                    className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      room.id === numericRoomId ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    #{room.name} ({room.id})
                  </div>
                ))
            )}
          </div>
        </div>
        
        {/* Room Members */}
        <div className="flex-1 p-4 border-t overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Thành viên ({roomMembers.length})
          </h3>
          <div className="space-y-2">
            {roomMembers.map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm font-medium">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 inline-block w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                </div>
                <span className="text-sm">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div ref={dropRef} className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full items-center justify-center text-white font-bold flex">
                {numericRoomId.toString().charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                Phòng: {currentRoom?.name || `Room ${numericRoomId}`}
              </h2>
              <p className="text-sm text-gray-500">
                {roomMembers.length} thành viên
                {isConnected && <span className="ml-2 text-green-500">• Đã kết nối</span>}
                {!isConnected && <span className="ml-2 text-yellow-500">• Đang kết nối...</span>}
              </p>
              {/* Online members strip */}
              {roomMembers.length > 0 && (
                <div className="mt-2 flex items-center gap-2 overflow-x-auto pr-2">
                  {roomMembers.map(u => (
                    <div key={u.id} className="relative group" title={u.name}>
                      <div className="w-7 h-7 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs font-medium">
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 inline-block w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(u.status)}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer select-none">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block">{currentUser?.fullName || currentUser?.username || 'User'}</span>
              </div>
            </div>
            <button 
              onClick={shareRoom}
              className={`p-2 rounded-lg transition-colors ${copiedLink ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title={copiedLink ? "Đã copy link!" : "Chia sẻ phòng"}
            >
              {copiedLink ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => setShowAIAssistant(!showAIAssistant)} 
              className={`p-2 rounded-lg transition-colors ${showAIAssistant ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} 
              title="AI Assistant"
            >
              <Bot className="h-5 w-5" />
            </button>
            <button 
              onClick={startVoiceCall}
              className={`p-2 rounded-lg transition-colors ${isVoiceCall ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title="Gọi thoại"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button 
              onClick={startVideoCall}
              className={`p-2 rounded-lg transition-colors ${isVideoCall ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title="Gọi video"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Quick search inline */}
          {sidebarQuery && (
            <div className="px-4 py-2 text-xs text-gray-500 bg-white border-b">
              Đang tìm kiếm: "{sidebarQuery}"
            </div>
          )}
          
          {/* Loading State */}
          {messagesLoading && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Đang tải tin nhắn...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {messages.length === 0 && !messagesLoading && !sidebarQuery && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
                <p className="text-sm mt-2">Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {messagesError && (
            <div className="p-4 bg-red-50 border border-red-200 m-4 rounded-lg">
              <p className="text-red-700 text-sm">{messagesError}</p>
              <button
                onClick={clearMessagesError}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Đóng
              </button>
            </div>
          )}
          
          {/* Messages List */}
          {messages.length > 0 && (
            <>
              <Virtuoso
                key={numericRoomId}
                ref={listRef}
                data={messages.filter(m =>
                  !sidebarQuery || 
                  String(m.content).toLowerCase().includes(sidebarQuery.toLowerCase()) ||
                  String(m.sender).toLowerCase().includes(sidebarQuery.toLowerCase())
                )}
                itemContent={(index, message) => {
                  const isOwn = (currentUser?.id || currentUser?.username) === (message.senderId || message.sender);

                  return (
                    <div className="px-4 py-2 group">
                      <div className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {!isOwn && (
                          <div className="mr-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            {message.avatar || (message.sender || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`max-w-[72%] ${isOwn ? 'text-right' : 'text-left'}`}>
                          <div className={`mb-1 flex items-center gap-2 text-xs ${isOwn ? 'justify-end' : 'justify-start'} text-gray-500`}>
                            {!isOwn && <span className="font-medium text-gray-700">{message.sender}</span>}
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                          
                          {/* Message Content */}
                          <div className={`${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} inline-block px-3 py-2 rounded-2xl ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                            {message.replyTo && (
                              <div className="text-xs opacity-80 mb-1 border-l-2 pl-2">
                                Trả lời {message.replyTo.sender}: {message.replyTo.preview}
                              </div>
                            )}
                            
                            {editingMessageId === message.id ? (
                              <input
                                className={`w-full bg-transparent outline-none ${isOwn ? 'placeholder-white/80' : 'placeholder-gray-500'}`}
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateMessage(message.id, { content: editingContent })
                                      .then(() => setEditingMessageId(null))
                                      .catch(console.error);
                                  } else if (e.key === 'Escape') {
                                    setEditingMessageId(null);
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>{message.content}</span>
                            )}

                            {/* Reactions */}
                            {message.reactions && Object.keys(message.reactions).length > 0 && (
                              <div className={`mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} gap-1 text-xs`}>
                                {Object.entries(message.reactions).map(([emoji, users]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      const hasReacted = users.some(u => u.userId === currentUser.id);
                                      if (hasReacted) {
                                        removeReaction(message.id, emoji);
                                      } else {
                                        addReaction(message.id, emoji);
                                      }
                                    }}
                                    className="px-2 py-0.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                                  >
                                    {emoji} {users.length}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Message Actions */}
                          <div className={`mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <button 
                              onClick={() => setReplyTo(message)} 
                              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                            >
                              Trả lời
                            </button>
                            <button 
                              onClick={() => addReaction(message.id, '👍')}
                              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                            >
                              👍
                            </button>
                            {isOwn && (
                              <>
                                <button 
                                  onClick={() => { 
                                    setEditingMessageId(message.id); 
                                    setEditingContent(message.content); 
                                  }} 
                                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                >
                                  Sửa
                                </button>
                                <button 
                                  onClick={() => deleteMessage(message.id)} 
                                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-red-600"
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {isOwn && (
                          <div className="ml-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            {message.avatar || 'Y'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
                followOutput={true}
                endReached={loadMoreMessages}
              />
              <div ref={messagesEndRef} />
            </>
          )}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                  {typingUsers.map((user, index) => (
                    <div key={user.id} className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <span>
                  {typingUsers.map(u => u.name).join(', ')} 
                  {typingUsers.length === 1 ? ' đang nhập...' : ' đang nhập...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          {replyTo && (
            <div className="mb-2 text-xs text-gray-600 border-l-2 border-blue-400 pl-2">
              Trả lời {replyTo.sender}: {String(replyTo.content).slice(0,120)}
              <button className="ml-2 text-blue-600" onClick={() => setReplyTo(null)}>Hủy</button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowCodeEditor(true)} 
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Code className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTypingStart();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                onBlur={handleTypingStop}
                placeholder="Nhập tin nhắn..." 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <button 
                onClick={() => setShowEmoji(v => !v)} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Smile className="h-5 w-5" />
              </button>
              {showEmoji && (
                <div className="absolute bottom-12 right-0 z-50 bg-white rounded-lg shadow-lg border p-2 w-64">
                  <div className="grid grid-cols-8 gap-1 text-xl">
                    {EMOJIS.map((emoji, index) => (
                      <button 
                        key={index} 
                        className="hover:bg-gray-100 rounded" 
                        onClick={() => { 
                          setNewMessage(prev => prev + emoji); 
                          setShowEmoji(false); 
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || messagesLoading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <input 
            ref={fileInputRef} 
            type="file" 
            onChange={handleFileUpload}
            className="hidden" 
            accept="image/*,.txt,.js,.py,.java,.cpp,.html,.css,.json,.md" 
          />
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)} 
        onMinimize={() => setIsAIMinimized(!isAIMinimized)} 
      />

      {/* Video Call */}
      <EnhancedVideoCall 
        isActive={isVideoCall || isVoiceCall} 
        onEndCall={endCall}
        roomId={numericRoomId}
        currentUser={currentUser}
      />

      {/* Code Editor - ĐÃ SỬA ĐỂ SỬ DỤNG handleSendCode */}
      <CodeEditor 
        isOpen={showCodeEditor} 
        onClose={() => setShowCodeEditor(false)} 
        onSendCode={handleSendCode}
        initialCode={codeContent}
        initialLanguage={codeLanguage}
      />

      {/* Share Room Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chia sẻ phòng chat</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link phòng chat:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/chat/${numericRoomId}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={copyRoomLink}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Copy link"
                >
                  {copiedLink ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Mã phòng:</strong> <code className="bg-white px-2 py-1 rounded font-mono">{numericRoomId}</code>
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Gửi link này cho bạn bè để họ tham gia phòng chat. Họ cần đăng nhập để vào phòng.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  copyRoomLink();
                  if (navigator.share) {
                    navigator.share({
                      title: `Tham gia phòng chat: ${numericRoomId}`,
                      text: `Tham gia phòng chat ${numericRoomId}`,
                      url: `${window.location.origin}/chat/${numericRoomId}`
                    }).catch(err => console.log('Error sharing:', err));
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chia sẻ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatRoom;