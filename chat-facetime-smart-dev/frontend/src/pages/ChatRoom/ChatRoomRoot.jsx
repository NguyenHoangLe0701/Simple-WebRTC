// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { 
//   Send, 
//   Phone, 
//   Video, 
//   MoreVertical, 
//   Smile, 
//   Paperclip, 
//   Code, 
//   Users, 
//   Settings,
//   Mic,
//   MicOff,
//   PhoneOff,
//   VideoOff,
//   Monitor,
//   Share2,
//   FileText,
//   Image,
//   Download,
//   Bot,
//   LogOut,
//   Copy,
//   Check
// } from 'lucide-react';
// import AIAssistant from '../../components/AIAssistant';
// import EnhancedVideoCall from '../../components/EnhancedVideoCall';
// import CodeEditor from '../../components/CodeEditor';
// import { Virtuoso } from 'react-virtuoso';
// import socketService from '../../services/socketService';
// // Notification Component - THÊM COMPONENT NÀY
// const Notification = ({ notification, onClose }) => {
//   const { id, title, message, type = 'info', action } = notification;
  
//   const getNotificationStyles = () => {
//     switch (type) {
//       case 'warning': return 'bg-yellow-50 border-yellow-500 text-yellow-700';
//       case 'error': return 'bg-red-50 border-red-500 text-red-700';
//       case 'success': return 'bg-green-50 border-green-500 text-green-700';
//       default: return 'bg-blue-50 border-blue-500 text-blue-700';
//     }
//   };

//   const getIcon = () => {
//     switch (type) {
//       case 'warning': return '⚠️';
//       case 'error': return '❌';
//       case 'success': return '✅';
//       default: return 'ℹ️';
//     }
//   };

//   return (
//     <div 
//       className={`p-4 rounded-lg shadow-lg border-l-4 ${getNotificationStyles()} max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105`}
//       onClick={() => {
//         if (action) {
//           action();
//         }
//         onClose();
//       }}
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex items-start space-x-3">
//           <span className="text-lg">{getIcon()}</span>
//           <div className="flex-1">
//             <div className="font-semibold text-sm">{title}</div>
//             <div className="text-sm mt-1">{message}</div>
//             {action && (
//               <div className="text-xs mt-2 text-blue-600 font-medium">
//                 Click để tham gia →
//               </div>
//             )}
//           </div>
//         </div>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onClose();
//           }}
//           className="text-gray-400 hover:text-gray-600 ml-2"
//         >
//           ×
//         </button>
//       </div>
//     </div>
//   );
// };
// const ChatRoom = () => {
//   const { roomId = 'general' } = useParams();
//   const navigate = useNavigate();
//   // User authentication
//   const currentUser = useMemo(() => {
//     try {
//       const rawSession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('user') : null;
//       const rawLocal = localStorage.getItem('user');
//       const raw = rawSession || rawLocal;
//       return raw ? JSON.parse(raw) : null;
//     } catch (e) {
//       return null;
//     }
//   }, []);

//   // State management
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [isVideoCall, setIsVideoCall] = useState(false);
//   const [isVoiceCall, setIsVoiceCall] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [showCodeEditor, setShowCodeEditor] = useState(false);
//   const [codeContent, setCodeContent] = useState('');
//   const [codeLanguage, setCodeLanguage] = useState('javascript');
//   const [showAIAssistant, setShowAIAssistant] = useState(false);
//   const [isAIMinimized, setIsAIMinimized] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [showUserDropdown, setShowUserDropdown] = useState(false);
//   const [sidebarQuery, setSidebarQuery] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [copiedLink, setCopiedLink] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [showEmoji, setShowEmoji] = useState(false);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [joinRoomCode, setJoinRoomCode] = useState('');
//   const [editingMessageId, setEditingMessageId] = useState(null);
//   const [editingContent, setEditingContent] = useState('');
//   const [replyTo, setReplyTo] = useState(null);

//   // Constants and refs
//   const EMOJIS = useMemo(() => (
//     ['😀','😄','😁','😂','🤣','😊','😍','😘','😎','🤩','👍','👏','🙏','🔥','💯','🎉','❤️','💙','😢','😡','😴','🤔','🙌','✅']
//   ), []);
  
//   const listRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const dropRef = useRef(null);

//   // Socket connection and message handling
//   useEffect(() => {
//     if (!currentUser) return;

//     // Reset state when changing rooms
//     setMessages([]);
//     setOnlineUsers([]);
    
//     let chatSub, presenceSub, signalSub;
//     const username = currentUser?.fullName || currentUser?.username || 'User';
    
//     (async () => {
//       try {
//         // Ensure socket is connected first
//         if (!socketService.isConnected) {
//           console.log('Connecting socket...');
//           await socketService.connect(); 
//         }
        
//         // Wait for connection to stabilize
//         await new Promise(resolve => setTimeout(resolve, 500));
        
//         setIsConnected(socketService.isConnected);
        
//         if (!socketService.isConnected) {
//           console.error('Socket failed to connect');
//           return;
//         }
        
//         console.log('Socket connected. Subscribing to topics then joining room:', roomId);
        
//         // Subscribe to chat messages
//         chatSub = socketService.subscribeToChat(roomId, (messageFrame) => {
//           try {
//             console.log('=== RECEIVED MESSAGE FRAME ===');
//             console.log('Room:', roomId);
//             console.log('Frame body:', messageFrame.body);
            
//             const payload = JSON.parse(messageFrame.body);
//             console.log('Parsed payload:', payload);
            
//             // Validate payload
//             if (!payload || !payload.id || !payload.content) {
//               console.warn('Invalid message payload:', payload);
//               return;
//             }
            
//             setMessages(prev => {
//               // Avoid duplicates by checking id
//               const existingMsg = prev.find(m => m.id === payload.id);
//               if (existingMsg) {
//                 console.log('⚠️ Duplicate message ignored:', payload.id);
//                 return prev;
//               }
              
