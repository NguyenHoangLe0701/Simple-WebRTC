import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';
import AIAssistant from '../components/AIAssistant';
import VideoCall from '../components/VideoCall';
import CodeEditor from '../components/CodeEditor';
import { Virtuoso } from 'react-virtuoso';
import socketService from '../services/socket';
// Lightweight inline emoji picker (no external lib to avoid peer deps)

const ChatRoom = () => {
  const { roomId = 'general' } = useParams();
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
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
    let chatSub, presenceSub;
    const username = currentUser?.fullName || currentUser?.username || 'User';
    (async () => {
      if (!socketService.isConnected) {
        try { await socketService.connect(); } catch (e) { console.error(e); }
      }
      setIsConnected(socketService.isConnected);
      // Join room and subscribe
      socketService.joinRoom(roomId, username);
      chatSub = socketService.subscribeToChat(roomId, (messageFrame) => {
        try {
          const payload = JSON.parse(messageFrame.body);
          setMessages(prev => [...prev, payload]);
        } catch {}
      });
      presenceSub = socketService.subscribeToPresence(roomId, (messageFrame) => {
        try {
          const payload = JSON.parse(messageFrame.body);
          if (payload?.users) {
            setOnlineUsers(payload.users.map(u => ({ id: u.id || u.username, name: u.fullName || u.username, avatar: (u.fullName || u.username || 'U').charAt(0).toUpperCase(), status: u.status || 'online' })));
          }
        } catch {}
      });
    })();
    return () => {
      try { socketService.leaveRoom(roomId, username); } catch {}
      if (chatSub) socketService.unsubscribe(`/topic/chat/${roomId}`);
      if (presenceSub) socketService.unsubscribe(`/topic/presence/${roomId}`);
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
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: currentUser?.fullName || currentUser?.username || 'You',
        content: newMessage,
        timestamp: new Date(),
        type: 'text',
        avatar: (currentUser?.fullName || currentUser?.username || 'Y').charAt(0).toUpperCase(),
        replyTo: replyTo ? { id: replyTo.id, sender: replyTo.sender, preview: String(replyTo.content).slice(0, 100) } : undefined,
        reactions: {}
      };
      // Optimistic update and emit over socket
      setMessages(prev => [...prev, message]);
      if (socketService.isConnected) {
        socketService.sendMessage(roomId, message);
      }
      setNewMessage('');
      setReplyTo(null);
    }
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
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
              <div key={c} className={`px-3 py-2 rounded-lg cursor-pointer ${c===roomId? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}>
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
          <div className="flex items-center space-x-6 ">
            <div className="w-14 h-12   rounded-full flex items-center justify-center  font-medium ">
             <img src="images/icons/icon-cloudy.png" alt="Admin" className="ml-5 h-12 w-26 rounded-full object-contain" />
             </div>
            <div>
              <h2 className="font-semibold">Phòng: {roomId}</h2>
              <p className="text-sm text-gray-500">{onlineUsers.length} thành viên</p>
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
              {/* <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition"> */}
                {/* <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button> */}
              {/* </div> */}
            </div>
            <button onClick={() => setShowAIAssistant(!showAIAssistant)} className={`p-2 rounded-lg ${showAIAssistant ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="AI Assistant">
              <Bot className="h-5 w-5" />
            </button>
            <button onClick={() => setIsVoiceCall(true)} className={`p-2 rounded-lg ${isVoiceCall ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Phone className="h-5 w-5" />
            </button>
            <button onClick={() => setIsVideoCall(true)} className={`p-2 rounded-lg ${isVideoCall ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages (virtualized) */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick search inline */}
          {sidebarQuery && (
            <div className="px-4 py-2 text-xs text-gray-500">Kết quả cho: "{sidebarQuery}"</div>
          )}
          <Virtuoso
            ref={listRef}
            data={messages.filter(m =>
              !sidebarQuery || String(m.content).toLowerCase().includes(sidebarQuery.toLowerCase())
            )}
            itemContent={(index, message) => {
              const isOwn = (currentUser?.fullName || currentUser?.username || 'You') === message.sender;
              return (
                <div className="px-4 py-2 group">
                  <div className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                      <div className="mr-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">{message.avatar}</div>
                    )}
                    <div className={`max-w-[72%] ${isOwn ? 'text-right' : 'text-left'}`}>
                      <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
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
                  window.clearTimeout(window.__typingTimer);
                  window.__typingTimer = window.setTimeout(()=>setIsTyping(false), 1200);
                }} 
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
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
      <VideoCall isActive={isVideoCall} onEndCall={()=>{ setIsVideoCall(false); setIsVoiceCall(false); setIsScreenSharing(false); }} roomId={roomId} />
    </div>
  );
};

export default ChatRoom;