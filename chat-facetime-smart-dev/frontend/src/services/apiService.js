// services/apiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
    
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Thêm token vào header
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Xử lý response lỗi
    this.client.interceptors.response.use(
      response => response.data,
      error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ========== ROOM APIs ==========
  async getAllRooms() {
    return this.client.get('/rooms');
  }

  async getUserRooms() {
    return this.client.get('/rooms/my');
  }

  async searchRooms(query) {
    return this.client.get('/rooms/search', { params: { q: query } });
  }

  async createRoom(roomData) {
    return this.client.post('/rooms', roomData);
  }

  async getRoom(roomId) {
    return this.client.get(`/rooms/${roomId}`);
  }

  async updateRoom(roomId, roomData) {
    return this.client.put(`/rooms/${roomId}`, roomData);
  }

  async deleteRoom(roomId) {
    return this.client.delete(`/rooms/${roomId}`);
  }

  async joinRoom(roomId) {
    return this.client.post(`/rooms/${roomId}/join`);
  }

  async leaveRoom(roomId) {
    return this.client.post(`/rooms/${roomId}/leave`);
  }

  async getRoomMembers(roomId) {
    return this.client.get(`/rooms/${roomId}/members`);
  }

  async getRoomMessages(roomId, page = 0, size = 50) {
    return this.client.get(`/rooms/${roomId}/messages`, {
      params: { page, size }
    });
  }

  async searchMessagesInRoom(roomId, query) {
    return this.client.get(`/rooms/${roomId}/messages/search`, {
      params: { q: query }
    });
  }

  // ========== MESSAGE APIs ==========
  async sendMessage(roomId, messageData) {
    return this.client.post(`/messages/${roomId}`, messageData);
  }

  async getMessage(messageId) {
    return this.client.get(`/messages/${messageId}`);
  }

  async updateMessage(messageId, messageData) {
    return this.client.put(`/messages/${messageId}`, messageData);
  }

  async deleteMessage(messageId) {
    return this.client.delete(`/messages/${messageId}`);
  }

  async addReaction(messageId, reaction) {
    return this.client.post(`/messages/${messageId}/reactions/${reaction}`);
  }

  async removeReaction(messageId, reaction) {
    return this.client.delete(`/messages/${messageId}/reactions/${reaction}`);
  }

  async getUserMessagesInRoom(roomId, userId) {
    return this.client.get(`/messages/room/${roomId}/user/${userId}`);
  }

  // ========== FILE APIs ==========
  async uploadImage(file, roomId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    
    return this.client.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async uploadFile(file, roomId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    
    return this.client.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async getFile(fileId) {
    return this.client.get(`/upload/files/${fileId}`);
  }

  async getRoomFiles(roomId) {
    return this.client.get(`/upload/files/room/${roomId}`);
  }

  async getUserFiles() {
    return this.client.get('/upload/files/my');
  }

  async searchFiles(query) {
    return this.client.get('/upload/files/search', { params: { q: query } });
  }

  async deleteFile(fileId) {
    return this.client.delete(`/upload/files/${fileId}`);
  }

  async downloadFile(storedName) {
    return this.client.get(`/upload/download/${storedName}`, {
      responseType: 'blob'
    });
  }
}

export default new ApiService();