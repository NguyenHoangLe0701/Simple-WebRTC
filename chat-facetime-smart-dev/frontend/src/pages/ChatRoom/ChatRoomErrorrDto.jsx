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
// import apiService from '../../services/apiService';

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
//       console.error('❌ Error parsing user data:', e);
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
//   const [notifications, setNotifications] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');

//   // Constants and refs
//   const EMOJIS = useMemo(() => (
//     ['😀','😄','😁','😂','🤣','😊','😍','😘','😎','🤩','👍','👏','🙏','🔥','💯','🎉','❤️','💙','😢','😡','😴','🤔','🙌','✅']
//   ), []);
  
//   const listRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const dropRef = useRef(null);

//   // Helper function để hiển thị notification
//   const showNotification = ({ title, message, type = 'info', action = null, duration = 5000 }) => {
//     const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     const notification = { id, title, message, type, action };
    
//     setNotifications(prev => [...prev, notification]);
    
//     // Tự động remove sau duration
//     setTimeout(() => {
//       removeNotification(id);
//     }, duration);
//   };

//   const removeNotification = (id) => {
//     setNotifications(prev => prev.filter(notif => notif.id !== id));
//   };

//   // Broadcast message handlers
//   const handleRoomCreatedBroadcast = (payload) => {
//     console.log('📢 Handling ROOM_CREATED broadcast:', payload);
    
//     // Hiển thị thông báo trong chat hiện tại
//     const systemMessage = {
//       id: `sys_${Date.now()}`,
//       type: 'system',
//       sender: 'System',
//       senderId: 'system',
//       content: `📢 ${payload.content}`,
//       timestamp: new Date().toISOString(),
//       roomId: roomId,
//       action: payload.action,
//       roomData: payload.roomData
//     };
    
//     setMessages(prev => [...prev, systemMessage]);
    
//     // Hiển thị toast notification
//     showNotification({
//       title: '🎉 Phòng mới được tạo',
//       message: payload.content,
//       type: 'info',
//       action: () => {
//         if (payload.roomData) {
//           navigate(`/chat/${payload.roomData.name}`);
//         }
//       }
//     });
//   };

//   const handleUserJoinedBroadcast = (payload) => {
//     console.log('👋 Handling USER_JOINED broadcast:', payload);
    
//     const systemMessage = {
//       id: `sys_${Date.now()}`,
//       type: 'system',
//       sender: 'System',
//       senderId: 'system',
//       content: `👋 ${payload.content}`,
//       timestamp: new Date().toISOString(),
//       roomId: roomId
//     };
    
//     setMessages(prev => [...prev, systemMessage]);
//   };

//   const handleAnnouncementBroadcast = (payload) => {
//     console.log('📣 Handling ANNOUNCEMENT broadcast:', payload);
    
//     const systemMessage = {
//       id: `sys_${Date.now()}`,
//       type: 'system',
//       sender: 'System',
//       senderId: 'system',
//       content: `📣 ${payload.content}`,
//       timestamp: new Date().toISOString(),
//       roomId: roomId
//     };
    
//     setMessages(prev => [...prev, systemMessage]);
    
//     showNotification({
//       title: '📢 Thông báo',
//       message: payload.content,
//       type: 'warning'
//     });
//   };

//   // Socket connection and message handling
//   useEffect(() => {
//     if (!currentUser) {
//       console.log('🚫 No current user, skipping socket setup');
//       return;
//     }

//     // Reset state when changing rooms
//     setMessages([]);
//     setOnlineUsers([]);
    
//     let chatSub, presenceSub, callSub, broadcastSub;
//     const username = currentUser?.fullName || currentUser?.username || 'User';
    
//     const setupSocketConnection = async () => {
//       try {
//         console.log('🔄 Starting socket setup for room:', roomId);
        
//         // Ensure socket is connected first
//         if (!socketService.isConnected) {
//           console.log('🔌 Connecting socket...');
//           await socketService.connect(); 
//         }
        
//         // Wait for connection to stabilize
//         await new Promise(resolve => setTimeout(resolve, 500));
        
//         const connected = socketService.isConnected;
//         setIsConnected(connected);
//         setConnectionStatus(connected ? 'connected' : 'disconnected');
        
//         if (!connected) {
//           console.error('❌ Socket failed to connect');
//           showNotification({
//             title: '❌ Lỗi kết nối',
//             message: 'Không thể kết nối đến server',
//             type: 'error'
//           });
//           return;
//         }
        
