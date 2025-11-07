import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.connectionPromise = null;
    this.connectionResolve = null;
    this.connectionTimeout = null;
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

      let wsUrl;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        wsUrl = 'http://localhost:8080/ws';
      } else {
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
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectionTimeout: 15000,
        debug: (str) => {
          if (window.location.hostname === 'localhost' && str.includes('ERROR')) {
            console.log('STOMP Debug:', str);
          }
        },
        onConnect: () => {
          this.connected = true;
          console.log('🟢 STOMP connected');
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          resolve(true);
        },
        onStompError: (frame) => {
          console.error('❌ STOMP Error:', frame);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
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
        onWebSocketError: (error) => {
          console.error('🌐 WebSocket error:', error);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
        }
      });

      this.client.activate();

      // 🆕 FIX: Timeout logic đơn giản hơn
      this.connectionTimeout = setTimeout(() => {
        if (!this.connected) {
          console.error('⏰ Connection timeout after 15s');
          reject(new Error('Connection timeout'));
          this.connectionPromise = null;
          
          // Force deactivate nếu vẫn connecting
          if (this.client) {
            this.client.deactivate();
          }
        }
      }, 15000);
    });

    return this.connectionPromise;
  }

  // 🆕 FIX: Retry logic cải tiến
  async connectWithRetry(maxRetries = 3, retryDelay = 2000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔗 Connection attempt ${attempt}/${maxRetries}`);
        await this.connect();
        console.log('✅ Connected successfully');
        return true;
      } catch (error) {
        lastError = error;
        console.warn(`❌ Connection attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`🔄 Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          // Reset connection promise cho lần retry tiếp theo
          this.connectionPromise = null;
        }
      }
    }
    
    console.error('💥 All connection attempts failed');
    throw lastError || new Error('All connection attempts failed');
  }

  async ensureConnected() {
    if (this.connected && this.client?.connected) {
      return true;
    }
    
    try {
      await this.connectWithRetry();
      return true;
    } catch (error) {
      console.error('❌ ensureConnected failed:', error);
      return false;
    }
  }

  // 🆕 FIX: Signaling với log chi tiết
  async sendSignal(roomId, signalData) {
    try {
      console.log('📤 Sending signal to room:', roomId, signalData);
      
      const signalMessage = {
        ...signalData,
        timestamp: signalData.timestamp || new Date().toISOString()
      };

      await this.send(`/app/signal/${roomId}`, signalMessage);
      console.log('✅ Signal sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending signal:', error);
      throw error;
    }
  }

  // 🆕 FIX: Signaling subscription với error handling tốt hơn
  async subscribeToSignaling(roomId, callback) {
    try {
      console.log('📡 Subscribing to signaling for room:', roomId);
      
      const subscription = await this.subscribe(`/topic/signal/${roomId}`, (message) => {
        try {
          console.log('📨 Raw signaling message:', message);
          
          let signalData;
          if (message.body) {
            signalData = JSON.parse(message.body);
          } else {
            signalData = message;
          }
          
          console.log('🎯 Parsed signaling data:', signalData);
          callback(signalData);
        } catch (error) {
          console.error('❌ Error parsing signaling message:', error, message);
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

  // 🆕 FIX: Send method đơn giản hơn
  async send(destination, body, headers = {}) {
    try {
      const ok = await this.ensureConnected();
      if (!ok) {
        throw new Error('WebSocket not connected');
      }

      if (!this.client?.connected) {
        throw new Error('STOMP client not connected');
      }

      const token = this.getToken();
      
      console.log('📤 Sending to:', destination, body);
      
      this.client.publish({
        destination,
        body: JSON.stringify(body),
        headers: { 
          Authorization: `Bearer ${token}`, 
          ...headers 
        },
      });
      
      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Send failed:', error);
      throw error;
    }
  }

  // 🆕 FIX: Subscribe method cải tiến
  async subscribe(destination, callback) {
    try {
      const ok = await this.ensureConnected();
      if (!ok) {
        console.warn('⚠️ Cannot subscribe - not connected');
        return null;
      }

      // Check existing subscription
      if (this.subscriptions.has(destination)) {
        console.log('📝 Already subscribed to:', destination);
        return this.subscriptions.get(destination);
      }

      const sub = this.client.subscribe(destination, (message) => {
        if (!message.body) {
          console.warn('📭 Empty message body received');
          return;
        }
        
        try {
          const data = JSON.parse(message.body);
          console.log('📨 Received message from:', destination, data);
          callback(data);
        } catch (error) {
          console.error('❌ Error parsing message:', error, message.body);
        }
      });

      this.subscriptions.set(destination, sub);
      console.log('✅ Subscribed to:', destination);
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
      console.log('🚫 Unsubscribed from:', destination);
    }
  }

  // 🆕 FIX: Join room với log rõ ràng
  async joinRoom(roomId, user) {
    try {
      const userData = {
        username: user.username || user.fullName || 'user',
        userId: user.id || user.userId || user.username,
        fullName: user.fullName || user.username || 'User',
        email: user.email || '',
        avatar: user.avatar || (user.fullName || user.username || 'U').charAt(0).toUpperCase()
      };
      
      console.log('👤 Joining room with user data:', userData);
      
      await this.send(`/app/room/${roomId}/join`, userData);
      console.log('✅ Joined room:', roomId);
    } catch (error) {
      console.error('❌ Join room failed:', error);
      throw error;
    }
  }

  async joinRoomWithSignaling(roomId, user) {
    try {
      await this.joinRoom(roomId, user);
      
      await this.sendSignal(roomId, {
        type: 'join',
        user: {
          id: user.id || user.userId || user.username,
          username: user.username,
          fullName: user.fullName || user.username
        },
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Joined room with signaling:', roomId);
      return true;
    } catch (error) {
      console.error('❌ Join room with signaling failed:', error);
      throw error;
    }
  }

  // 🆕 FIX: Room events subscription
  async subscribeToRoomEvents(roomId, callbacks = {}) {
    try {
      const { onUserJoin, onUserLeave, onPresenceUpdate } = callbacks;
      
      if (onUserJoin || onUserLeave) {
        await this.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log('👥 Room event received:', message);
          
          if (message.type === 'user_join' && onUserJoin) {
            onUserJoin(message.user);
          } else if (message.type === 'user_leave' && onUserLeave) {
            onUserLeave(message.user);
          }
        });
      }
      
      if (onPresenceUpdate) {
        await this.subscribe(`/topic/presence/${roomId}`, (message) => {
          console.log('📊 Presence update:', message);
          onPresenceUpdate(message);
        });
      }
      
      console.log('✅ Subscribed to all room events:', roomId);
      return true;
    } catch (error) {
      console.error('❌ Subscribe to room events failed:', error);
      return false;
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
      console.warn('⚠️ Leave room failed:', error);
    }
  }

  // 🆕 FIX: Cleanup method
  cleanup() {
    console.log('🧹 Cleaning up socket connections...');
    this.unsubscribeAll();
    
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    
    this.connected = false;
    this.connectionPromise = null;
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    console.log('✅ Socket cleanup completed');
  }

  unsubscribeAll() {
    this.subscriptions.forEach((sub, destination) => {
      sub.unsubscribe();
      console.log('🚫 Unsubscribed from:', destination);
    });
    this.subscriptions.clear();
  }

  // Các methods khác giữ nguyên...
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
}

export default new SocketService();