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
        if (this.stompClient && this.isConnected) {
          // Already connected
          return resolve();
        }
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
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: (frame) => {
            console.log('✅ STOMP Connected: ' + frame);
            console.log('  Frame headers:', frame.headers);
            this.isConnected = true;
            
            // Log all active subscriptions after connection
            setTimeout(() => {
              console.log('📋 Active subscriptions:', Array.from(this.subscriptions.keys()));
            }, 100);
            
            resolve();
          },
          onStompError: (frame) => {
            console.error('STOMP error: ' + frame.headers['message']);
            console.error('Details: ' + frame.body);
            this.isConnected = false;
            reject(frame);
          },
          onWebSocketClose: () => {
            console.warn('STOMP: WebSocket closed');
            this.isConnected = false;
          },
          onDisconnect: () => {
            console.log('STOMP: Disconnected');
            this.isConnected = false;
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
    if (this.stompClient) {
      try {
        this.stompClient.deactivate();
      } finally {
        this.isConnected = false;
        this.subscriptions.clear();
      }
    }
  }

  subscribe(destination, callback) {
    if (this.stompClient && this.isConnected) {
      console.log('📥 Subscribing to:', destination);
      console.log('  STOMP client:', this.stompClient);
      console.log('  Is connected:', this.isConnected);
      
      try {
        const subscription = this.stompClient.subscribe(destination, (frame) => {
          console.log('📨 MESSAGE RECEIVED FROM SUBSCRIPTION:', destination);
          console.log('  Frame:', frame);
          console.log('  Body:', frame.body);
          console.log('  Headers:', frame.headers);
          console.log('  Destination header:', frame.headers?.destination || destination);
          
          if (!frame.body) {
            console.warn('⚠️ Empty frame body received');
            return;
          }
          
          console.log('  Calling callback...');
          try {
            callback(frame);
            console.log('✅ Callback executed successfully');
          } catch (callbackErr) {
            console.error('❌ Error in subscription callback:', callbackErr);
            console.error('  Error details:', callbackErr.message, callbackErr.stack);
          }
        });
        
        if (subscription) {
          this.subscriptions.set(destination, subscription);
          console.log('✅ Successfully subscribed to:', destination);
          console.log('  Subscription ID:', subscription.id || 'unknown');
          console.log('  Total subscriptions:', this.subscriptions.size);
          console.log('  All subscriptions:', Array.from(this.subscriptions.keys()));
        } else {
          console.error('❌ Subscription returned null/undefined for:', destination);
        }
        
        return subscription;
      } catch (err) {
        console.error('❌ Error subscribing to:', destination, err);
        console.error('  Error details:', err.message, err.stack);
        return null;
      }
    } else {
      console.error('❌ Cannot subscribe - not connected. Destination:', destination);
      console.error('  STOMP client exists:', !!this.stompClient);
      console.error('  Is connected:', this.isConnected);
      return null;
    }
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
      const bodyStr = JSON.stringify(body);
      console.log('📤 Sending STOMP message:');
      console.log('  Destination:', destination);
      console.log('  Body:', bodyStr);
      console.log('  Headers:', headers);
      
      try {
        this.stompClient.publish({
          destination: destination,
          body: bodyStr,
          headers: headers
        });
        console.log('✅ Message published successfully');
      } catch (err) {
        console.error('❌ Error publishing message:', err);
      }
    } else {
      console.error('❌ Not connected to WebSocket - cannot send message');
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
    const destination = `/topic/chat/${roomId}`;
    console.log('📥 subscribeToChat called for:', destination);
    
    const wrappedCallback = (frame) => {
      console.log('📨 Chat message callback triggered!');
      console.log('  Destination:', frame.headers?.destination || destination);
      console.log('  Body:', frame.body);
      console.log('  Headers:', frame.headers);
      callback(frame);
    };
    
    const subscription = this.subscribe(destination, wrappedCallback);
    
    if (subscription) {
      console.log('✅ subscribeToChat successful, subscription:', subscription);
    } else {
      console.error('❌ subscribeToChat failed - subscription is null');
    }
    
    return subscription;
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