//         console.log('✅ Socket connected. Setting up subscriptions for room:', roomId);
        
//         // Subscribe to chat messages
//         chatSub = socketService.subscribeToChat(roomId, (message) => {
//           try {
//             console.log('💬 RECEIVED CHAT MESSAGE:', message);
            
//             // Validate payload
//             if (!message || !message.id || !message.content) {
//               console.warn('⚠️ Invalid message payload:', message);
//               return;
//             }
            
//             setMessages(prev => {
//               // Avoid duplicates by checking id
//               const existingMsg = prev.find(m => m.id === message.id);
//               if (existingMsg) {
//                 console.log('⚠️ Duplicate message ignored:', message.id);
//                 return prev;
//               }
              
//               console.log('✅ Adding new message to chat:', message.id);
//               return [...prev, message];
//             });
//           } catch (e) {
//             console.error('❌ Error parsing chat message:', e);
//           }
//         });
        
//         if (chatSub) {
//           console.log('✅ Successfully subscribed to chat for room:', roomId);
//         } else {
//           console.error('❌ Failed to subscribe to chat for room:', roomId);
//         }
        
//         // Subscribe to presence updates
//         presenceSub = socketService.subscribeToPresence(roomId, (message) => {
//           try {
//             console.log('👥 RECEIVED PRESENCE UPDATE:', message);
//             if (message?.users) {
//               const usersList = message.users.map(u => ({ 
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
              
//               console.log('👥 Setting online users:', usersList);
//               setOnlineUsers(usersList);
//             }
//           } catch (e) {
//             console.error('❌ Error parsing presence message:', e);
//           }
//         });
        
//         // Subscribe to call signaling
//         callSub = socketService.subscribeToCall(roomId, (message) => {
//           try {
//             console.log('📞 RECEIVED CALL SIGNALING:', message);
//             // Handle call signaling messages
//             if (message.type === 'offer' || message.type === 'answer' || message.type === 'ice-candidate') {
//               // These will be handled by EnhancedVideoCall component
//               console.log('📞 Call signaling received:', message.type);
//             }
//           } catch (e) {
//             console.error('❌ Error parsing call message:', e);
//           }
//         });
        
//         // Subscribe to broadcast channel
//         broadcastSub = socketService.subscribeToBroadcast((message) => {
//           try {
//             console.log('📢 RECEIVED BROADCAST:', message);
            
//             // Xử lý các loại broadcast khác nhau
//             switch (message.type) {
//               case 'ROOM_CREATED':
//                 handleRoomCreatedBroadcast(message);
//                 break;
//               case 'USER_JOINED':
//                 handleUserJoinedBroadcast(message);
//                 break;
//               case 'ANNOUNCEMENT':
//                 handleAnnouncementBroadcast(message);
//                 break;
//               default:
//                 console.log('ℹ️ Unknown broadcast type:', message.type);
//             }
//           } catch (e) {
//             console.error('❌ Error parsing broadcast message:', e);
//           }
//         });

//         // After subscriptions are ready, send join so presence/chat reflects immediately
//         const userId = currentUser?.id || currentUser?.userId || currentUser?.username || username;
//         console.log('🚀 Joining room with userId:', userId, 'username:', username);
        
//         socketService.joinRoom(roomId, username, {
//           id: userId,
//           userId: userId,
//           fullName: currentUser?.fullName || username,
//           name: currentUser?.fullName || currentUser?.username || username,
//           email: currentUser?.email || ''
//         });

//         showNotification({
//           title: '✅ Đã kết nối',
//           message: `Đã tham gia phòng ${roomId}`,
//           type: 'success',
//           duration: 3000
//         });

//       } catch (e) {
//         console.error('❌ Error in socket setup:', e);
//         showNotification({
//           title: '❌ Lỗi kết nối',
//           message: 'Không thể thiết lập kết nối real-time',
//           type: 'error'
//         });
//       }
//     };

//     setupSocketConnection();
    
//     return () => {
//       console.log('🧹 Cleaning up socket connections for room:', roomId);
//       try { 
//         socketService.leaveRoom(roomId, username); 
//       } catch (e) {
//         console.error('❌ Error leaving room:', e);
//       }
      
//       // Unsubscribe from all topics
//       if (chatSub) socketService.unsubscribe(`/topic/room.${roomId}.messages`);
//       if (presenceSub) socketService.unsubscribe(`/topic/room.${roomId}.presence`);
//       if (callSub) socketService.unsubscribe(`/topic/room.${roomId}.call`);
//       if (broadcastSub) socketService.unsubscribe('/topic/broadcast');
//     };
//   }, [roomId, currentUser]);