//               console.log('✅ Adding new message to chat:', payload.id);
//               console.log('  Sender:', payload.sender);
//               console.log('  Content:', payload.content);
              
//               return [...prev, payload];
//             });
//           } catch (e) {
//             console.error('❌ Error parsing chat message:', e);
//             console.error('Raw body:', messageFrame.body);
//           }
//         });
        
//         if (chatSub) {
//           console.log('✅ Successfully subscribed to chat:', `/topic/chat/${roomId}`);
//         } else {
//           console.error('❌ Failed to subscribe to chat:', `/topic/chat/${roomId}`);
//         }
        
//         // Subscribe to presence updates
//         presenceSub = socketService.subscribeToPresence(roomId, (messageFrame) => {
//           try {
//             const payload = JSON.parse(messageFrame.body);
//             console.log('Received presence update:', payload);
//             if (payload?.users) {
//               const usersList = payload.users.map(u => ({ 
//                 id: u.id || u.username, 
//                 name: u.fullName || u.username, 
//                 avatar: (u.fullName || u.username || 'U').charAt(0).toUpperCase(), 
//                 status: u.status || 'online' 
//               }));
//               // Always include current user in the list
//               const currentUserInList = usersList.find(u => u.id === (currentUser?.id || currentUser?.username));
//               if (!currentUserInList && currentUser) {
//                 usersList.push({
//                   id: currentUser.id || currentUser.username,
//                   name: currentUser.fullName || currentUser.username,
//                   avatar: (currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase(),
//                   status: 'online'
//                 });
//               }
//               console.log('Setting online users:', usersList);
//               setOnlineUsers(usersList);
//             }
//           } catch (e) {
//             console.error('Error parsing presence message:', e);
//           }
//         });
        
//         console.log('Subscribed to presence:', `/topic/presence/${roomId}`);
        
//         // Subscribe to signaling for video calls
//         signalSub = socketService.subscribeToCall(roomId, (frame) => {
//           try {
//             const data = JSON.parse(frame.body);
//             console.log('Received signaling:', data);
//             // Handle join/leave events for presence
//             if (data.type === 'join' || data.type === 'leave') {
//               // Presence will be updated via presence subscription
//             }
//           } catch (e) {
//             console.error('Error parsing signaling message:', e);
//           }
//         });
        
//         console.log('Subscribed to signaling:', `/topic/room/${roomId}`);

//         // After subscriptions are ready, send join so presence/chat reflects immediately
//         const userId = currentUser?.id || currentUser?.userId || currentUser?.username || username;
//         console.log('Joining room with userId:', userId, 'username:', username);
//         socketService.joinRoom(roomId, username, {
//           id: userId,
//           userId: userId,
//           fullName: currentUser?.fullName || username,
//           name: currentUser?.fullName || currentUser?.username || username,
//           email: currentUser?.email || ''
//         });
//       } catch (e) {
//         console.error('Error in socket setup:', e);
//       }
//     })();
    
//     return () => {
//       try { 
//         socketService.leaveRoom(roomId, username); 
//       } catch (e) {
//         console.error('Error leaving room:', e);
//       }
//       if (chatSub) socketService.unsubscribe(`/topic/chat/${roomId}`);
//       if (presenceSub) socketService.unsubscribe(`/topic/presence/${roomId}`);
//       if (signalSub) socketService.unsubscribe(`/topic/room/${roomId}`);
//     };
//   }, [roomId, currentUser]);

//   // Drag & drop upload
//   useEffect(() => {
//     const el = dropRef.current;
//     if (!el) return;
//     const onDragOver = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-blue-400'); };
//     const onDragLeave = (e) => { e.preventDefault(); el.classList.remove('ring-2','ring-blue-400'); };
//     const onDrop = (e) => {
//       e.preventDefault();
//       el.classList.remove('ring-2','ring-blue-400');
//       const file = e.dataTransfer.files && e.dataTransfer.files[0];
//       if (file) {
//         handleFileUpload({ target: { files: [file] } });
//       }
//     };
//     el.addEventListener('dragover', onDragOver);
//     el.addEventListener('dragleave', onDragLeave);
//     el.addEventListener('drop', onDrop);
//     return () => {
//       el.removeEventListener('dragover', onDragOver);
//       el.removeEventListener('dragleave', onDragLeave);
//       el.removeEventListener('drop', onDrop);
//     };
//   }, []);

//   // Message functions
//   const sendMessage = () => {
//     if (!newMessage.trim()) return;
    
//     const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     const senderId = currentUser?.id || currentUser?.userId || currentUser?.username || 'unknown';
//     const senderName = currentUser?.fullName || currentUser?.username || 'You';
    
//     const message = {
//       id: messageId,
//       sender: senderName,
//       senderId: senderId,
//       content: newMessage.trim(),
//       timestamp: new Date().toISOString(),
//       type: 'text',
//       roomId: roomId,
//       avatar: senderName.charAt(0).toUpperCase(),
//       replyTo: replyTo ? { id: replyTo.id, sender: replyTo.sender, preview: String(replyTo.content).slice(0, 100) } : undefined,
//       reactions: {}
//     };
    
//     console.log('=== SENDING MESSAGE ===');
//     console.log('Room:', roomId);
//     console.log('Sender ID:', senderId);
//     console.log('Message:', JSON.stringify(message, null, 2));
    
//     // Optimistic update
//     setMessages(prev => {
//       if (prev.find(m => m.id === messageId)) {
//         return prev;
//       }
//       return [...prev, message];
//     });
    
