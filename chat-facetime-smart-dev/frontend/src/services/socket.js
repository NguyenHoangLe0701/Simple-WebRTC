import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.connectionPromise = null;
    this.connectionResolve = null;
  }

  getToken() {
    return (
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      ''
    );
  }

  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.connectionResolve = resolve;

      // 🆕 URL CHUẨN CHO CẢ LOCALHOST VÀ PRODUCTION
      let wsUrl;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Local development
        wsUrl = 'http://localhost:8080/ws';
      } else {
        // Production: SockJS cần https://
        wsUrl = 'https://simple-webrtc-4drq.onrender.com/ws';
      }

      console.log('🔗 Connecting to WebSocket:', wsUrl);

      const socket = new SockJS(wsUrl);

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: { 
          Authorization: `Bearer ${this.getToken()}` 
        },
        reconnectDelay: 5000,
        debug: (str) => {
          if (window.location.hostname === 'localhost') {
            console.log('🐛 STOMP Debug:', str);
          }
        },
        onConnect: () => {
          this.connected = true;
          console.log('🟢 STOMP connected');
          resolve(true);
        },
        onStompError: (frame) => {
          console.error('❌ STOMP Error:', frame);
          reject(new Error('STOMP connection failed'));
          this.connectionPromise = null;
        },
        onDisconnect: () => {
          this.connected = false;
          console.log('🔴 STOMP disconnected');
          this.connectionPromise = null;
        },
        onWebSocketClose: () => {
          this.connected = false;
          console.log('🔌 WebSocket closed');
          this.connectionPromise = null;
        },
      });

      this.client.activate();

      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
          this.connectionPromise = null;
        }
      }, 10000);
    });

    return this.connectionPromise;
  }

  async ensureConnected() {
    if (this.connected && this.client?.connected) {
      return true;
    }
    
    try {
      await this.connect();
      return this.connected;
    } catch (error) {
      console.error('❌ ensureConnected failed:', error);
      return false;
    }
  }

  async sendSignal(roomId, signalData) {
    try {
      console.log('📤 Sending signal:', signalData);
      
      const signalMessage = {
        ...signalData,
        timestamp: signalData.timestamp || new Date().toISOString()
      };
      
      console.log('🎯 Final signal being sent:', signalMessage);
      await this.send(`/app/signal/${roomId}`, signalMessage);
      console.log('✅ Signal sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending signal:', error);
      throw error;
    }
  }

  async subscribeToSignaling(roomId, callback) {
    try {
      console.log('📡 Subscribing to signaling for room:', roomId);
      
      const subscription = await this.subscribe(`/topic/signal/${roomId}`, (messageData) => {
        try {
          console.log('📨 Raw signaling message received:', messageData);
          
          if (messageData.body) {
            const parsedData = JSON.parse(messageData.body);
            callback(parsedData);
          } else {
            callback(messageData);
          }
        } catch (error) {
          console.error('❌ Error parsing signaling message:', error);
        }
      });
      
      if (subscription) {
        console.log('✅ Subscribed to signaling successfully');
      }
      
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to signaling:', error);
      return null;
    }
  }

  get isConnected() {
    return this.connected && this.client?.connected;
  }

  async send(destination, body, headers = {}) {
    try {
      const ok = await this.ensureConnected();
      if (!ok) {
        throw new Error('WebSocket not connected');
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      if (!this.client?.connected) {
        throw new Error('STOMP client not connected');
      }

      const token = this.getToken();
      this.client.publish({
        destination,
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}`, ...headers },
      });
      console.log('📤 Sent →', destination, body);
      return true;
    } catch (error) {
      console.error('❌ Send failed:', error);
      throw error;
    }
  }

  async subscribe(destination, callback) {
    try {
      const ok = await this.ensureConnected();
      if (!ok) {
        console.warn('⚠️ Cannot subscribe, not connected');
        return null;
      }

      if (this.subscriptions.has(destination)) {
        console.log('📝 Already subscribed to:', destination);
        return this.subscriptions.get(destination);
      }

      const sub = this.client.subscribe(destination, (msg) => {
        if (!msg.body) return;
        try {
          const data = JSON.parse(msg.body);
          callback(data);
        } catch (error) {
          console.warn('❌ Invalid message JSON:', msg.body, error);
        }
      });

      this.subscriptions.set(destination, sub);
      console.log('✅ Subscribed →', destination);
      return sub;
    } catch (error) {
      console.error('❌ Subscribe failed:', error);
      return null;
    }
  }

  unsubscribe(destination) {
    const sub = this.subscriptions.get(destination);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(destination);
      console.log('🚫 Unsubscribed →', destination);
    }
  }

  async joinRoom(roomId, user) {
    try {
      const userData = {
        username: user.username || user.fullName || 'user',
        userId: user.id || user.userId || user.username,
        fullName: user.fullName || user.username || 'User',
        name: user.name || user.fullName || user.username,
        email: user.email || '',
        avatar: user.avatar || (user.fullName || user.username || 'U').charAt(0).toUpperCase()
      };
  
      console.log('👤 Sending join request:', userData);
      
      await this.send(`/app/room/${roomId}/join`, userData);
      console.log('✅ Join room request sent:', roomId);
    } catch (error) {
      console.error('❌ Join room failed:', error);
      throw error;
    }
  }

  async leaveRoom(roomId, username) {
    try {
      if (this.connected && this.client?.connected) {
        await this.send(`/app/room/${roomId}/leave`, { 
          username: username || 'anonymous' 
        });
        console.log('✅ Left room:', roomId);
      } else {
        console.log('ℹ️ Skip leave room - not connected');
      }
    } catch (error) {
      console.warn('⚠️ Leave room failed (ignored):', error);
    }
  }

  async sendMessage(roomId, message) {
    const chatMessage = {
      id: message.id,
      sender: message.sender,
      senderId: message.senderId,
      content: message.content,
      type: message.type || 'text',
      roomId: roomId,
      timestamp: message.timestamp,
      avatar: message.avatar
    };
    
    console.log('📨 Final message being sent:', chatMessage);
    await this.send(`/app/chat/${roomId}`, chatMessage);
  }

  async subscribeToChat(roomId, callback) {
    return await this.subscribe(`/topic/chat/${roomId}`, callback);
  }

  async subscribeToPresence(roomId, callback) {
    return await this.subscribe(`/topic/presence/${roomId}`, callback);
  }

  async subscribeToRoom(roomId, callback) {
    return await this.subscribe(`/topic/room/${roomId}`, callback);
  }

  async sendPresenceUpdate(roomId, userData) {
    await this.send(`/app/presence/${roomId}/update`, userData);
  }

  disconnect() {
    console.log('🔌 Disconnecting socket...');
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    
    if (this.client) {
      this.client.deactivate();
    }
    
    this.connected = false;
    this.connectionPromise = null;
    console.log('🔌 Socket disconnected');
  }
}

export default new SocketService();