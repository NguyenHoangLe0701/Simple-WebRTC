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
      const pc = new RTCPeerConnection(this.config);

      // Thêm local stream tracks nếu có
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          try {
            pc.addTrack(track, this.localStream);
          } catch (error) {
            console.error('❌ Error adding track:', error);
          }
        });
      }

      // Xử lý remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          this.remoteStreams.set(userId, remoteStream);
          
          if (this.onRemoteStream) {
            this.onRemoteStream(userId, remoteStream);
          }
        }
      };

      // Xử lý ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          if (this.onIceCandidate && this.roomId) {
            this.onIceCandidate(userId, event.candidate);
          }
        }
      };

      // Theo dõi connection state
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(userId, state);
        }
        
        if (state === 'failed') {
          setTimeout(() => {
            if (pc.connectionState === 'failed') {
              this.restartIce(userId);
            }
          }, 2000);
        }
      };

      // Theo dõi ICE connection state
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        
        if (this.onIceConnectionStateChange) {
          this.onIceConnectionStateChange(userId, state);
        }
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
      let pc = this.peerConnections.get(userId);
      
      // Nếu peer connection đã tồn tại, kiểm tra state
      if (pc) {
        // Nếu đã ở trạng thái have-remote-offer hoặc have-local-answer, đóng và tạo mới
        if (pc.signalingState === 'have-remote-offer' || pc.signalingState === 'have-local-answer') {
          this.closePeerConnection(userId);
          pc = this.createPeerConnection(userId);
        } else if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
          // Nếu không ở trạng thái phù hợp, tạo mới
          this.closePeerConnection(userId);
          pc = this.createPeerConnection(userId);
        }
      } else {
        pc = this.createPeerConnection(userId);
      }
      
      // Chỉ set remote description nếu đang ở trạng thái stable (chưa có offer nào)
      if (pc.signalingState === 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
      } else {
        // Nếu không ở stable, bỏ qua offer này (có thể đã được xử lý)
        return null;
      }
      
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.localStream && this.localStream.getVideoTracks().length > 0
      });
      
      await pc.setLocalDescription(answer);
      return pc.localDescription;
      
    } catch (error) {
      // Nếu lỗi là InvalidStateError, có thể do race condition, bỏ qua
      if (error.name === 'InvalidStateError') {
        return null;
      }
      console.error('❌ Error handling offer from', userId + ':', error);
      throw error;
    }
  }

  async handleAnswer(userId, answer) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) {
        // Nếu không có peer connection, có thể answer đến quá sớm, bỏ qua
        return;
      }

      // Kiểm tra state trước khi set remote description
      if (pc.signalingState === 'stable') {
        // Đã ở trạng thái stable, answer này có thể đã được xử lý hoặc đến muộn
        return;
      }
      
      if (pc.signalingState !== 'have-local-offer') {
        // Không ở trạng thái đúng, bỏ qua
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      // Nếu lỗi là InvalidStateError và state là stable, bỏ qua (đã được xử lý)
      if (error.name === 'InvalidStateError' && pc?.signalingState === 'stable') {
        return;
      }
      console.error('❌ Error handling answer from', userId + ':', error);
      throw error;
    }
  }

  async handleIceCandidate(userId, candidate) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc || !candidate) {
        return;
      }
      
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      
    } catch (error) {
      // Bỏ qua lỗi nếu candidate đã được thêm hoặc connection đã đóng
      if (error.name !== 'OperationError' && error.name !== 'InvalidStateError') {
        console.error('❌ Error adding ICE candidate for', userId + ':', error);
      }
    }
  }

  async restartIce(userId) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) return;
      
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
      // Cleanup event handlers
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
    this.peerConnections.forEach((pc, userId) => {
      try {
        pc.close();
      } catch (error) {
        // Ignore cleanup errors
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
          // Ignore cleanup errors
        }
      });
      this.localStream = null;
    }
    
    this.roomId = null;
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