//     // Send via socket
//     if (socketService.isConnected) {
//       try {
//         console.log('📤 Calling sendMessage...');
//         socketService.sendMessage(roomId, message);
//         console.log('✅ sendMessage called successfully');
//       } catch (err) {
//         console.error('❌ Error sending message:', err);
//         // Remove optimistic update on error
//         setMessages(prev => prev.filter(m => m.id !== messageId));
//       }
//     } else {
//       console.warn('⚠️ Socket not connected, attempting to connect...');
//       // Remove optimistic update if can't send
//       setMessages(prev => prev.filter(m => m.id !== messageId));
      
//       // Try to reconnect
//       socketService.connect().then(() => {
//         if (socketService.isConnected) {
//           console.log('✅ Reconnected, sending message...');
//           socketService.sendMessage(roomId, message);
//         } else {
//           console.error('❌ Reconnection failed - still not connected');
//         }
//       }).catch(err => {
//         console.error('❌ Failed to reconnect:', err);
//       });
//     }
    
//     setNewMessage('');
//     setReplyTo(null);
//   };

//   const sendCode = (codeData) => {
//     const message = {
//       id: Date.now(),
//       sender: 'You',
//       content: codeData.content,
//       timestamp: new Date(),
//       type: 'code',
//       language: codeData.language,
//       fileName: codeData.fileName,
//       avatar: 'Y'
//     };
//     setMessages([...messages, message]);
//   };

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       if (file.type.startsWith('image/')) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//           setImagePreviews(prev => [...prev, { name: file.name, size: file.size, dataUrl: e.target.result }]);
//         };
//         reader.readAsDataURL(file);
//         return;
//       }
//       const message = {
//         id: Date.now(),
//         sender: 'You',
//         content: file.name,
//         timestamp: new Date(),
//         type: 'file',
//         fileName: file.name,
//         fileSize: file.size,
//         avatar: 'Y'
//       };
//       setMessages([...messages, message]);
//     }
//   };

//   // Call functions
//   const startVideoCall = () => {
//     setIsVideoCall(true);
//     setIsVoiceCall(false);
//   };

//   const startVoiceCall = () => {
//     setIsVoiceCall(true);
//     setIsVideoCall(false);
//   };

//   const endCall = () => {
//     setIsVideoCall(false);
//     setIsVoiceCall(false);
//     setIsScreenSharing(false);
//   };

//   const toggleMute = () => {
//     setIsMuted(!isMuted);
//   };

//   const toggleScreenShare = () => {
//     setIsScreenSharing(!isScreenSharing);
//   };

//   // Utility functions
//   const formatTime = (date) => {
//     try {
//       const d = date instanceof Date ? date : new Date(date);
//       if (isNaN(d.getTime())) {
//         return 'Vừa xong';
//       }
//       return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
//     } catch (e) {
//       return 'Vừa xong';
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'online': return 'bg-green-500';
//       case 'away': return 'bg-yellow-500';
//       case 'offline': return 'bg-gray-400';
//       default: return 'bg-gray-400';
//     }
//   };

//   // Room sharing functions
//   const copyRoomLink = async () => {
//     const roomLink = `${window.location.origin}/chat/${roomId}`;
//     try {
//       await navigator.clipboard.writeText(roomLink);
//       setCopiedLink(true);
//       setTimeout(() => setCopiedLink(false), 2000);
//     } catch (err) {
//       // Fallback for older browsers
//       const textArea = document.createElement('textarea');
//       textArea.value = roomLink;
//       document.body.appendChild(textArea);
//       textArea.select();
//       document.execCommand('copy');
//       document.body.removeChild(textArea);
//       setCopiedLink(true);
//       setTimeout(() => setCopiedLink(false), 2000);
//     }
//   };

//   const shareRoom = () => {
//     setShowShareModal(true);
//     copyRoomLink();
//   };

// useEffect(() => {
//   if (!currentUser || !socketService.isConnected) return;

//   let broadcastSub;

//   const setupBroadcastListener = async () => {
//     try {
//       // Subscribe to broadcast channel
//       broadcastSub = socketService.subscribeToBroadcast((messageFrame) => {
//         try {
//           const payload = JSON.parse(messageFrame.body);
//           console.log('📢 Received broadcast:', payload);
          
//           // Xử lý các loại broadcast khác nhau
//           switch (payload.type) {
//             case 'ROOM_CREATED':
//               handleRoomCreatedBroadcast(payload);
//               break;
//             case 'USER_JOINED':
//               handleUserJoinedBroadcast(payload);
//               break;
//             case 'ANNOUNCEMENT':
//               handleAnnouncementBroadcast(payload);
//               break;
//             default:
//               console.log('Unknown broadcast type:', payload.type);
//           }
//         } catch (e) {
//           console.error('Error parsing broadcast message:', e);
//         }
//       });
      
//       console.log('✅ Subscribed to broadcast channel');
//     } catch (error) {
//       console.error('Error setting up broadcast listener:', error);
//     }
//   };

//   setupBroadcastListener();

//   return () => {
//     if (broadcastSub) {
//       socketService.unsubscribe('/topic/broadcast');
//     }
//   };
// }, [currentUser, socketService.isConnected]);
// const generateRoomCode = async () => {
//   const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  
//   try {
//     // Hiển thị thông báo đang tạo phòng
//     showNotification({
//       title: '🔄 Đang tạo phòng...',
//       message: `Đang tạo phòng ${code}`,
//       type: 'info',
//       duration: 3000
//     });

//     // Kiểm tra và đảm bảo kết nối WebSocket
//     let socketReady = socketService.isConnected;
    
//     if (!socketReady) {
//       console.log('🔄 WebSocket chưa kết nối, đang thử kết nối...');
//       try {
//         await socketService.connect();
//         // Đợi kết nối ổn định
//         await new Promise(resolve => setTimeout(resolve, 500));
//         socketReady = socketService.isConnected;
        
