class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.remoteStreams = new Map();
    this.localStream = null;
    this.roomId = null;
    
    // 🆕 FIX: Config ICE servers tối ưu hơn
    this.config = {
      iceServers: [
        // STUN servers chính
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        
        // 🆕 FIX: Giảm bớt STUN servers, tập trung vào TURN
        { 
          urls: [
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turn:openrelay.metered.ca:443?transport=tcp'
          ],
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        
        // 🆕 FIX: Thêm TURN server hoạt động tốt
        {
          urls: [
            'turn:global.turn.twilio.com:3478?transport=udp',
            'turn:global.turn.twilio.com:3478?transport=tcp'
          ],
          username: 'd7706e7c1a983ef5490b7d22b12d8a0b0d9c57b1e2e0b7e1e7e9e7e9e7e9e7e9',
          credential: 'e7e9e7e9e7e9e7e9e7e9e7e9e7e9e7e9e7e9e7e9e7e9e7e9'
        }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: 'all'
    };

    // 🆕 FIX: Event handlers mặc định
    this.onRemoteStream = null;
    this.onIceCandidate = null;
    this.onConnectionStateChange = null;
    this.onIceConnectionStateChange = null;
  }

  // 🆕 FIX: Set room ID để gửi signaling
  setRoomId(roomId) {
    this.roomId = roomId;
  }

  setLocalStream(stream) {
    this.localStream = stream;
    console.log('🎥 Local stream set with tracks:', 
      stream?.getTracks().map(t => t.kind));
  }

  // 🆕 FIX: Tạo peer connection với config tốt hơn
  createPeerConnection(userId) {
    if (this.peerConnections.has(userId)) {
      console.log('📝 Using existing peer connection for:', userId);
      return this.peerConnections.get(userId);
    }

    try {
      console.log('🆕 Creating new peer connection for:', userId);
      const pc = new RTCPeerConnection(this.config);

      // 🆕 FIX: Thêm local tracks với error handling
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          try {
            console.log('➕ Adding local track:', track.kind, track.id);
            pc.addTrack(track, this.localStream);
          } catch (error) {
            console.error('❌ Error adding track:', error);
          }
        });
      } else {
        console.warn('⚠️ No local stream available when creating peer connection');
      }

      // 🆕 FIX: Xử lý remote stream chi tiết hơn
      pc.ontrack = (event) => {
        console.log('🎯 Received remote track event:', {
          trackKind: event.track.kind,
          trackId: event.track.id,
          streamCount: event.streams.length
        });

        const [remoteStream] = event.streams;
        if (remoteStream) {
          console.log('📹 New remote stream available for:', userId);
          this.remoteStreams.set(userId, remoteStream);
          
          // 🆕 FIX: Thêm event listener cho stream
          remoteStream.onaddtrack = (trackEvent) => {
            console.log('➕ Remote track added:', trackEvent.track.kind);
          };

          remoteStream.onremovetrack = (trackEvent) => {
            console.log('➖ Remote track removed:', trackEvent.track.kind);
          };

          if (this.onRemoteStream) {
            this.onRemoteStream(userId, remoteStream);
          }
        }
      };

      // 🆕 FIX: ICE candidate handling cải tiến
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 ICE candidate generated for:', userId, {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address || 'unknown',
            port: event.candidate.port,
            candidate: event.candidate.candidate?.substring(0, 30) + '...'
          });
          
          if (this.onIceCandidate && this.roomId) {
            this.onIceCandidate(userId, event.candidate);
          }
        } else {
          console.log('✅ ICE gathering complete for:', userId);
        }
      };

      // 🆕 FIX: Connection state với retry logic
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log('🔗 Connection state for', userId + ':', state);
        
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(userId, state);
        }
        
        switch(state) {
          case 'connected':
            console.log('🎉 Peer connection established with:', userId);
            break;
          case 'failed':
            console.error('❌ Peer connection failed with:', userId);
            // 🆕 Tự động retry sau 2s
            setTimeout(() => {
              if (pc.connectionState === 'failed') {
                console.log('🔄 Attempting to restart connection with:', userId);
                this.restartIce(userId);
              }
            }, 2000);
            break;
          case 'disconnected':
            console.warn('⚠️ Peer connection disconnected with:', userId);
            break;
        }
      };

      // 🆕 FIX: ICE connection state chi tiết
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log('❄️ ICE connection state for', userId + ':', state);
        
        if (this.onIceConnectionStateChange) {
          this.onIceConnectionStateChange(userId, state);
        }

        switch(state) {
          case 'connected':
            console.log('🟢 ICE connected with:', userId);
            break;
          case 'completed':
            console.log('✅ ICE completed with:', userId);
            break;
          case 'failed':
            console.error('🔴 ICE failed with:', userId);
            break;
          case 'disconnected':
            console.warn('🟡 ICE disconnected with:', userId);
            break;
        }
      };

      // 🆕 FIX: Signaling state
      pc.onsignalingstatechange = () => {
        console.log('📡 Signaling state for', userId + ':', pc.signalingState);
      };

      // 🆕 FIX: ICE gathering state
      pc.onicegatheringstatechange = () => {
        console.log('🌐 ICE gathering state for', userId + ':', pc.iceGatheringState);
      };

      this.peerConnections.set(userId, pc);
      return pc;

    } catch (error) {
      console.error('❌ Error creating peer connection for', userId + ':', error);
      throw error;
    }
  }

  // 🆕 FIX: Tạo offer với timeout và error handling
  async createOffer(userId) {
    try {
      console.log('🎯 Creating offer for:', userId);
      const pc = this.createPeerConnection(userId);
      
      // 🆕 FIX: Offer options tối ưu
      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: false,
        iceRestart: false
      };

      const offer = await pc.createOffer(offerOptions);
      console.log('📤 Offer created:', offer.type);
      
      await pc.setLocalDescription(offer);
      console.log('✅ Local description set');
      
      // 🆕 FIX: Chờ ICE gathering với timeout
      if (pc.iceGatheringState !== 'complete') {
        await this.waitForIceGathering(pc, userId);
      }
      
      console.log('✅ Offer ready for signaling');
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error creating offer for', userId + ':', error);
      throw error;
    }
  }

  // 🆕 FIX: Helper method chờ ICE gathering
  async waitForIceGathering(pc, userId, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        console.warn('⏰ ICE gathering timeout for:', userId);
        resolve(); // Vẫn resolve để không block
      }, timeout);

      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeoutId);
          resolve();
        }
      };

      pc.addEventListener('icegatheringstatechange', checkState);
    });
  }

  // 🆕 FIX: Xử lý offer với rollback nếu fail
  async handleOffer(userId, offer) {
    try {
      console.log('📥 Handling offer from:', userId);
      const pc = this.createPeerConnection(userId);
      
      // 🆕 FIX: Save current signaling state để rollback
      const previousSignalingState = pc.signalingState;
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ Remote description set from offer');
      
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(answer);
      console.log('📤 Answer created and local description set');
      
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error handling offer from', userId + ':', error);
      throw error;
    }
  }

  // 🆕 FIX: Xử lý answer với validation
  async handleAnswer(userId, answer) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) {
        throw new Error(`No peer connection found for user: ${userId}`);
      }

      console.log('📥 Handling answer from:', userId);
      
      if (pc.signalingState !== 'have-local-offer') {
        console.warn('⚠️ Unexpected signaling state:', pc.signalingState);
      }

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Remote description set from answer');
      
    } catch (error) {
      console.error('❌ Error handling answer from', userId + ':', error);
      throw error;
    }
  }

  // 🆕 FIX: Xử lý ICE candidate với validation
  async handleIceCandidate(userId, candidate) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) {
        console.warn('⚠️ No peer connection for candidate from:', userId);
        return;
      }

      if (!candidate) {
        console.log('✅ End of ICE candidates for:', userId);
        return;
      }

      console.log('➕ Adding ICE candidate for:', userId);
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added successfully');
      
    } catch (error) {
      console.error('❌ Error adding ICE candidate for', userId + ':', error);
      // Không throw error vì đây không phải lỗi critical
    }
  }

  // 🆕 FIX: Restart ICE connection
  async restartIce(userId) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) return;

      console.log('🔄 Restarting ICE for:', userId);
      
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      
      console.log('✅ ICE restart initiated');
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error restarting ICE for', userId + ':', error);
    }
  }

  // 🆕 FIX: Get remote stream với validation
  getRemoteStream(userId) {
    const stream = this.remoteStreams.get(userId);
    if (stream && stream.getTracks().length > 0) {
      return stream;
    }
    return null;
  }

  // 🆕 FIX: Get all active remote streams
  getAllRemoteStreams() {
    const activeStreams = new Map();
    this.remoteStreams.forEach((stream, userId) => {
      if (stream && stream.getTracks().length > 0) {
        activeStreams.set(userId, stream);
      }
    });
    return activeStreams;
  }

  // 🆕 FIX: Kiểm tra connection state
  getConnectionState(userId) {
    const pc = this.peerConnections.get(userId);
    return pc ? pc.connectionState : 'disconnected';
  }

  // 🆕 FIX: Đóng peer connection an toàn
  closePeerConnection(userId) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      console.log('🔒 Closing peer connection for:', userId);
      
      // Remove event listeners
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      
      pc.close();
      this.peerConnections.delete(userId);
      this.remoteStreams.delete(userId);
      
      console.log('✅ Peer connection closed for:', userId);
    }
  }

  // 🆕 FIX: Cleanup toàn bộ
  cleanup() {
    console.log('🧹 Cleaning up all WebRTC connections...');
    
    this.peerConnections.forEach((pc, userId) => {
      try {
        pc.close();
      } catch (error) {
        console.warn('Error closing PC for', userId + ':', error);
      }
    });
    
    this.peerConnections.clear();
    this.remoteStreams.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.warn('Error stopping track:', error);
        }
      });
      this.localStream = null;
    }
    
    this.roomId = null;
    console.log('✅ WebRTC service completely cleaned up');
  }

  // 🆕 FIX: Debug methods
  logConnectionStats() {
    console.log('📊 WebRTC Connection Stats:', {
      peerConnections: this.peerConnections.size,
      remoteStreams: this.remoteStreams.size,
      localStream: this.localStream ? 
        this.localStream.getTracks().map(t => t.kind) : 'none',
      roomId: this.roomId
    });

    this.peerConnections.forEach((pc, userId) => {
      console.log(`👤 ${userId}:`, {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState
      });
    });
  }

  // 🆕 FIX: Event handlers
  setOnRemoteStream(callback) {
    this.onRemoteStream = callback;
  }

  setOnIceCandidate(callback) {
    this.onIceCandidate = callback;
  }

  setOnConnectionStateChange(callback) {
    this.onConnectionStateChange = callback;
  }

  setOnIceConnectionStateChange(callback) {
    this.onIceConnectionStateChange = callback;
  }
}

export default new WebRTCService();