//   // Connection status monitoring
//   useEffect(() => {
//     const checkConnection = () => {
//       const wasConnected = isConnected;
//       const nowConnected = socketService.isConnected;
      
//       if (wasConnected !== nowConnected) {
//         console.log(`🔄 Connection status changed: ${wasConnected ? 'connected' : 'disconnected'} -> ${nowConnected ? 'connected' : 'disconnected'}`);
//         setIsConnected(nowConnected);
//         setConnectionStatus(nowConnected ? 'connected' : 'disconnected');
        
//         if (nowConnected && !wasConnected) {
//           showNotification({
//             title: '✅ Đã kết nối',
//             message: 'Kết nối real-time đã được khôi phục',
//             type: 'success',
//             duration: 3000
//           });
//         } else if (!nowConnected && wasConnected) {
//           showNotification({
//             title: '⚠️ Mất kết nối',
//             message: 'Mất kết nối real-time. Đang thử kết nối lại...',
//             type: 'warning',
//             duration: 4000
//           });
//         }
//       }
//     };

//     // Kiểm tra mỗi 5 giây
//     const interval = setInterval(checkConnection, 5000);
    
//     return () => clearInterval(interval);
//   }, [isConnected]);

//   // Drag & drop upload
//   useEffect(() => {
//     const el = dropRef.current;
//     if (!el) return;
    
//     const onDragOver = (e) => { 
//       e.preventDefault(); 
//       el.classList.add('ring-2','ring-blue-400'); 
//     };
    
//     const onDragLeave = (e) => { 
//       e.preventDefault(); 
//       el.classList.remove('ring-2','ring-blue-400'); 
//     };
    
//     const onDrop = (e) => {
//       e.preventDefault();
//       el.classList.remove('ring-2','ring-blue-400');
//       const file = e.dataTransfer.files && e.dataTransfer.files[0];
//       if (file) {
//         console.log('📁 File dropped:', file.name);
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
//     if (!newMessage.trim()) {
//       console.log('⚠️ Empty message, not sending');
//       return;
//     }
    
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
//       replyTo: replyTo ? { 
//         id: replyTo.id, 
//         sender: replyTo.sender, 
//         preview: String(replyTo.content).slice(0, 100) 
//       } : undefined,
//       reactions: {}
//     };
    
//     console.log('📤 SENDING MESSAGE:', {
//       roomId,
//       senderId,
//       messageId,
//       content: newMessage.trim(),
//       replyTo: replyTo ? replyTo.id : null
//     });
    
//     // Optimistic update
//     setMessages(prev => {
//       if (prev.find(m => m.id === messageId)) {
//         console.log('⚠️ Duplicate message ID in optimistic update');
//         return prev;
//       }
//       return [...prev, message];
//     });
    
//     // Send via socket
//     if (socketService.isConnected) {
//       try {
//         console.log('🔄 Calling socketService.sendMessage...');
//         socketService.sendMessage(roomId, message);
//         console.log('✅ Message sent via WebSocket');
//       } catch (err) {
//         console.error('❌ Error sending message via WebSocket:', err);
//         // Remove optimistic update on error
//         setMessages(prev => prev.filter(m => m.id !== messageId));
        
//         // Fallback to API
//         console.log('🔄 Falling back to API service...');
//         apiService.sendMessage(roomId, message).catch(apiErr => {
//           console.error('❌ API fallback also failed:', apiErr);
//         });
//       }
//     } else {
//       console.warn('⚠️ Socket not connected, using API fallback');
//       // Remove optimistic update if can't send
//       setMessages(prev => prev.filter(m => m.id !== messageId));
      
//       // Use API as fallback
//       apiService.sendMessage(roomId, message).then(() => {
//         console.log('✅ Message sent via API');
//       }).catch(apiErr => {
//         console.error('❌ API send failed:', apiErr);
//       });
//     }
    
//     setNewMessage('');
//     setReplyTo(null);
//   };

//   const sendCode = (codeData) => {
//     console.log('💻 Sending code snippet:', {
//       language: codeData.language,
//       fileName: codeData.fileName,
//       contentLength: codeData.content.length
//     });
    
//     const message = {
//       id: Date.now(),
//       sender: currentUser?.fullName || currentUser?.username || 'You',
//       content: codeData.content,
//       timestamp: new Date(),
//       type: 'code',
//       language: codeData.language,
//       fileName: codeData.fileName,
//       avatar: (currentUser?.fullName || currentUser?.username || 'Y').charAt(0).toUpperCase()
//     };
    
