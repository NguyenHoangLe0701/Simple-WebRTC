import api from './api';

/**
 * Lấy lịch sử tin nhắn của một phòng
 * @param {string} roomId - ID của phòng
 * @returns {Promise<Array>} Danh sách tin nhắn
 */
export const getChatHistoryByRoom = async (roomId) => {
  try {
    const response = await api.get(`/api/messages/history/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử tin nhắn trực tiếp giữa hai người dùng
 * @param {number} userId1 - ID của người dùng thứ nhất
 * @param {number} userId2 - ID của người dùng thứ hai
 * @returns {Promise<Array>} Danh sách tin nhắn
 */
export const getDirectChatHistory = async (userId1, userId2) => {
  try {
    const response = await api.get(`/api/messages/history/${userId1}/${userId2}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching direct chat history:', error);
    throw error;
  }
};

