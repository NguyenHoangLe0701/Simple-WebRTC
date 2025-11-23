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

      // 🔥 QUAN TRỌNG: Thêm tracks theo thứ tự nhất quán (audio trước, video sau)
      // Điều này đảm bảo thứ tự m-lines trong SDP luôn giống nhau
      if (this.localStream) {
        // Lấy tất cả tracks
        const audioTracks = this.localStream.getAudioTracks();
        const videoTracks = this.localStream.getVideoTracks();
        
        // Add audio tracks trước
        audioTracks.forEach(track => {
          try {
            pc.addTrack(track, this.localStream);
          } catch (error) {
            console.error('❌ Error adding audio track:', error);
          }
        });
        
        // Add video tracks sau
        videoTracks.forEach(track => {
          try {
            pc.addTrack(track, this.localStream);
          } catch (error) {
            console.error('❌ Error adding video track:', error);
          }
        });
      }

      // Xử lý remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          console.log('📹 Received remote stream from:', userId, {
            audioTracks: remoteStream.getAudioTracks().length,
            videoTracks: remoteStream.getVideoTracks().length
          });
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
        console.log(`🔗 Connection state changed for ${userId}:`, state);
        
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(userId, state);
        }
        
        if (state === 'failed') {
          console.warn(`⚠️ Connection failed for ${userId}, attempting ICE restart...`);
          setTimeout(() => {
            if (pc.connectionState === 'failed') {
              this.restartIce(userId);
            }
          }, 2000);
        } else if (state === 'connected') {
          console.log(`✅ Connection established for ${userId}`);
        }
      };

      // Theo dõi ICE connection state
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log(`🧊 ICE connection state changed for ${userId}:`, state);
        
        if (this.onIceConnectionStateChange) {
          this.onIceConnectionStateChange(userId, state);
        }
        
        if (state === 'connected') {
          console.log(`✅ ICE connected for ${userId}`);
        } else if (state === 'failed') {
          console.warn(`⚠️ ICE failed for ${userId}`);
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
      
      // 🔥 QUAN TRỌNG: Không dùng offerOptions với offerToReceiveAudio/Video
      // Để browser tự động tạo SDP dựa trên tracks đã add
      // Điều này đảm bảo m-lines được tạo đúng thứ tự
      const offer = await pc.createOffer();
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
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
        } catch (setError) {
          // Nếu lỗi khi set remote description, đóng và tạo lại
          if (setError.name === 'InvalidAccessError' || setError.name === 'InvalidStateError') {
            console.warn('⚠️ Error setting remote description - recreating connection');
            this.closePeerConnection(userId);
            return null;
          }
          throw setError;
        }
      } else {
        // Nếu không ở stable, bỏ qua offer này (có thể đã được xử lý)
        return null;
      }
      
      // 🔥 QUAN TRỌNG: Không dùng options khi tạo answer
      // Browser sẽ tự động match m-lines với offer
      // Điều này đảm bảo thứ tự m-lines khớp với offer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return pc.localDescription;
      
    } catch (error) {
      // Nếu lỗi là InvalidStateError, có thể do race condition, bỏ qua
      if (error.name === 'InvalidStateError') {
        return null;
      }
      // Nếu lỗi InvalidAccessError (m-lines mismatch), đóng connection
      if (error.name === 'InvalidAccessError') {
        console.warn('⚠️ SDP m-lines mismatch when handling offer - closing connection');
        this.closePeerConnection(userId);
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
        console.warn('⚠️ No peer connection for answer from:', userId);
        return;
      }

      // 🔥 FIX: Kiểm tra state chi tiết hơn
      const currentState = pc.signalingState;
      console.log(`🔍 Current signaling state for ${userId}:`, currentState);
      
      if (currentState === 'stable') {
        // Đã ở trạng thái stable, answer này có thể đã được xử lý hoặc đến muộn
        console.warn('⚠️ Answer received in stable state for:', userId, '- ignoring');
        return;
      }
      
      if (currentState !== 'have-local-offer') {
        // Không ở trạng thái đúng, bỏ qua
        console.warn('⚠️ Answer received in wrong state for:', userId, '- state:', currentState);
        return;
      }

      // 🔥 FIX: Validate answer trước khi set
      if (!answer || !answer.type || answer.type !== 'answer') {
        console.error('❌ Invalid answer format for:', userId, answer);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Successfully set remote answer for:', userId);
    } catch (error) {
      // 🔥 QUAN TRỌNG: Xử lý các lỗi SDP negotiation
      if (error.name === 'InvalidAccessError') {
        // Lỗi m-lines không khớp - đóng và tạo lại peer connection
        console.warn('⚠️ SDP m-lines mismatch for', userId, '- recreating connection');
        this.closePeerConnection(userId);
        
        // Thử tạo lại offer sau 500ms
        setTimeout(async () => {
          try {
            const newOffer = await this.createOffer(userId);
            if (this.onIceCandidate) {
              // Gửi lại offer nếu có callback
              // Note: Component cần xử lý việc gửi offer
            }
          } catch (retryError) {
            console.error('❌ Error recreating offer:', retryError);
          }
        }, 500);
        return;
      }
      
      // 🔥 FIX: Xử lý InvalidStateError tốt hơn
      if (error.name === 'InvalidStateError') {
        const currentState = pc?.signalingState;
        console.warn(`⚠️ InvalidStateError when handling answer for ${userId} - current state:`, currentState);
        
        // Nếu đã ở stable, bỏ qua (có thể đã được xử lý)
        if (currentState === 'stable' || currentState === 'have-remote-answer') {
          console.log('ℹ️ Answer already processed, ignoring');
          return;
        }
        
        // Nếu ở trạng thái khác, có thể cần reset
        if (currentState === 'have-local-answer') {
          console.warn('⚠️ Duplicate answer detected, closing connection');
          this.closePeerConnection(userId);
          return;
        }
      }
      
      console.error('❌ Error handling answer from', userId + ':', error);
      // Không throw error để tránh crash, chỉ log
    }
  }

  async handleIceCandidate(userId, candidate) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) {
        console.warn('⚠️ No peer connection for ICE candidate from:', userId);
        return;
      }
      
      if (!candidate) {
        console.warn('⚠️ Empty ICE candidate from:', userId);
        return;
      }
      
      // 🔥 FIX: Validate candidate format
      if (typeof candidate === 'string') {
        // Nếu là string, parse thành object
        try {
          candidate = JSON.parse(candidate);
        } catch (e) {
          console.warn('⚠️ Invalid ICE candidate format (string):', candidate);
          return;
        }
      }
      
      // 🔥 FIX: Kiểm tra candidate có đầy đủ thông tin không
      if (!candidate.candidate && !candidate.sdpMLineIndex && !candidate.sdpMid) {
        console.warn('⚠️ Invalid ICE candidate structure:', candidate);
        return;
      }
      
      // 🔥 FIX: Chỉ add candidate khi ở trạng thái hợp lệ
      const validStates = ['stable', 'have-local-offer', 'have-remote-offer', 'have-local-answer', 'have-remote-answer'];
      if (!validStates.includes(pc.signalingState)) {
        console.warn('⚠️ Cannot add ICE candidate - invalid signaling state:', pc.signalingState);
        return;
      }
      
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      
    } catch (error) {
      // Bỏ qua lỗi nếu candidate đã được thêm hoặc connection đã đóng
      if (error.name === 'OperationError') {
        // Candidate đã được thêm, bỏ qua
        return;
      }
      if (error.name === 'InvalidStateError') {
        // Connection đã đóng hoặc state không hợp lệ
        console.warn('⚠️ Invalid state when adding ICE candidate for', userId);
        return;
      }
      console.error('❌ Error adding ICE candidate for', userId + ':', error);
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

  hasPeerConnection(userId) {
    return this.peerConnections.has(userId);
  }

  // 🆕 FIX: Kiểm tra xem có thể gửi ICE candidate không
  canSendIceCandidate(userId) {
    const pc = this.peerConnections.get(userId);
    if (!pc) return false;
    
    // Chỉ gửi ICE candidate khi ở trạng thái hợp lệ
    const validStates = ['stable', 'have-local-offer', 'have-remote-offer'];
    return validStates.includes(pc.signalingState);
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
    // Chỉ log trong development mode
    if (process.env.NODE_ENV === 'development') {
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
  }

  // Kiểm tra TURN server hoạt động
  checkTurnServerStatus() {
    // Chỉ log trong development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Checking TURN server configuration...');
    }
    const testPc = new RTCPeerConnection(this.config);
    let relayCandidateFound = false;

    testPc.onicecandidate = (e) => {
      if (e.candidate) {
        if (process.env.NODE_ENV === 'development') {
          console.log('ICE Candidate:', e.candidate.candidate);
        }
        if (e.candidate.candidate.includes('relay')) {
          relayCandidateFound = true;
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ TURN SERVER WORKING - Relay candidate found!');
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('ICE gathering complete');
          console.log('Relay candidate found:', relayCandidateFound);
        }
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