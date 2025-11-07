import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.connectionPromise = null;
    this.connectionResolve = null;
    this.connectionTimeout = null; // 🆕 THÊM timeout reference
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

      console.log('🔗 Connecting to WebSocket');

      const socket = new SockJS(wsUrl);

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: { 
          Authorization: `Bearer ${this.getToken()}` 
        },
        reconnectDelay: 5000,
        // 🆕 THÊM heartbeat để giữ kết nối
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // 🆕 THÊM connection timeout trên STOMP level
        connectionTimeout: 15000,
        debug: (str) => {
          if (window.location.hostname === 'localhost' && str.includes('ERROR')) {
            console.log('STOMP Debug:', str);
          }
        },
        onConnect: () => {
          this.connected = true;
          console.log('🟢 STOMP connected');
          // 🆕 CLEAR TIMEOUT khi connect thành công
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          resolve(true);
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          // 🆕 CLEAR TIMEOUT khi có lỗi
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          reject(new Error('STOMP connection failed'));
          this.connectionPromise = null;
        },
        onDisconnect: () => {
          this.connected = false;
          console.log('STOMP disconnected');
          this.connectionPromise = null;
        },
        onWebSocketClose: () => {
          this.connected = false;
          this.connectionPromise = null;
        },
        // 🆕 THÊM WebSocket error handling
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
        }
      });

      this.client.activate();

      // 🆕 SỬA TIMEOUT - tăng lên 15s và lưu reference
      this.connectionTimeout = setTimeout(() => {
        if (!this.connected) {
          console.warn('⚠️ Connection timeout after 15s');
          // 🆕 KHÔNG reject ngay mà đợi thêm
          setTimeout(() => {
            if (!this.connected) {
              reject(new Error('Connection timeout'));
              this.connectionPromise = null;
            }
          }, 5000); // Đợi thêm 5s nữa
        }
      }, 15000);
    });

    return this.connectionPromise;
  }

  // 🆕 THÊM PHƯƠNG THỨC MỚI - Connect với retry
  async connectWithRetry(maxRetries = 3, retryDelay = 2000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔗 Connection attempt ${attempt}/${maxRetries}`);
        await this.connect();
        return true;
      } catch (error) {
        lastError = error;
        console.warn(`Connection attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw lastError || new Error('All connection attempts failed');
  }

  async ensureConnected() {
    if (this.connected && this.client?.connected) {
      return true;
    }
    
    try {
      // 🆕 SỬA: Dùng connectWithRetry thay vì connect
      await this.connectWithRetry();
      return this.connected;
    } catch (error) {
      console.error('Connection failed after retries:', error);
      return false;
    }
  }

  async sendSignal(roomId, signalData) {
    try {
      const signalMessage = {
        ...signalData,
        timestamp: signalData.timestamp || new Date().toISOString()
      };
      
      await this.send(`/app/signal/${roomId}`, signalMessage);
      return true;
    } catch (error) {
      console.error('Error sending signal:', error);
      throw error;
    }
  }

  async subscribeToSignaling(roomId, callback) {
    try {
      const subscription = await this.subscribe(`/topic/signal/${roomId}`, (messageData) => {
        try {
          if (messageData.body) {
            const parsedData = JSON.parse(messageData.body);
            callback(parsedData);
          } else {
            callback(messageData);
          }
        } catch (error) {
          console.error('Error parsing signaling message:', error);
        }
      });
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to signaling:', error);
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

      // 🆕 GIẢM delay xuống 50ms
      await new Promise(resolve => setTimeout(resolve, 50));

      if (!this.client?.connected) {
        throw new Error('STOMP client not connected');
      }

      const token = this.getToken();
      this.client.publish({
        destination,
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}`, ...headers },
      });
      return true;
    } catch (error) {
      console.error('Send failed:', error);
      throw error;
    }
  }

  async subscribe(destination, callback) {
    try {
      const ok = await this.ensureConnected();
      if (!ok) {
        console.warn('⚠️ Cannot subscribe - not connected');
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
          console.warn('Invalid message JSON:', error);
        }
      });

      this.subscriptions.set(destination, sub);
      console.log('✅ Subscribed to:', destination);
      return sub;
    } catch (error) {
      console.error('Subscribe failed:', error);
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
      
      await this.send(`/app/room/${roomId}/join`, userData);
      console.log('✅ Joined room:', roomId);
    } catch (error) {
      console.error('Join room failed:', error);
      throw error;
    }
  }

  async joinRoomWithSignaling(roomId, user) {
    try {
      // Join room thông thường
      await this.joinRoom(roomId, user);
      
      // Gửi WebRTC join signal
      await this.sendSignal(roomId, {
        type: 'join',
        user: {
          id: user.id || user.userId || user.username,
          username: user.username,
          fullName: user.fullName || user.username
        }
      });
      
      console.log('✅ Joined room with signaling:', roomId);
      return true;
    } catch (error) {
      console.error('Join room with signaling failed:', error);
      throw error;
    }
  }

  async subscribeToRoomEvents(roomId, callbacks = {}) {
    try {
      const { onUserJoin, onUserLeave, onPresenceUpdate } = callbacks;
      
      if (onUserJoin || onUserLeave) {
        await this.subscribe(`/topic/room/${roomId}`, (message) => {
          // 🆕 SỬA: Đảm bảo message có body
          if (!message || !message.type) return;
          
          if (message.type === 'join' && onUserJoin) {
            onUserJoin(message.user);
          } else if (message.type === 'leave' && onUserLeave) {
            onUserLeave(message.user);
          }
        });
      }
      
      if (onPresenceUpdate) {
        await this.subscribe(`/topic/presence/${roomId}`, onPresenceUpdate);
      }
      
      console.log('✅ Subscribed to room events:', roomId);
      return true;
    } catch (error) {
      console.error('Subscribe to room events failed:', error);
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
      }
    } catch (error) {
      console.warn('Leave room failed (ignored):', error);
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
    this.subscriptions.forEach((sub, destination) => {
      sub.unsubscribe();
      console.log('🚫 Unsubscribed from:', destination);
    });
    this.subscriptions.clear();
    
    if (this.client) {
      this.client.deactivate();
    }
    
    // 🆕 CLEAR TIMEOUT khi disconnect
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.connected = false;
    this.connectionPromise = null;
    console.log('🔌 Socket disconnected');
  }
}

export default new SocketService();