//     setMessages(prev => [...prev, message]);
    
//     // Also send via socket if connected
//     if (socketService.isConnected) {
//       socketService.sendMessage(roomId, message);
//     }
//   };

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) {
//       console.log('⚠️ No file selected');
//       return;
//     }

//     console.log('📁 Handling file upload:', {
//       name: file.name,
//       type: file.type,
//       size: file.size
//     });

//     if (file.type.startsWith('image/')) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         console.log('🖼️ Image preview created');
//         setImagePreviews(prev => [...prev, { 
//           name: file.name, 
//           size: file.size, 
//           dataUrl: e.target.result 
//         }]);
//       };
//       reader.readAsDataURL(file);
//       return;
//     }

//     try {
//       // Upload file via API
//       console.log('🔄 Uploading file via API...');
//       const uploadResponse = await apiService.uploadFile(file, roomId);
//       console.log('✅ File uploaded successfully:', uploadResponse);

//       const message = {
//         id: Date.now(),
//         sender: currentUser?.fullName || currentUser?.username || 'You',
//         content: file.name,
//         timestamp: new Date(),
//         type: 'file',
//         fileName: file.name,
//         fileSize: file.size,
//         fileId: uploadResponse.fileId,
//         avatar: (currentUser?.fullName || currentUser?.username || 'Y').charAt(0).toUpperCase()
//       };

//       setMessages(prev => [...prev, message]);

//       // Also send via socket if connected
//       if (socketService.isConnected) {
//         socketService.sendMessage(roomId, message);
//       }

//     } catch (error) {
//       console.error('❌ File upload failed:', error);
//       showNotification({
//         title: '❌ Lỗi upload',
//         message: 'Không thể upload file',
//         type: 'error'
//       });
//     }
//   };

//   // Call functions
//   const startVideoCall = () => {
//     console.log('📹 Starting video call');
//     setIsVideoCall(true);
//     setIsVoiceCall(false);
//   };

//   const startVoiceCall = () => {
//     console.log('📞 Starting voice call');
//     setIsVoiceCall(true);
//     setIsVideoCall(false);
//   };

//   const endCall = () => {
//     console.log('📵 Ending call');
//     setIsVideoCall(false);
//     setIsVoiceCall(false);
//     setIsScreenSharing(false);
//   };

//   const toggleMute = () => {
//     console.log('🔇 Toggle mute:', !isMuted);
//     setIsMuted(!isMuted);
//   };

//   const toggleScreenShare = () => {
//     console.log('🖥️ Toggle screen share:', !isScreenSharing);
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
//       console.log('📋 Room link copied to clipboard');
//       setCopiedLink(true);
//       setTimeout(() => setCopiedLink(false), 2000);
//     } catch (err) {
//       console.log('📋 Using fallback copy method');
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
//     console.log('🔗 Sharing room:', roomId);
//     setShowShareModal(true);
//     copyRoomLink();
//   };

//   const generateRoomCode = async () => {
//     const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    
//     console.log('🎯 Generating new room:', code);
    
//     try {
//       showNotification({
//         title: '🔄 Đang tạo phòng...',
//         message: `Đang tạo phòng ${code}`,
//         type: 'info',
//         duration: 3000
//       });

//       // Kiểm tra và đảm bảo kết nối WebSocket
//       let socketReady = socketService.isConnected;
      
//       if (!socketReady) {
//         console.log('🔄 WebSocket not connected, attempting connection...');
//         try {
//           await socketService.connect();
//           await new Promise(resolve => setTimeout(resolve, 500));
//           socketReady = socketService.isConnected;
          
//           if (socketReady) {
//             console.log('✅ WebSocket connected successfully');
//           }
//         } catch (socketError) {
//           console.error('❌ WebSocket connection failed:', socketError);
//           socketReady = false;
//         }
//       }

//       // Tạo room data
//       const roomData = {
//         name: code,
//         description: `Phòng chat được tạo bởi ${currentUser?.fullName || currentUser?.username}`,
//         createdBy: currentUser?.id || currentUser?.username,
//         type: 'PUBLIC'
//       };
      
//       // Gửi broadcast thông báo tạo phòng
//       if (socketReady) {
//         try {
//           const broadcastMessage = {
//             id: `broadcast_${Date.now()}`,
//             type: 'ROOM_CREATED',
//             sender: 'System',
//             senderId: 'system',
//             content: `${currentUser?.fullName || currentUser?.username} đã tạo phòng mới: ${code}`,
//             timestamp: new Date().toISOString(),
//             roomData: roomData,
//             action: 'JOIN_ROOM'
//           };
          
//           socketService.broadcastToAll('/app/broadcast', broadcastMessage);
//           console.log('✅ Room creation broadcast sent');
          
//         } catch (broadcastError) {
//           console.error('❌ Broadcast failed:', broadcastError);
//         }
//       }

//       // Tạo room thông qua API
//       try {
//         console.log('🔄 Creating room via API...');
//         await apiService.createRoom(roomData);
//         console.log('✅ Room created in database');
//       } catch (apiError) {
//         console.error('❌ API room creation failed:', apiError);
//         // Continue anyway as room can be client-side only
//       }

//       // Chuyển hướng đến phòng mới
//       setTimeout(() => {
//         console.log('🚀 Navigating to new room:', code);
//         navigate(`/chat/${code}`);
//       }, 1000);

//     } catch (error) {
//       console.error('❌ Room creation failed:', error);
//       showNotification({
//         title: '❌ Lỗi',
//         message: 'Không thể tạo phòng. Vui lòng thử lại.',
//         type: 'error',
//         duration: 5000
//       });
//     }
//   };

//   const joinByCode = () => {
//     const code = String(joinRoomCode || '').trim().toUpperCase();
//     if (!code) {
//       console.log('⚠️ No room code provided');
//       return;
//     }
    
//     console.log('🚪 Joining room by code:', code);
//     navigate(`/chat/${code}`);
//     setJoinRoomCode('');
//   };

//   // Redirect to login if not authenticated
//   useEffect(() => {
//     if (!currentUser) {
//       console.log('🔐 No user found, redirecting to login');
//       if (roomId && roomId !== 'general') {
//         sessionStorage.setItem('redirectAfterLogin', `/chat/${roomId}`);
//       }
//       navigate('/login');
//     }
//   }, [currentUser, navigate, roomId]);

//   if (!currentUser) {
//     console.log('👤 User not authenticated, rendering null');
//     return null;
//   }

//   // Debug info component
//   const DebugInfo = () => {
//     if (process.env.NODE_ENV !== 'development') return null;
    
//     return (
//       <div className="fixed top-2 right-2 bg-black/80 text-white text-xs p-2 rounded z-50 font-mono">
//         <div>Messages: {messages.length}</div>
//         <div>Users: {onlineUsers.length}</div>
//         <div>Status: {connectionStatus}</div>
//         <div>Room: {roomId}</div>
//         <div>Query: "{sidebarQuery}"</div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 overflow-hidden">
//       <DebugInfo />
      
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
//                       console.log('🚪 Logging out');
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
//             onChange={(e) => {
//               setSidebarQuery(e.target.value);
//               console.log('🔍 Search query:', e.target.value);
//             }}
//             placeholder="Tìm phòng hoặc người..."
//             className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <div className="mt-3 flex items-center gap-2">
//             <input
//               type="text"
//               value={joinRoomCode}
//               onChange={(e) => setJoinRoomCode(e.target.value)}
//               placeholder="Nhập mã phòng..."
//               className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={joinByCode}
//               className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Vào
//             </button>
//           </div>
//           <button
//             onClick={generateRoomCode}
//             className="mt-2 w-full text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//           >
//             Tạo phòng ngẫu nhiên
//           </button>
//         </div>
        
//         {/* Channels */}
//         <div className="p-3 border-b">
//           <h2 className="text-xs font-semibold text-gray-500 mb-2">Kênh</h2>
//           <div className="space-y-1 max-h-56 overflow-y-auto">
//             {["general","team","random","webrtc","support"].filter(c => c.includes(sidebarQuery.toLowerCase())).map((c) => (
//               <div 
//                 key={c} 
//                 onClick={() => {
//                   console.log('🔗 Switching to channel:', c);
//                   navigate(`/chat/${c}`);
//                 }}
//                 className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${c === roomId ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
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
//                   <div className="w-7 h-7 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs font-medium">
//                     {user.avatar}
//                   </div>
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
//                 <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm font-medium">
//                   {user.avatar}
//                 </div>
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
//                 {!isConnected && <span className="ml-2 text-red-500">• Đang kết nối...</span>}
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
//               onClick={() => {
//                 console.log('🤖 Toggling AI Assistant');
//                 setShowAIAssistant(!showAIAssistant);
//               }} 
//               className={`p-2 rounded-lg transition-colors ${showAIAssistant ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} 
//               title="AI Assistant"
//             >
//               <Bot className="h-5 w-5" />
//             </button>
//             <button 
//               onClick={startVoiceCall}
//               className={`p-2 rounded-lg transition-colors ${isVoiceCall ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
//               title="Gọi thoại"
//             >
//               <Phone className="h-5 w-5" />
//             </button>
//             <button 
//               onClick={startVideoCall}
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
//             <div className="px-4 py-2 text-xs text-gray-500 bg-white border-b">
//               Kết quả cho: "{sidebarQuery}"
//             </div>
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
          
//           {messages.length > 0 && (
//             <Virtuoso
//               key={roomId}
//               ref={listRef}
//               data={messages.filter(m =>
//                 !sidebarQuery || String(m.content).toLowerCase().includes(sidebarQuery.toLowerCase())
//               )}
//               itemContent={(index, message) => {
//                 // Xử lý system messages
//                 if (message.type === 'system') {
//                   return (
//                     <div className="flex justify-center my-2">
//                       <div className={`
//                         inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
//                         ${message.content.includes('📢') ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
//                           message.content.includes('👋') ? 'bg-green-100 text-green-800 border border-green-200' :
//                           'bg-gray-100 text-gray-800 border border-gray-200'}
//                       `}>
//                         {message.content}
//                         {message.action === 'JOIN_ROOM' && message.roomData && (
//                           <button
//                             onClick={() => {
//                               console.log('🚀 Joining room from system message:', message.roomData.name);
//                               navigate(`/chat/${message.roomData.name}`);
//                             }}
//                             className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600 transition-colors"
//                           >
//                             Tham gia
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 }