//         if (socketReady) {
//           console.log('✅ WebSocket đã kết nối thành công');
//           showNotification({
//             title: '✅ Đã kết nối',
//             message: 'Kết nối WebSocket thành công',
//             type: 'success',
//             duration: 2000
//           });
//         } else {
//           console.warn('⚠️ Không thể kết nối WebSocket');
//           showNotification({
//             title: '⚠️ Cảnh báo',
//             message: 'Không thể kết nối real-time. Phòng vẫn được tạo nhưng broadcast có thể thất bại.',
//             type: 'warning',
//             duration: 4000
//           });
//         }
//       } catch (socketError) {
//         console.error('❌ Lỗi kết nối WebSocket:', socketError);
//         socketReady = false;
//       }
//     }

//     // Tạo room data
//     const roomData = {
//       name: code,
//       description: `Phòng chat được tạo bởi ${currentUser?.fullName || currentUser?.username}`,
//       createdBy: currentUser?.id || currentUser?.username,
//       type: 'PUBLIC'
//     };
    
//     // Gửi broadcast thông báo tạo phòng nếu WebSocket đã kết nối
//     if (socketReady) {
//       try {
//         const broadcastMessage = {
//           id: `broadcast_${Date.now()}`,
//           type: 'ROOM_CREATED',
//           sender: 'System',
//           senderId: 'system',
//           content: `${currentUser?.fullName || currentUser?.username} đã tạo phòng mới: ${code}`,
//           timestamp: new Date().toISOString(),
//           roomData: roomData,
//           action: 'JOIN_ROOM'
//         };
        
//         // Broadcast đến tất cả users
//         socketService.broadcastToAll('/app/broadcast', broadcastMessage);
//         console.log('✅ Broadcast room creation:', code);
        
//         showNotification({
//           title: '📢 Đã thông báo',
//           message: 'Đã gửi thông báo tạo phòng đến mọi người',
//           type: 'success',
//           duration: 3000
//         });
//       } catch (broadcastError) {
//         console.error('❌ Lỗi khi broadcast:', broadcastError);
//         showNotification({
//           title: '⚠️ Thông báo thất bại',
//           message: 'Không thể gửi thông báo real-time',
//           type: 'warning',
//           duration: 3000
//         });
//       }
//     }

//     // Tạo room thông qua API (nếu cần)
//     try {
//       // Gọi API để tạo room trong database
//       // await apiService.createRoom(roomData);
//       console.log('✅ Room data prepared:', roomData);
//     } catch (apiError) {
//       console.error('❌ Lỗi API tạo phòng:', apiError);
//       // Vẫn tiếp tục vì room có thể được tạo trên client
//     }

//     // Chuyển hướng đến phòng mới sau 1 giây để user thấy thông báo
//     setTimeout(() => {
//       navigate(`/chat/${code}`);
//     }, 1000);

//   } catch (error) {
//     console.error('❌ Lỗi tạo phòng:', error);
    
//     showNotification({
//       title: '❌ Lỗi',
//       message: 'Không thể tạo phòng. Vui lòng thử lại.',
//       type: 'error',
//       duration: 5000
//     });
//   }
// };

//   const joinByCode = () => {
//     const code = String(joinRoomCode || '').trim();
//     if (!code) return;
//     navigate(`/chat/${code}`);
//     setJoinRoomCode('');
//   };

//   // Redirect to login if not authenticated
//   useEffect(() => {
//     if (!currentUser) {
//       if (roomId && roomId !== 'general') {
//         sessionStorage.setItem('redirectAfterLogin', `/chat/${roomId}`);
//       }
//       navigate('/login');
//     }
//   }, [currentUser, navigate, roomId]);

//   if (!currentUser) {
//     return null;
//   }
//   // Thêm useEffect này sau các useEffect khác
// useEffect(() => {
//   const checkConnection = () => {
//     const wasConnected = isConnected;
//     const nowConnected = socketService.isConnected;
    
//     if (wasConnected !== nowConnected) {
//       setIsConnected(nowConnected);
      
//       if (nowConnected && !wasConnected) {
//         showNotification({
//           title: '✅ Đã kết nối',
//           message: 'Kết nối real-time đã được khôi phục',
//           type: 'success',
//           duration: 3000
//         });
//       } else if (!nowConnected && wasConnected) {
//         showNotification({
//           title: '⚠️ Mất kết nối',
//           message: 'Mất kết nối real-time. Đang thử kết nối lại...',
//           type: 'warning',
//           duration: 4000
//         });
//       }
//     }
//   };

//   // Kiểm tra mỗi 5 giây
//   const interval = setInterval(checkConnection, 5000);
  
//   return () => clearInterval(interval);
// }, [isConnected]);
// // Thêm state cho notifications
// const handleRoomCreatedBroadcast = (payload) => {
//   // Hiển thị thông báo trong chat hiện tại
//   const systemMessage = {
//     id: `sys_${Date.now()}`,
//     type: 'system',
//     sender: 'System',
//     senderId: 'system',
//     content: `📢 ${payload.content}`,
//     timestamp: new Date().toISOString(),
//     roomId: roomId,
//     action: payload.action,
//     roomData: payload.roomData
//   };
  
//   setMessages(prev => [...prev, systemMessage]);
  
//   // Hiển thị toast notification
//   showNotification({
//     title: 'Phòng mới được tạo',
//     message: payload.content,
//     type: 'info',
//     action: () => {
//       // Navigate to the new room khi click
//       if (payload.roomData) {
//         navigate(`/chat/${payload.roomData.name}`);
//       }
//     }
//   });
// };

// const handleUserJoinedBroadcast = (payload) => {
//   const systemMessage = {
//     id: `sys_${Date.now()}`,
//     type: 'system',
//     sender: 'System',
//     senderId: 'system',
//     content: `👋 ${payload.content}`,
//     timestamp: new Date().toISOString(),
//     roomId: roomId
//   };
  
//   setMessages(prev => [...prev, systemMessage]);
// };

