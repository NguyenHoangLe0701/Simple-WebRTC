import { useState, useEffect, useRef, useCallback } from 'react';
import SocketService from '../services/socketService';

/**
 * Hook quản lý kết nối WebSocket và các sự kiện real-time
 * @returns {Object} Các phương thức và trạng thái WebSocket
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastError, setLastError] = useState(null);
  const subscriptionsRef = useRef(new Map());

  /**
   * Kết nối WebSocket với server
   * @returns {Promise} Promise resolve khi kết nối thành công
   */
  const connect = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      await SocketService.connect();
      setIsConnected(true);
      setConnectionStatus('connected');
      setLastError(null);
      console.log('✅ WebSocket connected successfully');
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      setConnectionStatus('error');
      setLastError(error.message);
      setIsConnected(false);
      throw error; // Re-throw để component có thể bắt lỗi
    }
  }, []);

  /**
   * Ngắt kết nối WebSocket
   */
  const disconnect = useCallback(() => {
    SocketService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    subscriptionsRef.current.clear();
    console.log('🔌 WebSocket disconnected');
  }, []);

  // ========== ROOM MANAGEMENT ==========

  /**
   * Tham gia vào một phòng chat
   * @param {number} roomId - ID của phòng
   * @param {Object} userData - Thông tin user
   * @returns {boolean} Thành công hay không
   */
  const joinRoom = useCallback((roomId, userData) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot join room - WebSocket not connected');
      return false;
    }
    
    try {
      SocketService.joinRoom(roomId, userData.username, userData);
      console.log(`🚪 Joined room ${roomId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to join room ${roomId}:`, error);
      return false;
    }
  }, [isConnected]);

  /**
   * Rời khỏi phòng chat
   * @param {number} roomId - ID của phòng
   * @param {string} username - Tên user
   */
  const leaveRoom = useCallback((roomId, username) => {
    if (!isConnected) return;
    SocketService.leaveRoom(roomId, username);
    console.log(`🚪 Left room ${roomId}`);
  }, [isConnected]);

  // ========== MESSAGE OPERATIONS ==========

  /**
   * Gửi tin nhắn qua WebSocket
   * @param {number} roomId - ID phòng
   * @param {Object} message - Đối tượng tin nhắn
   * @returns {boolean} Thành công hay không
   */
  const sendMessage = useCallback((roomId, message) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot send message - WebSocket not connected');
      return false;
    }
    
    try {
      SocketService.sendMessage(roomId, message);
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return false;
    }
  }, [isConnected]);

  /**
   * Thêm reaction vào tin nhắn
   * @param {number} roomId - ID phòng
   * @param {number} messageId - ID tin nhắn
   * @param {string} reaction - Emoji reaction
   * @returns {boolean} Thành công hay không
   */
  const reactToMessage = useCallback((roomId, messageId, reaction) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot react to message - WebSocket not connected');
      return false;
    }
    
    try {
      SocketService.reactToMessage(roomId, messageId, reaction);
      console.log(`👍 Added reaction ${reaction} to message ${messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to react to message:', error);
      return false;
    }
  }, [isConnected]);

  /**
   * Xóa tin nhắn
   * @param {number} roomId - ID phòng
   * @param {number} messageId - ID tin nhắn
   * @returns {boolean} Thành công hay không
   */
  const deleteMessage = useCallback((roomId, messageId) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot delete message - WebSocket not connected');
      return false;
    }
    
    try {
      SocketService.deleteMessage(roomId, messageId);
      console.log(`🗑️ Deleted message ${messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
      return false;
    }
  }, [isConnected]);

  // ========== TYPING INDICATORS ==========

  /**
   * Gửi sự kiện bắt đầu gõ
   * @param {number} roomId - ID phòng
   * @returns {boolean} Thành công hay không
   */
  const startTyping = useCallback((roomId) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot start typing - WebSocket not connected');
      return false;
    }
    
    try {
      SocketService.startTyping(roomId);
      return true;
    } catch (error) {
      console.error('❌ Failed to start typing:', error);
      return false;
    }
  }, [isConnected]);

  /**
   * Gửi sự kiện dừng gõ
   * @param {number} roomId - ID phòng
   * @returns {boolean} Thành công hay không
   */
  const stopTyping = useCallback((roomId) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot stop typing - WebSocket not connected');
      return false;
    }
    
    try {
      SocketService.stopTyping(roomId);
      return true;
    } catch (error) {
      console.error('❌ Failed to stop typing:', error);
      return false;
    }
  }, [isConnected]);

  // ========== SUBSCRIPTION MANAGEMENT ==========

  /**
   * Subscribe để nhận tin nhắn mới từ phòng
   * @param {number} roomId - ID phòng
   * @param {Function} callback - Hàm xử lý tin nhắn mới
   * @returns {Object|null} Subscription object hoặc null nếu lỗi
   */
  const subscribeToRoomMessages = useCallback((roomId, callback) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot subscribe - WebSocket not connected');
      return null;
    }
    
    const subscription = SocketService.subscribeToChat(roomId, callback);
    const key = `room.${roomId}.messages`;
    subscriptionsRef.current.set(key, subscription);
    console.log(`📨 Subscribed to messages in room ${roomId}`);
    return subscription;
  }, [isConnected]);

  /**
   * Subscribe để nhận sự kiện user join/leave phòng
   * @param {number} roomId - ID phòng
   * @param {Function} callback - Hàm xử lý sự kiện presence
   * @returns {Object|null} Subscription object hoặc null nếu lỗi
   */
  const subscribeToPresence = useCallback((roomId, callback) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot subscribe - WebSocket not connected');
      return null;
    }
    
    const subscription = SocketService.subscribeToPresence(roomId, callback);
    const key = `room.${roomId}.presence`;
    subscriptionsRef.current.set(key, subscription);
    console.log(`👥 Subscribed to presence in room ${roomId}`);
    return subscription;
  }, [isConnected]);

  /**
   * Subscribe để nhận sự kiện typing
   * @param {number} roomId - ID phòng
   * @param {Function} callback - Hàm xử lý sự kiện typing
   * @returns {Object|null} Subscription object hoặc null nếu lỗi
   */
  const subscribeToTyping = useCallback((roomId, callback) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot subscribe - WebSocket not connected');
      return null;
    }
    
    const subscription = SocketService.subscribeToTyping(roomId, callback);
    const key = `room.${roomId}.typing`;
    subscriptionsRef.current.set(key, subscription);
    console.log(`⌨️ Subscribed to typing in room ${roomId}`);
    return subscription;
  }, [isConnected]);

  /**
   * Subscribe để nhận sự kiện cuộc gọi
   * @param {number} roomId - ID phòng
   * @param {Function} callback - Hàm xử lý sự kiện call
   * @returns {Object|null} Subscription object hoặc null nếu lỗi
   */
  const subscribeToCall = useCallback((roomId, callback) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot subscribe - WebSocket not connected');
      return null;
    }
    
    const subscription = SocketService.subscribeToCall(roomId, callback);
    const key = `room.${roomId}.call`;
    subscriptionsRef.current.set(key, subscription);
    console.log(`📞 Subscribed to call events in room ${roomId}`);
    return subscription;
  }, [isConnected]);

  /**
   * Unsubscribe khỏi tất cả các subscription của một phòng
   * @param {number} roomId - ID phòng
   */
  const unsubscribeFromRoom = useCallback((roomId) => {
    const patterns = [
      `room.${roomId}.messages`,
      `room.${roomId}.presence`,
      `room.${roomId}.typing`,
      `room.${roomId}.call`
    ];

    patterns.forEach(pattern => {
      const subscription = subscriptionsRef.current.get(pattern);
      if (subscription) {
        SocketService.unsubscribe(pattern);
        subscriptionsRef.current.delete(pattern);
      }
    });
    
    console.log(`🔕 Unsubscribed from all events in room ${roomId}`);
  }, []);

  // ========== AUTO RECONNECT LOGIC ==========

  useEffect(() => {
    let reconnectTimeout;

    const handleReconnect = () => {
      if (!isConnected && connectionStatus === 'error') {
        console.log('🔄 Attempting to reconnect WebSocket...');
        reconnectTimeout = setTimeout(() => {
          connect();
        }, 5000);
      }
    };

    handleReconnect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isConnected, connectionStatus, connect]);

  // ========== AUTO CLEANUP ON UNMOUNT ==========

  useEffect(() => {
    return () => {
      // Cleanup all subscriptions khi component unmount
      subscriptionsRef.current.forEach((subscription, destination) => {
        SocketService.unsubscribe(destination);
      });
      subscriptionsRef.current.clear();
      console.log('🧹 Cleaned up all WebSocket subscriptions');
    };
  }, []);

  return {
    // ========== STATE ==========
    /** Trạng thái kết nối WebSocket */
    isConnected,
    /** Trạng thái chi tiết: 'connected' | 'disconnected' | 'connecting' | 'error' */
    connectionStatus,
    /** Lỗi kết nối cuối cùng */
    lastError,
    
    // ========== CONNECTION MANAGEMENT ==========
    /** Kết nối WebSocket */
    connect,
    /** Ngắt kết nối WebSocket */
    disconnect,
    
    // ========== ROOM MANAGEMENT ==========
    /** Tham gia phòng chat */
    joinRoom,
    /** Rời khỏi phòng chat */
    leaveRoom,
    
    // ========== MESSAGE OPERATIONS ==========
    /** Gửi tin nhắn */
    sendMessage,
    /** Thêm reaction vào tin nhắn */
    reactToMessage,
    /** Xóa tin nhắn */
    deleteMessage,
    
    // ========== TYPING INDICATORS ==========
    /** Bắt đầu gõ */
    startTyping,
    /** Dừng gõ */
    stopTyping,
    
    // ========== SUBSCRIPTION MANAGEMENT ==========
    /** Subscribe tin nhắn mới */
    subscribeToRoomMessages,
    /** Subscribe sự kiện user join/leave */
    subscribeToPresence,
    /** Subscribe sự kiện typing */
    subscribeToTyping,
    /** Subscribe sự kiện cuộc gọi */
    subscribeToCall,
    /** Unsubscribe khỏi tất cả sự kiện của phòng */
    unsubscribeFromRoom,
    
    // ========== UTILITY METHODS ==========
    /** Broadcast message đến tất cả users (admin feature) */
    broadcastToAll: SocketService.broadcastToAll,
    /** Subscribe để nhận broadcast messages */
    subscribeToBroadcast: SocketService.subscribeToBroadcast
  };
};

export default useWebSocket;