//                 const isOwn = (currentUser?.id || currentUser?.username) === (message.senderId || message.sender) ||
//                             (currentUser?.fullName || currentUser?.username || 'You') === message.sender;
                
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
                        
//                         {message.type === 'text' && (
//                           <div className={`${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} inline-block px-3 py-2 rounded-2xl ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
//                             {message.replyTo && (
//                               <div className="text-xs opacity-80 mb-1 border-l-2 pl-2">
//                                 Trả lời {message.replyTo.sender}: {message.replyTo.preview}
//                               </div>
//                             )}
//                             {editingMessageId === message.id ? (
//                               <input
//                                 className={`w-full bg-transparent outline-none ${isOwn ? 'placeholder-white/80' : 'placeholder-gray-500'}`}
//                                 value={editingContent}
//                                 onChange={(e) => setEditingContent(e.target.value)}
//                                 onKeyDown={(e) => {
//                                   if (e.key === 'Enter') {
//                                     console.log('💾 Saving edited message:', message.id);
//                                     setMessages(prev => prev.map(m => m.id === message.id ? { ...m, content: editingContent } : m));
//                                     setEditingMessageId(null);
//                                   } else if (e.key === 'Escape') {
//                                     console.log('❌ Canceling edit');
//                                     setEditingMessageId(null);
//                                   }
//                                 }}
//                                 autoFocus
//                               />
//                             ) : (
//                               <span>{message.content}</span>
//                             )}
//                             {/* Reactions */}
//                             {message.reactions && Object.keys(message.reactions).length > 0 && (
//                               <div className={`mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} gap-1 text-xs`}>
//                                 {Object.entries(message.reactions).map(([emo, count]) => (
//                                   <span key={emo} className="px-2 py-0.5 rounded-full bg-black/10">
//                                     {emo} {count}
//                                   </span>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         )}
                        
