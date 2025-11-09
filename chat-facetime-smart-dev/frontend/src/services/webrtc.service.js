// File: WebRTCService.js

class WebRTCService {
    constructor() {
      this.peerConnections = new Map();
      this.remoteStreams = new Map();
      this.localStream = null;
      this.roomId = null;
      
      // Cấu hình ICE đã gộp cả 2 dịch vụ miễn phí
      this.config = {
        iceServers: [
           // 1. STUN của Google (Luôn giữ)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    
    // 2. Thêm Xirsys (Gói Free) - Nếu bạn đăng ký thì điền vào đây
    // { 
    //   urls: 'turn:global.xirsys.com:3478', 
    //   username: 'your-xirsys-username',
    //   credential: 'your-xirsys-password'
    // },
    
    // 3. Thêm Metered.ca (Gói 20GB của bạn)
    //gói500mb
    {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "ad4f62179a50703ad64c213c",
        credential: "loMnUC24FBOBhMMA",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "ad4f62179a50703ad64c213c",
        credential: "loMnUC24FBOBhMMA",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "ad4f62179a50703ad64c213c",
        credential: "loMnUC24FBOBhMMA",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "ad4f62179a50703ad64c213c",
        credential: "loMnUC24FBOBhMMA",
      },
    //gói20GB
    // {
    //   urls: 'turn:turn.metered.ca:443',
    //   username: 'ad4f62179a50703ad64c213c', // <-- VÀ ĐÂY NỮA
    //   credential: 'loMnUC24FBOBhMMA' // <-- VÀ ĐÂY NỮA
    // },
    
    // 4. (TÙY CHỌN) Server của bạn bạn
    // {
    //   urls: 'turn:server-cua-ban.com:3478',
    //   username: 'username-cua-ban',
    //   credential: 'password-cua-ban'
    // }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceTransportPolicy: 'all'
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
  
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => {
            try {
              pc.addTrack(track, this.localStream);
            } catch (error) {
              console.error('❌ Error adding track:', error);
            }
          });
        } else {
          console.warn('⚠️ No local stream available when creating peer connection');
        }
  
        pc.ontrack = (event) => {
          const [remoteStream] = event.streams;
          if (remoteStream) {
            console.log('📹 New remote stream available for:', userId);
            this.remoteStreams.set(userId, remoteStream);
            
            remoteStream.onaddtrack = (trackEvent) => {
            
            };
  
            remoteStream.onremovetrack = (trackEvent) => {
            };
  
            if (this.onRemoteStream) {
              this.onRemoteStream(userId, remoteStream);
            }
          }
        };
  
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            if (this.onIceCandidate && this.roomId) {
              this.onIceCandidate(userId, event.candidate);
            }
          } else {
            console.log('✅ ICE gathering complete for:', userId); // Giữ lại log quan trọng này
          }
        };
  
        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          console.log('🔗 Connection state for', userId + ':', state); // Giữ lại log quan trọng này
          
          if (this.onConnectionStateChange) {
            this.onConnectionStateChange(userId, state);
          }
          
          switch(state) {
            case 'connected':
              console.log('🎉 Peer connection established with:', userId);
              break;
            case 'failed':
              console.error('❌ Peer connection failed with:', userId); // Giữ lại log lỗi
              setTimeout(() => {
                if (pc.connectionState === 'failed') {
                  console.log('🔄 Attempting to restart connection with:', userId);
                  this.restartIce(userId);
                }
              }, 2000);
              break;
            case 'disconnected':
              console.warn('⚠️ Peer connection disconnected with:', userId); // Giữ lại log cảnh báo
              break;
          }
        };
  
        pc.oniceconnectionstatechange = () => {
          const state = pc.iceConnectionState;
          console.log('❄️ ICE connection state for', userId + ':', state); // Giữ lại log quan trọng
          
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
              console.error('🔴 ICE failed with:', userId); // Giữ lại log lỗi
              break;
            case 'disconnected':
              console.warn('🟡 ICE disconnected with:', userId); // Giữ lại log cảnh báo
              break;
          }
        };
  
        pc.onsignalingstatechange = () => {
          console.log('📡 Signaling state for', userId + ':', pc.signalingState); // Giữ lại log quan trọng
        };
  
        pc.onicegatheringstatechange = () => {
          console.log('🌐 ICE gathering state for', userId + ':', pc.iceGatheringState); // Giữ lại log quan trọng
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
        
        const offerOptions = {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
          voiceActivityDetection: false,
          iceRestart: false
        };
  
        const offer = await pc.createOffer(offerOptions);

        await pc.setLocalDescription(offer);
        
        if (pc.iceGatheringState !== 'complete') {
          await this.waitForIceGathering(pc, userId);
        }
        
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
        
        const previousSignalingState = pc.signalingState;
        
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        await pc.setLocalDescription(answer);
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
        
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.oniceconnectionstatechange = null;
        
        pc.close();
        this.peerConnections.delete(userId);
        this.remoteStreams.delete(userId);
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
  
    // Phương thức debug này vẫn giữ nguyên log
    logConnectionStats() {
      console.log('📊 WebRTC Connection Stats:', {
        peerConnections: this.peerConnections.size,
       sremoteStreams: this.remoteStreams.size,
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
  
  // Các hàm set event handlers giữ nguyên
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