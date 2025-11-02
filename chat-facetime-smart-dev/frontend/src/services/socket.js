import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Get backend URL from environment or use proxy for development
        const apiUrl = import.meta.env.VITE_API_URL || '';
        let wsUrl = '/ws'; // Default: use proxy in development
        
        if (apiUrl) {
          // Extract base URL (remove /api suffix if present)
          const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
          wsUrl = `${baseUrl}/ws`;
        }
        
        console.log('Connecting to WebSocket:', wsUrl);
        const socket = new SockJS(wsUrl);
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          debug: (str) => {
            console.log('STOMP: ' + str);
          },
          onConnect: (frame) => {
            console.log('Connected: ' + frame);
            this.isConnected = true;
            resolve();
          },
          onStompError: (frame) => {
            console.error('STOMP error: ' + frame.headers['message']);
            console.error('Details: ' + frame.body);
            this.isConnected = false;
            reject(frame);
          }
        });

        this.stompClient.activate();
      } catch (error) {
        console.error('Connection error:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.stompClient && this.isConnected) {
      this.stompClient.deactivate();
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  subscribe(destination, callback) {
    if (this.stompClient && this.isConnected) {
      const subscription = this.stompClient.subscribe(destination, callback);
      this.subscriptions.set(destination, subscription);
      return subscription;
    }
    return null;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  send(destination, body, headers = {}) {
    if (this.stompClient && this.isConnected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(body),
        headers: headers
      });
    } else {
      console.error('Not connected to WebSocket');
    }
  }

  // Chat specific methods
  joinRoom(roomId, username, userData = {}) {
    const payload = { 
      username,
      userId: userData?.id || userData?.userId || username,
      fullName: userData?.fullName || userData?.name || username,
      email: userData?.email || ''
    };
    this.send(`/app/room/${roomId}/join`, payload);
  }

  leaveRoom(roomId, username) {
    this.send(`/app/room/${roomId}/leave`, { username });
  }

  sendMessage(roomId, message) {
    this.send(`/app/chat/${roomId}`, message);
  }

  sendSignal(roomId, signal) {
    this.send(`/app/signal/${roomId}`, signal);
  }

  // Subscribe to chat messages
  subscribeToChat(roomId, callback) {
    return this.subscribe(`/topic/chat/${roomId}`, callback);
  }

  // Subscribe to signaling messages
  subscribeToSignaling(roomId, callback) {
    return this.subscribe(`/topic/room/${roomId}`, callback);
  }

  // Subscribe to user presence
  subscribeToPresence(roomId, callback) {
    return this.subscribe(`/topic/presence/${roomId}`, callback);
  }

  // Subscribe to approval events (for host)
  subscribeToApproval(roomId, callback) {
    return this.subscribe(`/topic/room/${roomId}/approval`, callback);
  }

  // Subscribe to approval status (for user waiting)
  subscribeToApprovalStatus(userId, callback) {
    // Use user-specific destination for approval status
    return this.subscribe(`/user/queue/approval-status`, callback);
  }

  // Send approval request
  requestApproval(roomId, userData) {
    this.send(`/app/room/${roomId}/join`, {
      userId: userData.id,
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email
    });
  }

  // Approve user (host only)
  approveUser(roomId, userId, hostId, userInfo) {
    this.send(`/app/room/${roomId}/approve`, {
      userId: userId,
      hostId: hostId,
      username: userInfo.username,
      fullName: userInfo.fullName
    });
  }

  // Reject user (host only)
  rejectUser(roomId, userId, hostId) {
    this.send(`/app/room/${roomId}/reject`, {
      userId: userId,
      hostId: hostId
    });
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;