// const handleAnnouncementBroadcast = (payload) => {
//   const systemMessage = {
//     id: `sys_${Date.now()}`,
//     type: 'system',
//     sender: 'System',
//     senderId: 'system',
//     content: `📣 ${payload.content}`,
//     timestamp: new Date().toISOString(),
//     roomId: roomId
//   };
  
//   setMessages(prev => [...prev, systemMessage]);
  
//   showNotification({
//     title: 'Thông báo',
//     message: payload.content,
//     type: 'warning'
//   });
// };
// const [notifications, setNotifications] = useState([]);

// // Helper function để hiển thị notification
// const showNotification = ({ title, message, type = 'info', action = null }) => {
//   // Tạo toast notification element
//   const notification = document.createElement('div');
//   notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
//     type === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700' :
//     type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' :
//     'bg-green-50 border-green-500 text-green-700'
//   } max-w-sm cursor-pointer`;
  
//   notification.innerHTML = `
//     <div class="font-semibold">${title}</div>
//     <div class="text-sm mt-1">${message}</div>
//     ${action ? '<div class="text-xs mt-2 text-blue-600">Click để tham gia →</div>' : ''}
//   `;
  
//   if (action) {
//     notification.addEventListener('click', action);
//   }
  
//   document.body.appendChild(notification);
  
//   // Tự động remove sau 5 giây
//   setTimeout(() => {
//     if (notification.parentNode) {
//       notification.parentNode.removeChild(notification);
//     }
//   }, 5000);
// };
// // Thêm state cho notifications

// // Notification Component
// const Notification = ({ notification, onClose }) => {
//   const { id, title, message, type = 'info', action } = notification;
  
//   const getNotificationStyles = () => {
//     switch (type) {
//       case 'warning': return 'bg-yellow-50 border-yellow-500 text-yellow-700';
//       case 'error': return 'bg-red-50 border-red-500 text-red-700';
//       case 'success': return 'bg-green-50 border-green-500 text-green-700';
//       default: return 'bg-blue-50 border-blue-500 text-blue-700';
//     }
//   };

//   const getIcon = () => {
//     switch (type) {
//       case 'warning': return '⚠️';
//       case 'error': return '❌';
//       case 'success': return '✅';
//       default: return 'ℹ️';
//     }
//   };

//   return (
//     <div className={`p-4 rounded-lg shadow-lg border-l-4 ${getNotificationStyles()} max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105`}>
//       <div className="flex items-start justify-between">
//         <div className="flex items-start space-x-3">
//           <span className="text-lg">{getIcon()}</span>
//           <div className="flex-1">
//             <div className="font-semibold text-sm">{title}</div>
//             <div className="text-sm mt-1">{message}</div>
//             {action && (
//               <div className="text-xs mt-2 text-blue-600 font-medium">
//                 Click để tham gia →
//               </div>
//             )}
//           </div>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-gray-400 hover:text-gray-600 ml-2"
//         >
//           ×
//         </button>
//       </div>
//     </div>
//   );
// };

// // THÊM useEffect NÀY SAU CÁC useEffect KHÁC
// useEffect(() => {
//   const checkConnection = () => {
//     const wasConnected = isConnected;
//     const nowConnected = socketService.isConnected;
    
//     if (wasConnected !== nowConnected) {
//       setIsConnected(nowConnected);
      
//       if (nowConnected && !wasConnected) {
//         showNotification({
//           title: '✅ Đã kết nối',
//           message: 'Kết nối real-time đã được khôi phục',
//           type: 'success',
//           duration: 3000
//         });
//       } else if (!nowConnected && wasConnected) {
//         showNotification({
//           title: '⚠️ Mất kết nối',
//           message: 'Mất kết nối real-time. Đang thử kết nối lại...',
//           type: 'warning',
//           duration: 4000
//         });
//       }
//     }
//   };

//   // Kiểm tra mỗi 5 giây
//   const interval = setInterval(checkConnection, 5000);
  
//   return () => clearInterval(interval);
// }, [isConnected]);

// const removeNotification = (id) => {
//   setNotifications(prev => prev.filter(notif => notif.id !== id));
// };

//   return (
//     <div className="flex h-screen bg-gray-100 overflow-hidden">
//       {/* Sidebar */}
//       <div className="w-72 bg-white border-r flex flex-col">
//         {/* Current user card */}
//         <div className="p-4 border-b">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
//                   {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
//                 </div>
//                 <span className="absolute -bottom-1 -right-1 inline-block w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-gray-900">{currentUser?.fullName || currentUser?.username || 'User'}</p>
//                 <p className="text-xs text-gray-500">Đang trực tuyến</p>
//               </div>
//             </div>
//             <div className="relative">
//               <button
//                 onClick={() => setShowUserDropdown(v => !v)}
//                 className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
//                 title="Cài đặt"
//               >
//                 <Settings className="h-4 w-4" />
//               </button>
//               {showUserDropdown && (
//                 <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                   <button
//                     onClick={() => {
//                       if (typeof sessionStorage !== 'undefined') {
//                         sessionStorage.removeItem('token');
//                         sessionStorage.removeItem('user');
//                       }
//                       localStorage.removeItem('token');
//                       localStorage.removeItem('user');
//                       window.location.href = '/';
//                     }}
//                     className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
//                   >
//                     <LogOut className="h-4 w-4" />
//                     <span>Đăng xuất</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {/* Sidebar search */}
//         <div className="p-3 border-b">
//           <input
//             type="text"
//             value={sidebarQuery}
//             onChange={(e)=>setSidebarQuery(e.target.value)}
//             placeholder="Tìm phòng hoặc người..."
//             className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <div className="mt-3 flex items-center gap-2">
//             <input
//               type="text"
//               value={joinRoomCode}
//               onChange={(e)=>setJoinRoomCode(e.target.value)}
//               placeholder="Nhập mã phòng..."
//               className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={joinByCode}
//               className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >Vào</button>
//           </div>
//           <button
//             onClick={generateRoomCode}
//             className="mt-2 w-full text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//           >Tạo phòng ngẫu nhiên</button>
//         </div>
        
