// File: WebRTCService.js

class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.remoteStreams = new Map();
    this.localStream = null;
    this.roomId = null;
    
    // ============================================
    // CẤU HÌNH TURN SERVER TỐI ƯU CHO DEMO
    // Sử dụng Metered.ca - Ổn định & Miễn phí
    // ============================================
    
    this.config = {
      iceServers: [
        // PRIMARY: Metered.ca TURN (chống lag, ổn định)
        {
          urls: "turn:standard.relay.metered.ca:80",
          username: "cb123ac328807f8b8037b50e",
          credential: "YbrS2Sch00jYJFGn"
        },
        
        // SECONDARY: Metered.ca TURN TLS 
        {
          urls: "turn:standard.relay.metered.ca:443",
          username: "cb123ac328807f8b8037b50e",
          credential: "YbrS2Sch00jYJFGn"
        },
        
        // STUN backup (chỉ dự phòng)
        { urls: 'stun:stun.l.google.com:19302' }
      ],
      
      // Optimization cho ổn định
      iceTransportPolicy: 'all', // Dùng cả relay và direct
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };

    this.onRemoteStream = null;
    this.onIceCandidate = null;
    this.onConnectionStateChange = null;
    this.onIceConnectionStateChange = null;
  }

  setRoomId(roomId) {
    this.roomId = roomId;
  }

  setLocalStream(stream) {
    this.localStream = stream;
  }

  createPeerConnection(userId) {
    if (this.peerConnections.has(userId)) {
      return this.peerConnections.get(userId);
    }

    try {
      console.log('🆕 Creating new peer connection for:', userId);
      const pc = new RTCPeerConnection(this.config);

      // Thêm local stream tracks nếu có
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          try {
            pc.addTrack(track, this.localStream);
            console.log(`✅ Added ${track.kind} track to peer connection`);
          } catch (error) {
            console.error('❌ Error adding track:', error);
          }
        });
      } else {
        console.warn('⚠️ No local stream available when creating peer connection');
      }

      // Xử lý remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          console.log('📹 New remote stream available for:', userId);
          this.remoteStreams.set(userId, remoteStream);
          
          if (this.onRemoteStream) {
            this.onRemoteStream(userId, remoteStream);
          }
        }
      };

      // Xử lý ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('❄️ New ICE candidate for:', userId, event.candidate.type);
          if (this.onIceCandidate && this.roomId) {
            this.onIceCandidate(userId, event.candidate);
          }
        } else {
          console.log('✅ ICE gathering complete for:', userId);
        }
      };

      // Theo dõi connection state
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

      // Theo dõi ICE connection state
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

      // Debug signaling state
      pc.onsignalingstatechange = () => {
        console.log('📡 Signaling state for', userId + ':', pc.signalingState);
      };

      // Debug ICE gathering state
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

  async createOffer(userId) {
    try {
      console.log('🎯 Creating offer for:', userId);
      const pc = this.createPeerConnection(userId);
      
      // Chỉ yêu cầu video nếu localStream có video track
      const hasVideo = this.localStream && this.localStream.getVideoTracks().length > 0;
      
      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: hasVideo,
        voiceActivityDetection: false,
        iceRestart: false
      };

      const offer = await pc.createOffer(offerOptions);
      await pc.setLocalDescription(offer);
      
      // Chờ ICE gathering hoàn tất
      if (pc.iceGatheringState !== 'complete') {
        await this.waitForIceGathering(pc, userId);
      }
      
      console.log('✅ Offer created successfully for:', userId);
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error creating offer for', userId + ':', error);
      throw error;
    }
  }

  async waitForIceGathering(pc, userId, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        console.warn('⏰ ICE gathering timeout for:', userId);
        resolve(); 
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

  async handleOffer(userId, offer) {
    try {
      console.log('📥 Handling offer from:', userId);
      const pc = this.createPeerConnection(userId);
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(answer);
      console.log('✅ Answer created successfully for:', userId);
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error handling offer from', userId + ':', error);
      throw error;
    }
  }

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
      console.log('✅ Answer handled successfully for:', userId);
    } catch (error) {
      console.error('❌ Error handling answer from', userId + ':', error);
      throw error;
    }
  }

  async handleIceCandidate(userId, candidate) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) {
        console.warn('⚠️ No peer connection for candidate from:', userId);
        return;
      }

      if (!candidate) {
        return;
      }
      
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added for:', userId);
      
    } catch (error) {
      console.error('❌ Error adding ICE candidate for', userId + ':', error);
    }
  }

  async restartIce(userId) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) return;

      console.log('🔄 Restarting ICE for:', userId);
      
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      console.log('✅ ICE restart completed for:', userId);
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error restarting ICE for', userId + ':', error);
    }
  }

  getRemoteStream(userId) {
    const stream = this.remoteStreams.get(userId);
    if (stream && stream.getTracks().length > 0) {
      return stream;
    }
    return null;
  }

  getAllRemoteStreams() {
    const activeStreams = new Map();
    this.remoteStreams.forEach((stream, userId) => {
      if (stream && stream.getTracks().length > 0) {
        activeStreams.set(userId, stream);
      }
    });
    return activeStreams;
  }

  getConnectionState(userId) {
    const pc = this.peerConnections.get(userId);
    return pc ? pc.connectionState : 'disconnected';
  }

  closePeerConnection(userId) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      console.log('🔒 Closing peer connection for:', userId);
      
      // Cleanup event handlers
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
    
    // Cleanup local stream
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

  // Phương thức debug
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
        signalingState: pc.signalingState,
        iceGatheringState: pc.iceGatheringState
      });
    });
  }

  // Kiểm tra TURN server hoạt động
  checkTurnServerStatus() {
    console.log('🔍 Checking TURN server configuration...');
    const testPc = new RTCPeerConnection(this.config);
    let relayCandidateFound = false;

    testPc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log('ICE Candidate:', e.candidate.candidate);
        if (e.candidate.candidate.includes('relay')) {
          relayCandidateFound = true;
          console.log('✅ TURN SERVER WORKING - Relay candidate found!');
        }
      } else {
        console.log('ICE gathering complete');
        console.log('Relay candidate found:', relayCandidateFound);
        testPc.close();
      }
    };

    testPc.createDataChannel('test');
    testPc.createOffer().then(offer => testPc.setLocalDescription(offer));
  }

  // Các hàm set event handlers
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