import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import AIAssistant from '../components/AIAssistant';
import EnhancedVideoCall from '../components/EnhancedVideoCall';
import CodeEditor from '../components/CodeEditor';
import { Virtuoso } from 'react-virtuoso';
import socketService from '../services/socket';
// Lightweight inline emoji picker (no external lib to avoid peer deps)

const ChatRoom = () => {
  const { roomId = 'general' } = useParams();
  const navigate = useNavigate();
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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isAIMinimized, setIsAIMinimized] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([
    { id: 1, name: 'Admin', avatar: 'A', status: 'online' },
  ]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const EMOJIS = useMemo(() => (
    ['😀','😄','😁','😂','🤣','😊','😍','😘','😎','🤩','👍','👏','🙏','🔥','💯','🎉','❤️','💙','😢','😡','😴','🤔','🙌','✅']
  ), []);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  
  const listRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    // Reset messages when changing rooms
    setMessages([]);
    setOnlineUsers([]);
    
    let chatSub, presenceSub, signalSub;
    const username = currentUser?.fullName || currentUser?.username || 'User';
    
    (async () => {
      try {
        // Ensure socket is connected first
        if (!socketService.isConnected) {
          console.log('Connecting socket...');
          await socketService.connect(); 
        }
        
        // Wait a bit for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsConnected(socketService.isConnected);
        
        if (!socketService.isConnected) {
          console.error('Socket failed to connect');
          return;
        }
        
        console.log('Socket connected. Subscribing to topics then joining room:', roomId);
        
        // Subscribe to chat messages first
        chatSub = socketService.subscribeToChat(roomId, (messageFrame) => {
          try {
            console.log('=== RECEIVED MESSAGE FRAME ===');
            console.log('Room:', roomId);
            console.log('Frame body:', messageFrame.body);
            console.log('Frame headers:', messageFrame.headers);
            
            const payload = JSON.parse(messageFrame.body);
            console.log('Parsed payload:', payload);
            
            // Validate payload
            if (!payload || !payload.id || !payload.content) {
              console.warn('Invalid message payload:', payload);
              return;
            }
            
            setMessages(prev => {
              // Avoid duplicates by checking id
              const existingMsg = prev.find(m => m.id === payload.id);
              if (existingMsg) {
                console.log('⚠️ Duplicate message ignored:', payload.id);
                console.log('  Existing message:', existingMsg);
                console.log('  Incoming message:', payload);
                return prev;
              }
              
              console.log('✅ Adding new message to chat:', payload.id);
              console.log('  Sender:', payload.sender);
              console.log('  Content:', payload.content);
              console.log('  Timestamp:', payload.timestamp);
              
              // Return new array with the message
              const newMessages = [...prev, payload];
              console.log('📊 Total messages after adding:', newMessages.length);
              console.log('  Previous count:', prev.length);
              console.log('  All message IDs:', newMessages.map(m => m.id));
              
              return newMessages;
            });
          } catch (e) {
            console.error('❌ Error parsing chat message:', e);
            console.error('Raw body:', messageFrame.body);
          }
        });
        
        if (chatSub) {
          console.log('✅ Successfully subscribed to chat:', `/topic/chat/${roomId}`);
        } else {
          console.error('❌ Failed to subscribe to chat:', `/topic/chat/${roomId}`);
        }
        
        // Subscribe to presence updates
        presenceSub = socketService.subscribeToPresence(roomId, (messageFrame) => {
          try {
            const payload = JSON.parse(messageFrame.body);
            console.log('Received presence update:', payload);
            if (payload?.users) {
              const usersList = payload.users.map(u => ({ 
                id: u.id || u.username, 
                name: u.fullName || u.username, 
                avatar: (u.fullName || u.username || 'U').charAt(0).toUpperCase(), 
                status: u.status || 'online' 
              }));
              // Always include current user in the list
              const currentUserInList = usersList.find(u => u.id === (currentUser?.id || currentUser?.username));
              if (!currentUserInList && currentUser) {
                usersList.push({
                  id: currentUser.id || currentUser.username,
                  name: currentUser.fullName || currentUser.username,
                  avatar: (currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase(),
                  status: 'online'
                });
              }
              console.log('Setting online users:', usersList);
              setOnlineUsers(usersList);
            }
          } catch (e) {
            console.error('Error parsing presence message:', e);
          }
        });
        
        console.log('Subscribed to presence:', `/topic/presence/${roomId}`);
        
        // Subscribe to signaling for video calls
        signalSub = socketService.subscribeToSignaling(roomId, (frame) => {
          try {
            const data = JSON.parse(frame.body);
            console.log('Received signaling:', data);
            // Handle join/leave events for presence
            if (data.type === 'join' || data.type === 'leave') {
              // Presence will be updated via presence subscription
            }
          } catch (e) {
            console.error('Error parsing signaling message:', e);
          }
        });
        
        console.log('Subscribed to signaling:', `/topic/room/${roomId}`);

        // After subscriptions are ready, send join so presence/chat reflects immediately
        const userId = currentUser?.id || currentUser?.userId || currentUser?.username || username;
        console.log('Joining room with userId:', userId, 'username:', username);
        socketService.joinRoom(roomId, username, {
          id: userId,
          userId: userId,
          fullName: currentUser?.fullName || username,
          name: currentUser?.fullName || currentUser?.username || username,
          email: currentUser?.email || ''
        });
      } catch (e) {
        console.error('Error in socket setup:', e);
      }
    })();
    
    return () => {
      try { 
        socketService.leaveRoom(roomId, username); 
      } catch (e) {
        console.error('Error leaving room:', e);
      }
      if (chatSub) socketService.unsubscribe(`/topic/chat/${roomId}`);
      if (presenceSub) socketService.unsubscribe(`/topic/presence/${roomId}`);
      if (signalSub) socketService.unsubscribe(`/topic/room/${roomId}`);
    };
  }, [roomId, currentUser]);

  // Drag & drop upload
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onDragOver = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-blue-400'); };
    const onDragLeave = (e) => { e.preventDefault(); el.classList.remove('ring-2','ring-blue-400'); };
    const onDrop = (e) => {
      e.preventDefault();
      el.classList.remove('ring-2','ring-blue-400');
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
  }, []);

  // Virtuoso handles scrolling efficiently; no manual scrolling needed

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const senderId = currentUser?.id || currentUser?.userId || currentUser?.username || 'unknown';
    const senderName = currentUser?.fullName || currentUser?.username || 'You';
    
    const message = {
      id: messageId,
      sender: senderName,
      senderId: senderId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      roomId: roomId,
      avatar: senderName.charAt(0).toUpperCase(),
      replyTo: replyTo ? { id: replyTo.id, sender: replyTo.sender, preview: String(replyTo.content).slice(0, 100) } : undefined,
      reactions: {}
    };
    
    console.log('=== SENDING MESSAGE ===');
    console.log('Room:', roomId);
    console.log('Sender ID:', senderId);
    console.log('Sender Name:', senderName);
    console.log('Message:', JSON.stringify(message, null, 2));
    
    // Optimistic update - chỉ thêm message tạm thời
    setMessages(prev => {
      // Kiểm tra xem đã có message này chưa (tránh duplicate)
      if (prev.find(m => m.id === messageId)) {
        return prev;
      }
      return [...prev, message];
    });
    
    // Send via socket
    if (socketService.isConnected) {
      try {
        console.log('📤 Calling sendMessage...');
        console.log('  RoomId:', roomId);
        console.log('  Message:', message);
        socketService.sendMessage(roomId, message);
        console.log('✅ sendMessage called successfully');
      } catch (err) {
        console.error('❌ Error sending message:', err);
        // Remove optimistic update on error
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== messageId);
          console.log('Removed message from state, count:', filtered.length);
          return filtered;
        });
      }
    } else {
      console.warn('⚠️ Socket not connected, attempting to connect...');
      console.log('Socket connection state:', socketService.isConnected);
      // Remove optimistic update if can't send
      setMessages(prev => prev.filter(m => m.id !== messageId));
      
      // Try to reconnect
      socketService.connect().then(() => {
        if (socketService.isConnected) {
          console.log('✅ Reconnected, sending message...');
          socketService.sendMessage(roomId, message);
        } else {
          console.error('❌ Reconnection failed - still not connected');
        }
      }).catch(err => {
        console.error('❌ Failed to reconnect:', err);
      });
    }
    
    setNewMessage('');
    setReplyTo(null);
  };

  const sendCode = (codeData) => {
    const message = {
      id: Date.now(),
      sender: 'You',
      content: codeData.content,
      timestamp: new Date(),
      type: 'code',
      language: codeData.language,
      fileName: codeData.fileName,
      avatar: 'Y'
    };
    setMessages([...messages, message]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, { name: file.name, size: file.size, dataUrl: e.target.result }]);
        };
        reader.readAsDataURL(file);
        return;
      }
      const message = {
        id: Date.now(),
        sender: 'You',
        content: file.name,
        timestamp: new Date(),
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        avatar: 'Y'
      };
      setMessages([...messages, message]);
    }
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    setIsVoiceCall(false);
  };

  const startVoiceCall = () => {
    setIsVoiceCall(true);
    setIsVideoCall(false);
  };

  const endCall = () => {
    setIsVideoCall(false);
    setIsVoiceCall(false);
    setIsScreenSharing(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const formatTime = (date) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) {
        return 'Vừa xong';
      }
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Vừa xong';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      // Store roomId in sessionStorage to redirect after login
      if (roomId && roomId !== 'general') {
        sessionStorage.setItem('redirectAfterLogin', `/chat/${roomId}`);
      }
      navigate('/login');
    }
  }, [currentUser, navigate, roomId]);

  if (!currentUser) {
    return null; // Prevent flash of content
  }

  // Function to generate and copy room link
  const copyRoomLink = async () => {
    const roomLink = `${window.location.origin}/chat/${roomId}`;
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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
  };

  const shareRoom = () => {
    setShowShareModal(true);
    copyRoomLink();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar (channels/users) */}
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
                <p className="text-xs text-gray-500">Đang trực tuyến</p>
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
            onChange={(e)=>setSidebarQuery(e.target.value)}
            placeholder="Tìm phòng hoặc người..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="p-3 border-b">
          <h2 className="text-xs font-semibold text-gray-500 mb-2">Kênh</h2>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {["general","team","random","webrtc","support"].filter(c=>c.includes(sidebarQuery.toLowerCase())).map((c) => (
              <div 
                key={c} 
                onClick={() => navigate(`/chat/${c}`)}
                className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${c===roomId? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                #{c}
              </div>
            ))}
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">Tin nhắn trực tiếp</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {onlineUsers
              .filter(u => (u.name || '').toLowerCase().includes(sidebarQuery.toLowerCase()))
              .map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs font-medium">{user.avatar}</div>
                  <span className="text-sm">{user.name}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Thành viên</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {onlineUsers.map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm font-medium">{user.avatar}</div>
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
              <img 
                src="/images/icons/icon-cloudy.png" 
                alt="Room" 
                className="w-10 h-10 object-contain" 
                onError={(e) => {
                  // Fallback if image not found
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full items-center justify-center text-white font-bold hidden">
                {roomId.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Phòng: {roomId}</h2>
              <p className="text-sm text-gray-500">
                {onlineUsers.length > 0 ? onlineUsers.length : 1} thành viên
                {isConnected && <span className="ml-2 text-green-500">• Đã kết nối</span>}
              </p>
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
              onClick={() => {
                setIsVoiceCall(true);
                setIsVideoCall(false);
              }} 
              className={`p-2 rounded-lg transition-colors ${isVoiceCall ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title="Gọi thoại"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button 
              onClick={() => {
                setIsVideoCall(true);
                setIsVoiceCall(false);
              }} 
              className={`p-2 rounded-lg transition-colors ${isVideoCall ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title="Gọi video"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages (virtualized) */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Quick search inline */}
          {sidebarQuery && (
            <div className="px-4 py-2 text-xs text-gray-500 bg-white border-b">Kết quả cho: "{sidebarQuery}"</div>
          )}
          
          {messages.length === 0 && !sidebarQuery && (
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
          
          {/* Debug messages count */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-2 right-2 bg-black/70 text-white text-xs p-2 rounded z-50">
              Messages: {messages.length} | Filtered: {messages.filter(m =>
                !sidebarQuery || String(m.content).toLowerCase().includes(sidebarQuery.toLowerCase())
              ).length} | Query: "{sidebarQuery}"
            </div>
          )}
          
          {messages.length > 0 && (
            <Virtuoso
              ref={listRef}
              data={messages.filter(m =>
                !sidebarQuery || String(m.content).toLowerCase().includes(sidebarQuery.toLowerCase())
              )}
              itemContent={(index, message) => {
                const isOwn = (currentUser?.id || currentUser?.username) === (message.senderId || message.sender) ||
                             (currentUser?.fullName || currentUser?.username || 'You') === message.sender;
                return (
                  <div className="px-4 py-2 group">
                    <div className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && (
                        <div className="mr-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {message.avatar}
                        </div>
                      )}
                      <div className={`max-w-[72%] ${isOwn ? 'text-right' : 'text-left'}`}>
                        <div className={`mb-1 flex items-center gap-2 text-xs ${isOwn ? 'justify-end' : 'justify-start'} text-gray-500`}>
                          {!isOwn && <span className="font-medium text-gray-700">{message.sender}</span>}
                          <span>{formatTime(message.timestamp)}</span>
                        </div>
                      {message.type === 'text' && (
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
                              onChange={(e)=>setEditingContent(e.target.value)}
                              onKeyDown={(e)=>{
                                if(e.key==='Enter'){
                                  setMessages(prev => prev.map(m => m.id===message.id ? { ...m, content: editingContent } : m));
                                  setEditingMessageId(null);
                                } else if (e.key==='Escape') {
                                  setEditingMessageId(null);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <span>{message.content}</span>
                          )}
                          {/* Reactions */}
                          {message.reactions && Object.keys(message.reactions).length>0 && (
                            <div className={`mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} gap-1 text-xs`}>
                              {Object.entries(message.reactions).map(([emo, count]) => (
                                <span key={emo} className="px-2 py-0.5 rounded-full bg-black/10">
                                  {emo} {count}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {message.type === 'code' && (
                        <div className="bg-gray-100 rounded-lg p-3 mt-2 text-left">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-600">{message.language || 'code'}</span>
                              {message.fileName && (<span className="text-xs text-gray-500">({message.fileName})</span>)}
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-xs text-blue-600 hover:text-blue-800 p-1">
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded border">{message.content}</pre>
                        </div>
                      )}
                      {message.type === 'file' && (
                        <div className="bg-gray-100 rounded-lg p-3 mt-2 flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{message.fileName}</p>
                            <p className="text-xs text-gray-500">{message.fileSize} bytes</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {/* Hover actions */}
                      <div className={`mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <button onClick={()=>setReplyTo(message)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Trả lời</button>
                        <button onClick={()=>{
                          const emo='👍';
                          setMessages(prev => prev.map(m => m.id===message.id ? { ...m, reactions: { ...m.reactions, [emo]: (m.reactions?.[emo]||0)+1 } } : m));
                        }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Cảm xúc</button>
                        {isOwn && (
                          <>
                            <button onClick={()=>{ setEditingMessageId(message.id); setEditingContent(message.content); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Sửa</button>
                            <button onClick={()=> setMessages(prev => prev.filter(m => m.id!==message.id))} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-red-600">Xóa</button>
                          </>
                        )}
                      </div>
                    </div>
                    {isOwn && (
                      <div className="ml-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">{message.avatar}</div>
                    )}
                  </div>
                </div>
              );
            }}
            followOutput={true}
          />
          )}
        </div>

        {/* Selected image previews */}
        {imagePreviews.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImagePreviews(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Editor */}
        <CodeEditor isOpen={showCodeEditor} onClose={() => setShowCodeEditor(false)} onSendCode={codeData => setMessages(prev => [...prev, { id: Date.now(), sender: currentUser?.fullName || currentUser?.username || 'You', content: codeData.content, timestamp: new Date(), type: 'code', language: codeData.language, fileName: codeData.fileName, avatar: (currentUser?.fullName || currentUser?.username || 'Y').charAt(0).toUpperCase() }])} initialCode={codeContent} initialLanguage={codeLanguage} />

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          {replyTo && (
            <div className="mb-2 text-xs text-gray-600 border-l-2 border-blue-400 pl-2">
              Trả lời {replyTo.sender}: {String(replyTo.content).slice(0,120)}
              <button className="ml-2 text-blue-600" onClick={()=>setReplyTo(null)}>Hủy</button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700"><Paperclip className="h-5 w-5" /></button>
            <button onClick={() => setShowCodeEditor(true)} className="p-2 text-gray-500 hover:text-gray-700"><Code className="h-5 w-5" /></button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  setIsTyping(true);
                  if (window.__typingTimer) {
                    clearTimeout(window.__typingTimer);
                  }
                  window.__typingTimer = window.setTimeout(()=>setIsTyping(false), 1200);
                }} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }} 
                placeholder="Nhập tin nhắn..." 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <button onClick={()=>setShowEmoji(v=>!v)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"><Smile className="h-5 w-5" /></button>
              {showEmoji && (
                <div className="absolute bottom-12 right-0 z-50 bg-white rounded-lg shadow-lg border p-2 w-64">
                  <div className="grid grid-cols-8 gap-1 text-xl">
                    {EMOJIS.map((e, i) => (
                      <button key={i} className="hover:bg-gray-100 rounded" onClick={() => { setNewMessage(prev => prev + e); setShowEmoji(false); }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={sendMessage} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Send className="h-5 w-5" /></button>
          </div>
          {isTyping && (
            <div className="mt-2 text-xs text-gray-500">Đang nhập...</div>
          )}
          <input ref={fileInputRef} type="file" onChange={(e)=>{ const file=e.target.files?.[0]; if(file){ handleFileUpload({ target: { files: [file] } }); } }} className="hidden" accept="image/*,.txt,.js,.py,.java,.cpp,.html,.css,.json,.md" />
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} onMinimize={() => setIsAIMinimized(!isAIMinimized)} />

      {/* Video Call */}
      <EnhancedVideoCall 
        isActive={isVideoCall || isVoiceCall} 
        onEndCall={()=>{ 
          setIsVideoCall(false); 
          setIsVoiceCall(false); 
          setIsScreenSharing(false); 
        }} 
        roomId={roomId}
        currentUser={currentUser}
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
                  value={`${window.location.origin}/chat/${roomId}`}
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
                <strong>Mã phòng:</strong> <code className="bg-white px-2 py-1 rounded font-mono">{roomId}</code>
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
                  // Try to use Web Share API if available
                  if (navigator.share) {
                    navigator.share({
                      title: `Tham gia phòng chat: ${roomId}`,
                      text: `Tham gia phòng chat ${roomId}`,
                      url: `${window.location.origin}/chat/${roomId}`
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
    </div>
  );
};

export default ChatRoom;