//         {/* Channels */}
//         <div className="p-3 border-b">
//           <h2 className="text-xs font-semibold text-gray-500 mb-2">Kênh</h2>
//           <div className="space-y-1 max-h-56 overflow-y-auto">
//             {["general","team","random","webrtc","support"].filter(c=>c.includes(sidebarQuery.toLowerCase())).map((c) => (
//               <div 
//                 key={c} 
//                 onClick={() => navigate(`/chat/${c}`)}
//                 className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${c===roomId? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
//               >
//                 #{c}
//               </div>
//             ))}
//           </div>
//         </div>
        
//         {/* Direct messages */}
//         <div className="p-3">
//           <h3 className="text-xs font-semibold text-gray-500 mb-2">Tin nhắn trực tiếp</h3>
//           <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
//             {onlineUsers
//               .filter(u => (u.name || '').toLowerCase().includes(sidebarQuery.toLowerCase()))
//               .map(user => (
//               <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-7 h-7 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs font-medium">{user.avatar}</div>
//                   <span className="text-sm">{user.name}</span>
//                 </div>
//                 <span className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></span>
//               </div>
//             ))}
//           </div>
//         </div>
        
//         {/* Members */}
//         <div className="p-4 border-t">
//           <h3 className="text-sm font-semibold text-gray-500 mb-2">Thành viên</h3>
//           <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
//             {onlineUsers.map(user => (
//               <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
//                 <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm font-medium">{user.avatar}</div>
//                 <span className="text-sm">{user.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div ref={dropRef} className="flex-1 flex flex-col">
//         {/* Chat Header */}
//         <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="w-12 h-12 rounded-full flex items-center justify-center">
//               <img 
//                 src="/images/icons/icon-cloudy.png" 
//                 alt="Room" 
//                 className="w-10 h-10 object-contain" 
//                 onError={(e) => {
//                   e.target.style.display = 'none';
//                   e.target.nextSibling.style.display = 'flex';
//                 }}
//               />
//               <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full items-center justify-center text-white font-bold hidden">
//                 {roomId.charAt(0).toUpperCase()}
//               </div>
//             </div>
//             <div>
//               <h2 className="font-semibold text-gray-800">Phòng: {roomId}</h2>
//               <p className="text-sm text-gray-500">
//                 {onlineUsers.length > 0 ? onlineUsers.length : 1} thành viên
//                 {isConnected && <span className="ml-2 text-green-500">• Đã kết nối</span>}
//               </p>
//               {/* Online members strip */}
//               {onlineUsers.length > 0 && (
//                 <div className="mt-2 flex items-center gap-2 overflow-x-auto pr-2">
//                   {onlineUsers.map(u => (
//                     <div key={u.id} className="relative group" title={u.name}>
//                       <div className="w-7 h-7 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs font-medium">
//                         {(u.name || 'U').charAt(0).toUpperCase()}
//                       </div>
//                       <span className={`absolute -bottom-0.5 -right-0.5 inline-block w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(u.status)}`} />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="relative group">
//               <div className="flex items-center space-x-2 cursor-pointer select-none">
//                 <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
//                   {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
//                 </div>
//                 <span className="text-sm font-medium hidden sm:block">{currentUser?.fullName || currentUser?.username || 'User'}</span>
//               </div>
//             </div>
//             <button 
//               onClick={shareRoom}
//               className={`p-2 rounded-lg transition-colors ${copiedLink ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
//               title={copiedLink ? "Đã copy link!" : "Chia sẻ phòng"}
//             >
//               {copiedLink ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
//             </button>
//             <button 
//               onClick={() => setShowAIAssistant(!showAIAssistant)} 
//               className={`p-2 rounded-lg transition-colors ${showAIAssistant ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} 
//               title="AI Assistant"
//             >
//               <Bot className="h-5 w-5" />
//             </button>
//             <button 
//               onClick={() => {
//                 setIsVoiceCall(true);
//                 setIsVideoCall(false);
//               }} 
//               className={`p-2 rounded-lg transition-colors ${isVoiceCall ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
//               title="Gọi thoại"
//             >
//               <Phone className="h-5 w-5" />
//             </button>
//             <button 
//               onClick={() => {
//                 setIsVideoCall(true);
//                 setIsVoiceCall(false);
//               }} 
//               className={`p-2 rounded-lg transition-colors ${isVideoCall ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
//               title="Gọi video"
//             >
//               <Video className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         {/* Messages (virtualized) */}
//         <div className="flex-1 overflow-y-auto bg-gray-50">
//           {/* Quick search inline */}
//           {sidebarQuery && (
//             <div className="px-4 py-2 text-xs text-gray-500 bg-white border-b">Kết quả cho: "{sidebarQuery}"</div>
//           )}
          
//           {messages.length === 0 && !sidebarQuery && (
//             <div className="flex items-center justify-center h-full">
//               <div className="text-center text-gray-400">
//                 <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Send className="h-8 w-8 text-gray-400" />
//                 </div>
//                 <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
//                 <p className="text-sm mt-2">Hãy bắt đầu cuộc trò chuyện!</p>
//               </div>
//             </div>
//           )}
          
//           {/* Debug messages count */}
//           {process.env.NODE_ENV === 'development' && (
//             <div className="fixed top-2 right-2 bg-black/70 text-white text-xs p-2 rounded z-50">
//               Messages: {messages.length} | Filtered: {messages.filter(m =>
//                 !sidebarQuery || String(m.content).toLowerCase().includes(sidebarQuery.toLowerCase())
//               ).length} | Query: "{sidebarQuery}"
//             </div>
//           )}
          
