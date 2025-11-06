import { useState, useEffect, useCallback, useRef } from 'react';
import ApiService from '../services/apiService';
import { useWebSocket } from './useWebSocket';

/**
 * Hook quản lý tất cả operations liên quan đến tin nhắn trong phòng
 * @param {number} roomId - ID của phòng chat
 * @returns {Object} Các phương thức và state quản lý tin nhắn
 */
export const useMessages = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 50;
  
  const messagesEndRef = useRef(null);
  const typingUsersRef = useRef(new Set());
  const [typingUsers, setTypingUsers] = useState([]);

  const { 
    sendMessage: wsSendMessage,
    reactToMessage: wsReactToMessage,
    deleteMessage: wsDeleteMessage,
    startTyping: wsStartTyping,
    stopTyping: wsStopTyping,
    subscribeToRoomMessages,
    subscribeToTyping
  } = useWebSocket();

  // ========== MESSAGE FETCHING METHODS ==========

  /**
   * Lấy tin nhắn từ API với phân trang
   * @param {number} pageNum - Số trang (mặc định: 0)
   * @param {boolean} shouldAppend - Có append vào messages hiện tại không
   * @returns {Promise}
   */
  const fetchMessages = useCallback(async (pageNum = 0, shouldAppend = false) => {
    if (!roomId) {
      console.warn('⚠️ Room ID is required to fetch messages');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API lấy tin nhắn
      const response = await ApiService.getRoomMessages(roomId, pageNum, pageSize);
      
      // Xử lý response theo chuẩn ApiResponse
      const messagesData = response?.data?.content || response?.content || response?.data || response;
      const isLastPage = response?.data?.last ?? response?.last ?? (messagesData.length < pageSize);

      setHasMore(!isLastPage);
      
      if (shouldAppend) {
        // Append tin nhắn cũ (cho load more)
        setMessages(prev => [...(Array.isArray(messagesData) ? messagesData.reverse() : []), ...prev]);
      } else {
        // Thay thế toàn bộ tin nhắn (load mới)
        setMessages(Array.isArray(messagesData) ? messagesData.reverse() : []);
      }
      
      setPage(pageNum);
      console.log(`✅ Loaded ${messagesData.length} messages for room ${roomId}, page ${pageNum}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load messages';
      console.error(`❌ Failed to fetch messages for room ${roomId}:`, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [roomId, pageSize]);

  /**
   * Load thêm tin nhắn cũ (pagination)
   */
  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading) {
      console.log(`📥 Loading more messages for room ${roomId}, page ${page + 1}`);
      fetchMessages(page + 1, true);
    }
  }, [hasMore, loading, page, roomId, fetchMessages]);

  // ========== MESSAGE OPERATIONS ==========

  /**
   * Gửi tin nhắn mới
   * @param {Object} messageData - Dữ liệu tin nhắn { content, type, fileId, replyTo }
   * @returns {Promise<Object|null>} Tin nhắn vừa gửi (nếu dùng REST fallback)
   */
  const sendMessage = useCallback(async (messageData) => {
    if (!roomId) {
      console.warn('⚠️ Room ID is required to send message');
      return null;
    }
    
    try {
      setError(null);
      
      // Ưu tiên gửi qua WebSocket để real-time
      const wsSuccess = wsSendMessage(roomId, messageData);
      
      if (!wsSuccess) {
        // Fallback to REST API nếu WebSocket fail
        console.log('🔄 Using REST fallback for sending message');
        const response = await ApiService.sendMessage(roomId, messageData);
        const newMessage = response?.data || response;
        
        // Thêm vào local state ngay lập tức (optimistic update)
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      }
      
      // WebSocket sẽ trigger message mới qua subscription
      return null;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send message';
      console.error('❌ Failed to send message:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, [roomId, wsSendMessage]);

  /**
   * Thêm reaction vào tin nhắn
   * @param {number} messageId - ID tin nhắn
   * @param {string} reaction - Emoji reaction
   * @returns {Promise}
   */
  const addReaction = useCallback(async (messageId, reaction) => {
    try {
      setError(null);
      
      // Ưu tiên WebSocket
      const wsSuccess = wsReactToMessage(roomId, messageId, reaction);
      
      if (!wsSuccess) {
        // Fallback to REST API
        await ApiService.addReaction(messageId, reaction);
        
        // Optimistic update local state
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            const existingReactions = msg.reactions || [];
            const userReactionIndex = existingReactions.findIndex(r => r.userId === msg.currentUserId);
            
            if (userReactionIndex > -1) {
              // Update existing reaction
              const updatedReactions = [...existingReactions];
              updatedReactions[userReactionIndex] = { 
                ...updatedReactions[userReactionIndex], 
                reaction 
              };
              return { ...msg, reactions: updatedReactions };
            } else {
              // Add new reaction
              return { 
                ...msg, 
                reactions: [...existingReactions, { reaction, userId: msg.currentUserId }] 
              };
            }
          }
          return msg;
        }));
      }
      
      console.log(`👍 Added reaction ${reaction} to message ${messageId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add reaction';
      console.error('❌ Failed to add reaction:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, [roomId, wsReactToMessage]);

  /**
   * Xóa reaction khỏi tin nhắn
   * @param {number} messageId - ID tin nhắn
   * @param {string} reaction - Emoji reaction
   * @returns {Promise}
   */
  const removeReaction = useCallback(async (messageId, reaction) => {
    try {
      setError(null);
      await ApiService.removeReaction(messageId, reaction);
      
      // Optimistic update local state
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const updatedReactions = (msg.reactions || []).filter(r => 
            !(r.reaction === reaction && r.userId === msg.currentUserId)
          );
          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      }));
      
      console.log(`👎 Removed reaction ${reaction} from message ${messageId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove reaction';
      console.error('❌ Failed to remove reaction:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Xóa tin nhắn
   * @param {number} messageId - ID tin nhắn
   * @returns {Promise}
   */
  const deleteMessage = useCallback(async (messageId) => {
    try {
      setError(null);
      
      // Ưu tiên WebSocket
      const wsSuccess = wsDeleteMessage(roomId, messageId);
      
      if (!wsSuccess) {
        // Fallback to REST API
        await ApiService.deleteMessage(messageId);
        
        // Optimistic update - xóa khỏi local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
      
      console.log(`🗑️ Deleted message ${messageId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete message';
      console.error('❌ Failed to delete message:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, [roomId, wsDeleteMessage]);

  /**
   * Cập nhật tin nhắn
   * @param {number} messageId - ID tin nhắn
   * @param {Object} messageData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Tin nhắn đã cập nhật
   */
  const updateMessage = useCallback(async (messageId, messageData) => {
    try {
      setError(null);
      const response = await ApiService.updateMessage(messageId, messageData);
      const updatedMessage = response?.data || response;
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
      
      console.log(`✏️ Updated message ${messageId}`);
      return updatedMessage;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update message';
      console.error('❌ Failed to update message:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Tìm kiếm tin nhắn trong phòng
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách tin nhắn tìm thấy
   */
  const searchMessages = useCallback(async (query) => {
    if (!roomId) {
      console.warn('⚠️ Room ID is required to search messages');
      return [];
    }
    
    try {
      setLoading(true);
      const response = await ApiService.searchMessagesInRoom(roomId, query);
      const messagesData = response?.data || response;
      console.log(`🔍 Found ${messagesData.length} messages for query: "${query}"`);
      return Array.isArray(messagesData) ? messagesData : [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to search messages';
      console.error('❌ Failed to search messages:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // ========== TYPING INDICATORS ==========

  /**
   * Gửi sự kiện bắt đầu gõ
   */
  const startTyping = useCallback(() => {
    if (!roomId) return;
    wsStartTyping(roomId);
  }, [roomId, wsStartTyping]);

  /**
   * Gửi sự kiện dừng gõ
   */
  const stopTyping = useCallback(() => {
    if (!roomId) return;
    wsStopTyping(roomId);
  }, [roomId, wsStopTyping]);

  // ========== WEBSOCKET EVENT HANDLERS ==========

  /**
   * Xử lý tin nhắn mới từ WebSocket
   */
  const handleNewMessage = useCallback((message) => {
    setMessages(prev => {
      // Kiểm tra trùng lặp tin nhắn
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) {
        // Update tin nhắn đã tồn tại (cho reaction, edit, etc.)
        return prev.map(msg => msg.id === message.id ? message : msg);
      }
      // Thêm tin nhắn mới
      return [...prev, message];
    });
    
    // Auto-scroll xuống tin nhắn mới
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    console.log('📩 Received new message via WebSocket');
  }, []);

  /**
   * Xử lý sự kiện typing từ WebSocket
   */
  const handleTypingEvent = useCallback((event) => {
    const { type, userId, username, user } = event;
    
    if (type === 'TYPING_START') {
      typingUsersRef.current.add(userId);
      setTypingUsers(prev => {
        const userInfo = user || { id: userId, username, fullName: username };
        return [...prev.filter(u => u.id !== userId), userInfo];
      });
    } else if (type === 'TYPING_STOP') {
      typingUsersRef.current.delete(userId);
      setTypingUsers(prev => prev.filter(u => u.id !== userId));
    }
  }, []);

  // ========== AUTO CLEANUP TYPING USERS ==========

  useEffect(() => {
    const interval = setInterval(() => {
      // Tự động xóa users không gõ sau 3 giây
      const now = Date.now();
      // Có thể implement timestamp check ở đây nếu backend gửi
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ========== WEBSOCKET SUBSCRIPTIONS ==========

  useEffect(() => {
    if (!roomId) return;

    let messageSubscription;
    let typingSubscription;

    // Subscribe to new messages
    messageSubscription = subscribeToRoomMessages(roomId, handleNewMessage);
    
    // Subscribe to typing events
    typingSubscription = subscribeToTyping(roomId, handleTypingEvent);

    console.log(`🎯 Subscribed to WebSocket events for room ${roomId}`);

    return () => {
      // Cleanup subscriptions khi room thay đổi
      if (messageSubscription && messageSubscription.unsubscribe) {
        messageSubscription.unsubscribe();
      }
      if (typingSubscription && typingSubscription.unsubscribe) {
        typingSubscription.unsubscribe();
      }
      console.log(`🔕 Unsubscribed from WebSocket events for room ${roomId}`);
    };
  }, [roomId, subscribeToRoomMessages, subscribeToTyping, handleNewMessage, handleTypingEvent]);

  // ========== AUTO FETCH MESSAGES ON ROOM CHANGE ==========

  useEffect(() => {
    if (roomId) {
      // Reset state và fetch messages mới khi room thay đổi
      setMessages([]);
      setPage(0);
      setHasMore(true);
      fetchMessages(0, false);
    }
  }, [roomId, fetchMessages]);

  // ========== CLEANUP ON UNMOUNT ==========

  useEffect(() => {
    return () => {
      // Cleanup khi component unmount
      setMessages([]);
      setTypingUsers([]);
      typingUsersRef.current.clear();
      console.log('🧹 Cleaned up messages state');
    };
  }, []);

  return {
    // ========== STATE ==========
    /** Danh sách tin nhắn trong phòng */
    messages,
    /** Trạng thái loading */
    loading,
    /** Thông báo lỗi */
    error,
    /** Có thể load thêm tin nhắn không */
    hasMore,
    /** Danh sách user đang gõ */
    typingUsers,
    
    // ========== MESSAGE OPERATIONS ==========
    /** Lấy tin nhắn từ API */
    fetchMessages,
    /** Load thêm tin nhắn cũ */
    loadMoreMessages,
    /** Gửi tin nhắn mới */
    sendMessage,
    /** Thêm reaction */
    addReaction,
    /** Xóa reaction */
    removeReaction,
    /** Xóa tin nhắn */
    deleteMessage,
    /** Cập nhật tin nhắn */
    updateMessage,
    /** Tìm kiếm tin nhắn */
    searchMessages,
    
    // ========== TYPING OPERATIONS ==========
    /** Bắt đầu gõ */
    startTyping,
    /** Dừng gõ */
    stopTyping,
    
    // ========== REFS ==========
    /** Ref để auto-scroll đến tin nhắn mới */
    messagesEndRef,
    
    // ========== UTILITY METHODS ==========
    /** Xóa thông báo lỗi */
    clearError: () => setError(null),
    /** Xóa toàn bộ tin nhắn (reset) */
    clearMessages: () => setMessages([])
  };
};

export default useMessages;