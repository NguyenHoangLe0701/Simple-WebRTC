import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';


// services/socketService.js
class SocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      const socket = new SockJS('/ws');
      this.stompClient = Stomp.over(socket);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      this.stompClient.connect(
        { Authorization: `Bearer ${token}` },
        (frame) => {
          console.log('Connected: ' + frame);
          this.isConnected = true;
          resolve(frame);
        },
        (error) => {
          console.error('Connection error: ' + error);
          this.isConnected = false;
          reject(error);
        }
      );
    });
  }

  // ========== ROOM MANAGEMENT ==========
  joinRoom(roomId, username, userData) {
    if (!this.isConnected) return;
    
    this.stompClient.send(`/app/room.${roomId}.join`, {}, JSON.stringify({
      user: userData
    }));
  }

  leaveRoom(roomId, username) {
    if (!this.isConnected) return;
    
    this.stompClient.send(`/app/room.${roomId}.leave`, {}, JSON.stringify({
      username
    }));
  }

  // ========== MESSAGING ==========
  sendMessage(roomId, message) {
    if (!this.isConnected) return;
    
    const messageRequest = {
      content: message.content,
      type: message.type || 'TEXT',
      fileId: message.fileId,
      replyTo: message.replyTo?.id
    };
    
    this.stompClient.send(
      `/app/room.${roomId}.message.send`,
      {},
      JSON.stringify(messageRequest)
    );
  }

  reactToMessage(roomId, messageId, reaction) {
    if (!this.isConnected) return;
    
    this.stompClient.send(
      `/app/room.${roomId}.message.${messageId}.react`,
      {},
      JSON.stringify({ reaction })
    );
  }

  deleteMessage(roomId, messageId) {
    if (!this.isConnected) return;
    
    this.stompClient.send(
      `/app/room.${roomId}.message.${messageId}.delete`,
      {},
      {}
    );
  }

  // ========== TYPING INDICATORS ==========
  startTyping(roomId) {
    if (!this.isConnected) return;
    
    this.stompClient.send(
      `/app/room.${roomId}.typing.start`,
      {},
      JSON.stringify({})
    );
  }

  stopTyping(roomId) {
    if (!this.isConnected) return;
    
    this.stompClient.send(
      `/app/room.${roomId}.typing.stop`,
      {},
      JSON.stringify({})
    );
  }

  // ========== SUBSCRIPTIONS ==========
  subscribeToChat(roomId, callback) {
    const destination = `/topic/room.${roomId}.messages`;
    return this.subscribe(destination, callback);
  }

  subscribeToPresence(roomId, callback) {
    const destination = `/topic/room.${roomId}.presence`;
    return this.subscribe(destination, callback);
  }

  subscribeToTyping(roomId, callback) {
    const destination = `/topic/room.${roomId}.typing`;
    return this.subscribe(destination, callback);
  }

  subscribeToCall(roomId, callback) {
    const destination = `/topic/room.${roomId}.call`;
    return this.subscribe(destination, callback);
  }

  subscribe(destination, callback) {
    if (!this.isConnected) {
      console.error('Not connected to WebSocket');
      return null;
    }

    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    this.isConnected = false;
    this.subscriptions.clear();
  }

broadcastToAll(destination = '/app/broadcast', message = {}) {
  if (!this.isConnected) {
    console.error('Socket not connected for broadcast');
    return false;
  }

  try {
    this.stompClient.send(destination, {}, JSON.stringify(message));
    console.log('✅ Broadcast sent to', destination, ':', message);
    return true;
  } catch (error) {
    console.error('❌ Error broadcasting:', error);
    return false;
  }
}

  subscribeToBroadcast(callback) {
    if (!this.isConnected) {
      console.error('Socket not connected for broadcast subscription');
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe('/topic/broadcast', (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (e) {
          console.error('❌ Error parsing broadcast message:', e);
        }
      });

      console.log('✅ Subscribed to broadcast channel');
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to broadcast:', error);
      return null;
    }
  }
}

export default new SocketService();