//           {messages.length > 0 && (
//             <Virtuoso
//               key={roomId}
//               ref={listRef}
//               data={messages.filter(m =>
//                 !sidebarQuery || String(m.content).toLowerCase().includes(sidebarQuery.toLowerCase())
//               )}
//               itemContent={(index, message) => {
//               // Xử lý system messages
//               if (message.type === 'system') {
//                 return (
//                   <div className="flex justify-center my-2">
//                     <div className={`
//                       inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
//                       ${message.content.includes('📢') ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
//                         message.content.includes('👋') ? 'bg-green-100 text-green-800 border border-green-200' :
//                         'bg-gray-100 text-gray-800 border border-gray-200'}
//                     `}>
//                       {message.content}
//                       {message.action === 'JOIN_ROOM' && message.roomData && (
//                         <button
//                           onClick={() => navigate(`/chat/${message.roomData.name}`)}
//                           className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600 transition-colors"
//                         >
//                           Tham gia
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               }

//               // Phần code hiện tại cho message types khác...
//               const isOwn = (currentUser?.id || currentUser?.username) === (message.senderId || message.sender) ||
//                           (currentUser?.fullName || currentUser?.username || 'You') === message.sender;
//                 return (
//                   <div className="px-4 py-2 group">
//                     <div className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'}`}>
//                       {!isOwn && (
//                         <div className="mr-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
//                           {message.avatar}
//                         </div>
//                       )}
//                       <div className={`max-w-[72%] ${isOwn ? 'text-right' : 'text-left'}`}>
//                         <div className={`mb-1 flex items-center gap-2 text-xs ${isOwn ? 'justify-end' : 'justify-start'} text-gray-500`}>
//                           {!isOwn && <span className="font-medium text-gray-700">{message.sender}</span>}
//                           <span>{formatTime(message.timestamp)}</span>
//                         </div>
//                       {message.type === 'text' && (
//                         <div className={`${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} inline-block px-3 py-2 rounded-2xl ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
//                           {message.replyTo && (
//                             <div className="text-xs opacity-80 mb-1 border-l-2 pl-2">
//                               Trả lời {message.replyTo.sender}: {message.replyTo.preview}
//                             </div>
//                           )}
//                           {editingMessageId === message.id ? (
//                             <input
//                               className={`w-full bg-transparent outline-none ${isOwn ? 'placeholder-white/80' : 'placeholder-gray-500'}`}
//                               value={editingContent}
//                               onChange={(e)=>setEditingContent(e.target.value)}
//                               onKeyDown={(e)=>{
//                                 if(e.key==='Enter'){
//                                   setMessages(prev => prev.map(m => m.id===message.id ? { ...m, content: editingContent } : m));
//                                   setEditingMessageId(null);
//                                 } else if (e.key==='Escape') {
//                                   setEditingMessageId(null);
//                                 }
//                               }}
//                               autoFocus
//                             />
//                           ) : (
//                             <span>{message.content}</span>
//                           )}
//                           {/* Reactions */}
//                           {message.reactions && Object.keys(message.reactions).length>0 && (
//                             <div className={`mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} gap-1 text-xs`}>
//                               {Object.entries(message.reactions).map(([emo, count]) => (
//                                 <span key={emo} className="px-2 py-0.5 rounded-full bg-black/10">
//                                   {emo} {count}
//                                 </span>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       )}
//                       {message.type === 'code' && (
//                         <div className="bg-gray-100 rounded-lg p-3 mt-2 text-left">
//                           <div className="flex items-center justify-between mb-2">
//                             <div className="flex items-center space-x-2">
//                               <span className="text-xs font-medium text-gray-600">{message.language || 'code'}</span>
//                               {message.fileName && (<span className="text-xs text-gray-500">({message.fileName})</span>)}
//                             </div>
//                             <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                               <button className="text-xs text-blue-600 hover:text-blue-800 p-1">
//                                 <Download className="h-3 w-3" />
//                               </button>
//                             </div>
//                           </div>
//                           <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded border">{message.content}</pre>
//                         </div>
//                       )}
//                       {message.type === 'file' && (
//                         <div className="bg-gray-100 rounded-lg p-3 mt-2 flex items-center space-x-3">
//                           <FileText className="h-8 w-8 text-blue-500" />
//                           <div className="flex-1">
//                             <p className="font-medium text-sm">{message.fileName}</p>
//                             <p className="text-xs text-gray-500">{message.fileSize} bytes</p>
//                           </div>
//                           <button className="text-blue-600 hover:text-blue-800">
//                             <Download className="h-4 w-4" />
//                           </button>
//                         </div>
//                       )}
//                       {/* Hover actions */}
//                       <div className={`mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
//                         <button onClick={()=>setReplyTo(message)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Trả lời</button>
//                         <button onClick={()=>{
//                           const emo='👍';
//                           setMessages(prev => prev.map(m => m.id===message.id ? { ...m, reactions: { ...m.reactions, [emo]: (m.reactions?.[emo]||0)+1 } } : m));
//                         }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Cảm xúc</button>
//                         {isOwn && (
//                           <>
//                             <button onClick={()=>{ setEditingMessageId(message.id); setEditingContent(message.content); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Sửa</button>
//                             <button onClick={()=> setMessages(prev => prev.filter(m => m.id!==message.id))} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-red-600">Xóa</button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                     {isOwn && (
//                       <div className="ml-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">{message.avatar}</div>
//                     )}
//                   </div>
//                 </div>
//               );
//             }}
//             followOutput={true}
//           />
//           )}
//         </div>

