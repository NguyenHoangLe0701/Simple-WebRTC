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
        // Use Vite proxy to route to backend and avoid cross-origin/auth prompts
        const socket = new SockJS('/ws');
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
  joinRoom(roomId, username) {
    this.send(`/app/room/${roomId}/join`, { username });
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
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;