import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/apiService';
import { useWebSocket } from './useWebSocket';

/**
 * Hook quản lý tất cả operations liên quan đến phòng chat
 * @returns {Object} Các phương thức và state quản lý phòng
 */
export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomMembers, setRoomMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    joinRoom: wsJoinRoom, 
    leaveRoom: wsLeaveRoom,
    subscribeToPresence,
    subscribeToRoomMessages,
    unsubscribeFromRoom
  } = useWebSocket();

  // ========== ROOM FETCHING METHODS ==========

  /**
   * Lấy danh sách tất cả phòng của user hiện tại
   * @returns {Promise} Promise chứa danh sách phòng
   */
  const fetchUserRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API và xử lý response theo chuẩn ApiResponse
      const response = await ApiService.getUserRooms();
      
      // API trả về { code, message, data } - lấy data
      const roomsData = response?.data || response;
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      
      console.log(`✅ Loaded ${roomsData.length} rooms`);
    } catch (err) {
      // Xử lý lỗi theo chuẩn ApiResponse
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load rooms';
      console.error('❌ Failed to fetch user rooms:', errorMessage);
      setError(errorMessage);
      setRooms([]);
      throw err; // Re-throw để component có thể bắt lỗi
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tìm kiếm phòng theo từ khóa
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách phòng tìm thấy
   */
  const searchRooms = useCallback(async (query) => {
    if (!query.trim()) return [];
    
    try {
      setLoading(true);
      const response = await ApiService.searchRooms(query);
      const roomsData = response?.data || response;
      console.log(`🔍 Found ${roomsData.length} rooms for query: "${query}"`);
      return Array.isArray(roomsData) ? roomsData : [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to search rooms';
      console.error('❌ Failed to search rooms:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== ROOM CRUD OPERATIONS ==========

  /**
   * Tạo phòng mới
   * @param {Object} roomData - Dữ liệu phòng { name, description, type, maxMembers }
   * @returns {Promise<Object>} Phòng vừa tạo
   */
  const createRoom = useCallback(async (roomData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.createRoom(roomData);
      const newRoom = response?.data || response;
      
      // Thêm phòng mới vào đầu danh sách
      setRooms(prev => [newRoom, ...prev]);
      
      console.log(`✅ Created new room: ${newRoom.name}`);
      return newRoom;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create room';
      console.error('❌ Failed to create room:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy thông tin chi tiết của một phòng
   * @param {number} roomId - ID phòng
   * @returns {Promise<Object>} Thông tin phòng
   */
  const fetchRoom = useCallback(async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getRoom(roomId);
      const room = response?.data || response;
      setCurrentRoom(room);
      
      console.log(`✅ Loaded room details: ${room.name}`);
      return room;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load room';
      console.error(`❌ Failed to fetch room ${roomId}:`, errorMessage);
      setError(errorMessage);
      setCurrentRoom(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cập nhật thông tin phòng
   * @param {number} roomId - ID phòng
   * @param {Object} roomData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Phòng đã cập nhật
   */
  const updateRoom = useCallback(async (roomId, roomData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.updateRoom(roomId, roomData);
      const updatedRoom = response?.data || response;
      
      // Cập nhật trong danh sách
      setRooms(prev => prev.map(room => 
        room.id === roomId ? updatedRoom : room
      ));
      
      // Cập nhật current room nếu đang active
      if (currentRoom?.id === roomId) {
        setCurrentRoom(updatedRoom);
      }
      
      console.log(`✅ Updated room: ${updatedRoom.name}`);
      return updatedRoom;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update room';
      console.error(`❌ Failed to update room ${roomId}:`, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRoom]);

  /**
   * Xóa phòng
   * @param {number} roomId - ID phòng
   * @returns {Promise}
   */
  const deleteRoom = useCallback(async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      
      await ApiService.deleteRoom(roomId);
      
      // Xóa khỏi danh sách
      setRooms(prev => prev.filter(room => room.id !== roomId));
      
      // Clear current room nếu đang active
      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
      }
      
      console.log(`🗑️ Deleted room ${roomId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete room';
      console.error(`❌ Failed to delete room ${roomId}:`, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRoom]);

  // ========== ROOM MEMBERSHIP OPERATIONS ==========

  /**
   * Tham gia vào một phòng
   * @param {number} roomId - ID phòng
   * @param {Object} userData - Thông tin user
   * @returns {Promise<Object>} Thông tin membership
   */
  const joinRoom = useCallback(async (roomId, userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API join
      const response = await ApiService.joinRoom(roomId);
      const roomMember = response?.data || response;
      
      // Kết nối WebSocket với phòng
      if (userData) {
        wsJoinRoom(roomId, userData);
      }
      
      // Load thông tin chi tiết phòng
      await fetchRoom(roomId);
      
      console.log(`✅ Joined room ${roomId}`);
      return roomMember;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join room';
      console.error(`❌ Failed to join room ${roomId}:`, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wsJoinRoom, fetchRoom]);

  /**
   * Rời khỏi phòng
   * @param {number} roomId - ID phòng
   * @param {string} username - Tên user
   * @returns {Promise}
   */
  const leaveRoom = useCallback(async (roomId, username) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API leave
      await ApiService.leaveRoom(roomId);
      
      // Rời phòng qua WebSocket
      if (username) {
        wsLeaveRoom(roomId, username);
      }
      
      // Unsubscribe từ WebSocket events
      unsubscribeFromRoom(roomId);
      
      // Xóa khỏi danh sách
      setRooms(prev => prev.filter(room => room.id !== roomId));
      
      // Clear current room nếu đang active
      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
      }
      
      console.log(`🚪 Left room ${roomId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to leave room';
      console.error(`❌ Failed to leave room ${roomId}:`, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wsLeaveRoom, unsubscribeFromRoom, currentRoom]);

  /**
   * Lấy danh sách thành viên trong phòng
   * @param {number} roomId - ID phòng
   * @returns {Promise<Array>} Danh sách thành viên
   */
  const fetchRoomMembers = useCallback(async (roomId) => {
    try {
      setLoading(true);
      const response = await ApiService.getRoomMembers(roomId);
      const members = response?.data || response;
      setRoomMembers(Array.isArray(members) ? members : []);
      
      console.log(`✅ Loaded ${members.length} members for room ${roomId}`);
      return members;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load room members';
      console.error(`❌ Failed to fetch room members for ${roomId}:`, errorMessage);
      setError(errorMessage);
      setRoomMembers([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== EVENT SUBSCRIPTIONS ==========

  /**
   * Subscribe để nhận các sự kiện real-time từ phòng
   * @param {number} roomId - ID phòng
   * @param {Object} callbacks - Object chứa các callback functions
   * @param {Function} callbacks.onPresence - Xử lý user join/leave
   * @param {Function} callbacks.onMessage - Xử lý tin nhắn mới
   * @returns {Function} Hàm unsubscribe
   */
  const subscribeToRoomEvents = useCallback((roomId, callbacks) => {
    const subscriptions = [];
    
    if (callbacks.onPresence) {
      const sub = subscribeToPresence(roomId, callbacks.onPresence);
      if (sub) subscriptions.push(sub);
    }
    
    if (callbacks.onMessage) {
      const sub = subscribeToRoomMessages(roomId, callbacks.onMessage);
      if (sub) subscriptions.push(sub);
    }
    
    console.log(`🎯 Subscribed to ${subscriptions.length} event types in room ${roomId}`);
    
    // Trả về hàm cleanup
    return () => {
      subscriptions.forEach(sub => {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      });
      console.log(`🔕 Unsubscribed from room ${roomId} events`);
    };
  }, [subscribeToPresence, subscribeToRoomMessages]);

  // ========== AUTO-FETCH ON MOUNT ==========

  useEffect(() => {
    // Tự động load rooms khi component mount
    fetchUserRooms();
  }, [fetchUserRooms]);

  return {
    // ========== STATE ==========
    /** Danh sách phòng của user */
    rooms,
    /** Phòng đang được chọn/xem */
    currentRoom,
    /** Thành viên của phòng hiện tại */
    roomMembers,
    /** Trạng thái loading */
    loading,
    /** Thông báo lỗi */
    error,
    
    // ========== ROOM OPERATIONS ==========
    /** Lấy danh sách phòng của user */
    fetchUserRooms,
    /** Tìm kiếm phòng */
    searchRooms,
    /** Tạo phòng mới */
    createRoom,
    /** Lấy thông tin chi tiết phòng */
    fetchRoom,
    /** Cập nhật thông tin phòng */
    updateRoom,
    /** Xóa phòng */
    deleteRoom,
    /** Tham gia phòng */
    joinRoom,
    /** Rời phòng */
    leaveRoom,
    /** Lấy danh sách thành viên phòng */
    fetchRoomMembers,
    
    // ========== EVENT SUBSCRIPTIONS ==========
    /** Subscribe sự kiện real-time từ phòng */
    subscribeToRoomEvents,
    
    // ========== UTILITY METHODS ==========
    /** Set phòng hiện tại */
    setCurrentRoom,
    /** Xóa thông báo lỗi */
    clearError: () => setError(null)
  };
};

export default useRooms;