//                         {message.type === 'code' && (
//                           <div className="bg-gray-100 rounded-lg p-3 mt-2 text-left">
//                             <div className="flex items-center justify-between mb-2">
//                               <div className="flex items-center space-x-2">
//                                 <span className="text-xs font-medium text-gray-600">{message.language || 'code'}</span>
//                                 {message.fileName && (<span className="text-xs text-gray-500">({message.fileName})</span>)}
//                               </div>
//                               <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                 <button 
//                                   className="text-xs text-blue-600 hover:text-blue-800 p-1"
//                                   onClick={() => console.log('💾 Downloading code snippet')}
//                                 >
//                                   <Download className="h-3 w-3" />
//                                 </button>
//                               </div>
//                             </div>
//                             <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded border max-h-60 overflow-auto">
//                               {message.content}
//                             </pre>
//                           </div>
//                         )}
                        
//                         {message.type === 'file' && (
//                           <div className="bg-gray-100 rounded-lg p-3 mt-2 flex items-center space-x-3">
//                             <FileText className="h-8 w-8 text-blue-500" />
//                             <div className="flex-1">
//                               <p className="font-medium text-sm">{message.fileName}</p>
//                               <p className="text-xs text-gray-500">{message.fileSize} bytes</p>
//                             </div>
//                             <button 
//                               className="text-blue-600 hover:text-blue-800"
//                               onClick={() => console.log('💾 Downloading file:', message.fileName)}
//                             >
//                               <Download className="h-4 w-4" />
//                             </button>
//                           </div>
//                         )}
                        