//         {/* Selected image previews */}
//         {imagePreviews.length > 0 && (
//           <div className="bg-white border-t border-gray-200 px-4 py-3">
//             <div className="flex flex-wrap gap-3">
//               {imagePreviews.map((img, idx) => (
//                 <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
//                   <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
//                   <button
//                     onClick={() => setImagePreviews(prev => prev.filter((_, i) => i !== idx))}
//                     className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1"
//                   >
//                     x
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Code Editor */}
//         <CodeEditor 
//           isOpen={showCodeEditor} 
//           onClose={() => setShowCodeEditor(false)} 
//           onSendCode={codeData => setMessages(prev => [...prev, { 
//             id: Date.now(), 
//             sender: currentUser?.fullName || currentUser?.username || 'You', 
//             content: codeData.content, 
//             timestamp: new Date(), 
//             type: 'code', 
//             language: codeData.language, 
//             fileName: codeData.fileName, 
//             avatar: (currentUser?.fullName || currentUser?.username || 'Y').charAt(0).toUpperCase() 
//           }])} 
//           initialCode={codeContent} 
//           initialLanguage={codeLanguage} 
//         />

//         {/* Message Input */}
//         <div className="bg-white border-t border-gray-200 p-4">
//           {replyTo && (
//             <div className="mb-2 text-xs text-gray-600 border-l-2 border-blue-400 pl-2">
//               Trả lời {replyTo.sender}: {String(replyTo.content).slice(0,120)}
//               <button className="ml-2 text-blue-600" onClick={()=>setReplyTo(null)}>Hủy</button>
//             </div>
//           )}
//           <div className="flex items-center space-x-2">
//             <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700"><Paperclip className="h-5 w-5" /></button>
//             <button onClick={() => setShowCodeEditor(true)} className="p-2 text-gray-500 hover:text-gray-700"><Code className="h-5 w-5" /></button>
//             <div className="flex-1 relative">
//               <input 
//                 type="text" 
//                 value={newMessage}
//                 onChange={(e) => {
//                   setNewMessage(e.target.value);
//                   setIsTyping(true);
//                   if (window.__typingTimer) {
//                     clearTimeout(window.__typingTimer);
//                   }
//                   window.__typingTimer = window.setTimeout(()=>setIsTyping(false), 1200);
//                 }} 
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     sendMessage();
//                   }
//                 }} 
//                 placeholder="Nhập tin nhắn..." 
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               />
//               <button onClick={()=>setShowEmoji(v=>!v)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"><Smile className="h-5 w-5" /></button>
//               {showEmoji && (
//                 <div className="absolute bottom-12 right-0 z-50 bg-white rounded-lg shadow-lg border p-2 w-64">
//                   <div className="grid grid-cols-8 gap-1 text-xl">
//                     {EMOJIS.map((e, i) => (
//                       <button key={i} className="hover:bg-gray-100 rounded" onClick={() => { setNewMessage(prev => prev + e); setShowEmoji(false); }}>
//                         {e}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//             <button onClick={sendMessage} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Send className="h-5 w-5" /></button>
//           </div>
//           {isTyping && (
//             <div className="mt-2 text-xs text-gray-500">Đang nhập...</div>
//           )}
//           <input 
//             ref={fileInputRef} 
//             type="file" 
//             onChange={(e)=>{ 
//               const file=e.target.files?.[0]; 
//               if(file){ 
//                 handleFileUpload({ target: { files: [file] } }); 
//               } 
//             }} 
//             className="hidden" 
//             accept="image/*,.txt,.js,.py,.java,.cpp,.html,.css,.json,.md" 
//           />
//         </div>
//       </div>

//       {/* AI Assistant */}
//       <AIAssistant 
//         isOpen={showAIAssistant} 
//         onClose={() => setShowAIAssistant(false)} 
//         onMinimize={() => setIsAIMinimized(!isAIMinimized)} 
//       />

//       {/* Video Call */}
//       <EnhancedVideoCall 
//         isActive={isVideoCall || isVoiceCall} 
//         onEndCall={()=>{ 
//           setIsVideoCall(false); 
//           setIsVoiceCall(false); 
//           setIsScreenSharing(false); 
//         }} 
//         roomId={roomId}
//         currentUser={currentUser}
//       />

//       {/* Share Room Modal */}
//       {showShareModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold">Chia sẻ phòng chat</h3>
//               <button 
//                 onClick={() => setShowShareModal(false)}
//                 className="text-gray-500 hover:text-gray-700 text-2xl"
//               >
//                 ×
//               </button>
//             </div>
            
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Link phòng chat:
//               </label>
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   readOnly
//                   value={`${window.location.origin}/chat/${roomId}`}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
//                 />
//                 <button
//                   onClick={copyRoomLink}
//                   className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   title="Copy link"
//                 >
//                   {copiedLink ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             <div className="mb-4 p-3 bg-blue-50 rounded-lg">
//               <p className="text-sm text-blue-800">
//                 <strong>Mã phòng:</strong> <code className="bg-white px-2 py-1 rounded font-mono">{roomId}</code>
//               </p>
//               <p className="text-xs text-blue-600 mt-2">
//                 Gửi link này cho bạn bè để họ tham gia phòng chat. Họ cần đăng nhập để vào phòng.
//               </p>
//             </div>

//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setShowShareModal(false)}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Đóng
//               </button>
//               <button
//                 onClick={() => {
//                   copyRoomLink();
//                   // Try to use Web Share API if available
//                   if (navigator.share) {
//                     navigator.share({
//                       title: `Tham gia phòng chat: ${roomId}`,
//                       text: `Tham gia phòng chat ${roomId}`,
//                       url: `${window.location.origin}/chat/${roomId}`
//                     }).catch(err => console.log('Error sharing:', err));
//                   }
//                 }}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Chia sẻ
//               </button>
//             </div>
//           </div>
//           {/* Notification Container - THÊM ĐOẠN NÀY VÀO JSX */}
//           <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
//             {notifications.map((notification) => (
//               <Notification
//                 key={notification.id}
//                 notification={notification}
//                 onClose={() => removeNotification(notification.id)}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