//                         {/* Hover actions */}
//                         <div className={`mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
//                           <button 
//                             onClick={() => {
//                               console.log('↩️ Replying to message:', message.id);
//                               setReplyTo(message);
//                             }} 
//                             className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
//                           >
//                             Trả lời
//                           </button>
//                           <button 
//                             onClick={() => {
//                               const emo = '👍';
//                               console.log('😀 Adding reaction to message:', message.id);
//                               setMessages(prev => prev.map(m => m.id === message.id ? { 
//                                 ...m, 
//                                 reactions: { ...m.reactions, [emo]: (m.reactions?.[emo] || 0) + 1 } 
//                               } : m));
//                             }} 
//                             className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
//                           >
//                             Cảm xúc
//                           </button>
//                           {isOwn && (
//                             <>
//                               <button 
//                                 onClick={() => { 
//                                   console.log('✏️ Editing message:', message.id);
//                                   setEditingMessageId(message.id); 
//                                   setEditingContent(message.content); 
//                                 }} 
//                                 className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
//                               >
//                                 Sửa
//                               </button>
//                               <button 
//                                 onClick={() => {
//                                   console.log('🗑️ Deleting message:', message.id);
//                                   setMessages(prev => prev.filter(m => m.id !== message.id));
//                                 }} 
//                                 className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-red-600"
//                               >
//                                 Xóa
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       {isOwn && (
//                         <div className="ml-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
//                           {message.avatar}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               }}
//               followOutput={true}
//             />
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
//                     onClick={() => {
//                       console.log('🗑️ Removing image preview:', idx);
//                       setImagePreviews(prev => prev.filter((_, i) => i !== idx));
//                     }}
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
//           onClose={() => {
//             console.log('❌ Closing code editor');
//             setShowCodeEditor(false);
//           }} 
//           onSendCode={sendCode}
//           initialCode={codeContent} 
//           initialLanguage={codeLanguage} 
//         />

//         {/* Message Input */}
//         <div className="bg-white border-t border-gray-200 p-4">
//           {replyTo && (
//             <div className="mb-2 text-xs text-gray-600 border-l-2 border-blue-400 pl-2">
//               Trả lời {replyTo.sender}: {String(replyTo.content).slice(0,120)}
//               <button 
//                 className="ml-2 text-blue-600" 
//                 onClick={() => {
//                   console.log('❌ Canceling reply');
//                   setReplyTo(null);
//                 }}
//               >
//                 Hủy
//               </button>
//             </div>
//           )}
//           <div className="flex items-center space-x-2">
//             <button 
//               onClick={() => {
//                 console.log('📎 Opening file picker');
//                 fileInputRef.current?.click();
//               }} 
//               className="p-2 text-gray-500 hover:text-gray-700"
//             >
//               <Paperclip className="h-5 w-5" />
//             </button>
//             <button 
//               onClick={() => {
//                 console.log('💻 Opening code editor');
//                 setShowCodeEditor(true);
//               }} 
//               className="p-2 text-gray-500 hover:text-gray-700"
//             >
//               <Code className="h-5 w-5" />
//             </button>
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
//                   window.__typingTimer = window.setTimeout(() => {
//                     console.log('⏹️ Stopped typing');
//                     setIsTyping(false);
//                   }, 1200);
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
//               <button 
//                 onClick={() => {
//                   console.log('😊 Toggling emoji picker');
//                   setShowEmoji(v => !v);
//                 }} 
//                 className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//               >
//                 <Smile className="h-5 w-5" />
//               </button>
//               {showEmoji && (
//                 <div className="absolute bottom-12 right-0 z-50 bg-white rounded-lg shadow-lg border p-2 w-64">
//                   <div className="grid grid-cols-8 gap-1 text-xl">
//                     {EMOJIS.map((e, i) => (
//                       <button 
//                         key={i} 
//                         className="hover:bg-gray-100 rounded" 
//                         onClick={() => { 
//                           console.log('😊 Adding emoji:', e);
//                           setNewMessage(prev => prev + e); 
//                           setShowEmoji(false); 
//                         }}
//                       >
//                         {e}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//             <button 
//               onClick={sendMessage}
//               className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               <Send className="h-5 w-5" />
//             </button>
//           </div>
//           {isTyping && (
//             <div className="mt-2 text-xs text-gray-500">Đang nhập...</div>
//           )}
//           <input 
//             ref={fileInputRef} 
//             type="file" 
//             onChange={handleFileUpload}
//             className="hidden" 
//             accept="image/*,.txt,.js,.py,.java,.cpp,.html,.css,.json,.md" 
//           />
//         </div>
//       </div>

//       {/* AI Assistant */}
//       <AIAssistant 
//         isOpen={showAIAssistant} 
//         onClose={() => {
//           console.log('❌ Closing AI Assistant');
//           setShowAIAssistant(false);
//         }} 
//         onMinimize={() => {
//           console.log('📱 Toggling AI Assistant minimize');
//           setIsAIMinimized(!isAIMinimized);
//         }} 
//       />

//       {/* Video Call */}
//       <EnhancedVideoCall 
//         isActive={isVideoCall || isVoiceCall} 
//         onEndCall={endCall}
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
//                 onClick={() => {
//                   console.log('❌ Closing share modal');
//                   setShowShareModal(false);
//                 }}
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
//                   console.log('🔗 Sharing room via Web Share API');
//                   // Try to use Web Share API if available
//                   if (navigator.share) {
//                     navigator.share({
//                       title: `Tham gia phòng chat: ${roomId}`,
//                       text: `Tham gia phòng chat ${roomId}`,
//                       url: `${window.location.origin}/chat/${roomId}`
//                     }).catch(err => console.log('❌ Web Share error:', err));
//                   }
//                 }}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Chia sẻ
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Notification Container */}
//       <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
//         {notifications.map((notification) => (
//           <Notification
//             key={notification.id}
//             notification={notification}
//             onClose={() => removeNotification(notification.id)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ChatRoom;


// export default ChatRoom;
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
   * Gửi tin nhắn mới
   */
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const messageData = {
      content: newMessage.trim(),
      type: 'TEXT',
      replyTo: replyTo ? { 
        id: replyTo.id, 
        sender: replyTo.sender, 
        preview: String(replyTo.content).slice(0, 100) 
      } : undefined
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
  }, [newMessage, replyTo, sendMessage, stopTyping]);

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

    // Xác định endpoint dựa trên loại file
    const isImage = file.type.startsWith('image/');
    const endpoint = isImage ? '/upload/image' : '/upload/file';

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

    // TODO: Gọi API upload file
    console.log(`📁 Uploading ${isImage ? 'image' : 'file'}:`, file.name);
    
    showNotification({
      title: '📤 Đang upload file',
      message: `Đang upload ${file.name}...`,
      type: 'info',
      duration: 3000
    });

  }, [numericRoomId]);

  // ========== ROOM OPERATIONS ==========

  /**
   * Tạo phòng mới với ID ngẫu nhiên (số)
   */
  const generateRoomCode = useCallback(async () => {
    try {
      // Tạo room ID ngẫu nhiên (số)
      const randomRoomId = Math.floor(100000 + Math.random() * 900000); // 6 chữ số
      
      const roomData = {
        name: `Room ${randomRoomId}`,
        description: `Phòng chat được tạo bởi ${currentUser?.fullName || currentUser?.username}`,
        type: 'PUBLIC',
        maxMembers: 50
      };

      showNotification({
        title: '🔄 Đang tạo phòng...',
        message: `Đang tạo phòng ${randomRoomId}`,
        type: 'info',
        duration: 3000
      });

      // Tạo phòng qua API
      const newRoom = await createRoom(roomData);
      
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
  }, [createRoom, currentUser, navigate]);

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
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  }, []);

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

      {/* Code Editor */}
      <CodeEditor 
        isOpen={showCodeEditor} 
        onClose={() => setShowCodeEditor(false)} 
        onSendCode={(codeData) => {
          sendMessage({
            content: codeData.content,
            type: 'CODE',
            language: codeData.language,
            fileName: codeData.fileName
          }).catch(console.error);
        }}
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
