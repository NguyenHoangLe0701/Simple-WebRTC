class WebRTCService {
    constructor() {
      this.peerConnections = new Map();
      this.remoteStreams = new Map();
      this.localStream = null;
      this.config = {
        iceServers: [
          // STUN servers - miễn phí
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          
          // 🆕 Thêm STUN servers dự phòng
          { urls: 'stun:stun.voipbuster.com' },
          { urls: 'stun:stun.voipstunt.com' },
          { urls: 'stun:stun.ideasip.com' },
          
          // 🚨 QUAN TRỌNG: TURN servers miễn phí
          { 
            urls: [
              'turn:openrelay.metered.ca:80',
              'turn:openrelay.metered.ca:443',
              'turn:openrelay.metered.ca:443?transport=tcp'
            ],
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          
          //TURN server miễn phí thứ 2
        //   {
        //     urls: [
        //       'turn:numb.viagenie.ca:3478',
        //       'turn:numb.viagenie.ca:3478?transport=tcp'
        //     ],
        //     username: 'hieu.hoang@example.com', // 🎯 THAY EMAIL CỦA BẠN
        //     credential: 'password123' // 🎯 THAY PASSWORD
        //   },
          
          // 🆕 TURN server miễn phí thứ 3
          {
            urls: 'turn:turn.bistri.com:80',
            username: 'homeo',
            credential: 'homeo'
          },
          
          // 🆕 TURN server miễn phí thứ 4
          {
            urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
            username: 'webrtc',
            credential: 'webrtc'
          }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceTransportPolicy: 'all' //QUAN TRỌNG: Cho phép dùng relay
      };
    }
  
    setLocalStream(stream) {
      this.localStream = stream;
    }
  
    // 🆕 Tạo peer connection với config tốt hơn
    createPeerConnection(userId) {
      if (this.peerConnections.has(userId)) {
        return this.peerConnections.get(userId);
      }
  
      try {
        const pc = new RTCPeerConnection(this.config);
  
        // Thêm local tracks nếu có
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => {
            console.log('➕ Adding local track:', track.kind);
            pc.addTrack(track, this.localStream);
          });
        }
  
        // Xử lý remote stream
        pc.ontrack = (event) => {
          console.log('🎯 Received remote track:', event.track.kind);
          const [remoteStream] = event.streams;
          if (remoteStream) {
            this.remoteStreams.set(userId, remoteStream);
            
            // Event để component cập nhật UI
            if (this.onRemoteStream) {
              this.onRemoteStream(userId, remoteStream);
            }
          }
        };
  
        // Xử lý ICE candidates - CHI TIẾT HƠN
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate;
            console.log('🧊 ICE candidate:', {
              type: candidate.type,
              protocol: candidate.protocol,
              address: candidate.address,
              port: candidate.port,
              candidate: candidate.candidate.substring(0, 50) + '...'
            });
            
            if (this.onIceCandidate) {
              this.onIceCandidate(userId, event.candidate);
            }
          } else {
            console.log('✅ ICE gathering complete');
            // Log số lượng candidates
            console.log('📊 Total ICE candidates gathered');
          }
        };
  
        // Xử lý ICE gathering state
        pc.onicegatheringstatechange = () => {
          console.log('🌐 ICE gathering state:', pc.iceGatheringState);
        };
  
        // Xử lý connection state
        pc.onconnectionstatechange = () => {
          console.log('🔗 Connection state:', pc.connectionState);
          if (this.onConnectionStateChange) {
            this.onConnectionStateChange(userId, pc.connectionState);
          }
          
          if (pc.connectionState === 'connected') {
            console.log('🎉 PEER CONNECTION ESTABLISHED!');
          } else if (pc.connectionState === 'failed') {
            console.error('❌ Peer connection failed');
          }
        };
  
        // Xử lý ICE connection state
        pc.oniceconnectionstatechange = () => {
          console.log('❄️ ICE connection state:', pc.iceConnectionState);
          if (this.onIceConnectionStateChange) {
            this.onIceConnectionStateChange(userId, pc.iceConnectionState);
          }
  
          // Xử lý các trạng thái ICE quan trọng
          if (pc.iceConnectionState === 'connected') {
            console.log('🟢 ICE Connected - Peer-to-peer established!');
          } else if (pc.iceConnectionState === 'completed') {
            console.log('✅ ICE Completed - Connection optimized');
          } else if (pc.iceConnectionState === 'failed') {
            console.error('🔴 ICE Failed - Check TURN servers');
          } else if (pc.iceConnectionState === 'disconnected') {
            console.warn('🟡 ICE Disconnected - Network issues');
          }
        };
  
        //  Xử lý signaling state
        pc.onsignalingstatechange = () => {
          console.log('📡 Signaling state:', pc.signalingState);
        };
  
        this.peerConnections.set(userId, pc);
        return pc;
  
      } catch (error) {
        console.error('❌ Error creating peer connection:', error);
        throw error;
      }
    }
  
    // Tạo offer với options tốt hơn
    async createOffer(userId) {
      try {
        const pc = this.createPeerConnection(userId);
        
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
          voiceActivityDetection: false, //  Tối ưu audio
          iceRestart: false
        });
        
        await pc.setLocalDescription(offer);
        console.log('📤 Created offer successfully');
        
        // 🆕 Đợi ICE gathering hoàn tất một phần
        if (pc.iceGatheringState !== 'complete') {
          await new Promise(resolve => {
            const checkState = () => {
              if (pc.iceGatheringState === 'complete') {
                resolve();
              } else {
                setTimeout(checkState, 100);
              }
            };
            checkState();
          });
        }
        
        return pc.localDescription;
      } catch (error) {
        console.error('❌ Error creating offer:', error);
        throw error;
      }
    }
  
    // 🆕 Xử lý offer từ remote
    async handleOffer(userId, offer) {
      try {
        const pc = this.createPeerConnection(userId);
        
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('📥 Set remote description from offer');
        
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        await pc.setLocalDescription(answer);
        console.log('📤 Created answer successfully');
        
        return pc.localDescription;
      } catch (error) {
        console.error('❌ Error handling offer:', error);
        throw error;
      }
    }
  
    // 🆕 Xử lý answer từ remote
    async handleAnswer(userId, answer) {
      try {
        const pc = this.peerConnections.get(userId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('✅ Set remote description from answer');
        }
      } catch (error) {
        console.error('❌ Error handling answer:', error);
        throw error;
      }
    }
  
    // 🆕 Xử lý ICE candidate
    async handleIceCandidate(userId, candidate) {
      try {
        const pc = this.peerConnections.get(userId);
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('➕ Added ICE candidate for:', userId);
        }
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error);
      }
    }
  
    // 🆕 Lấy remote stream
    getRemoteStream(userId) {
      return this.remoteStreams.get(userId);
    }
  
    // 🆕 Lấy tất cả remote streams
    getAllRemoteStreams() {
      return this.remoteStreams;
    }
  
    // 🆕 Kiểm tra peer connection state
    getConnectionState(userId) {
      const pc = this.peerConnections.get(userId);
      return pc ? pc.connectionState : 'disconnected';
    }
  
    // 🆕 Đóng peer connection
    closePeerConnection(userId) {
      const pc = this.peerConnections.get(userId);
      if (pc) {
        pc.close();
        this.peerConnections.delete(userId);
        this.remoteStreams.delete(userId);
        console.log('🔒 Closed peer connection for:', userId);
      }
    }
  
    // 🆕 Cleanup tất cả
    cleanup() {
      this.peerConnections.forEach((pc, userId) => {
        pc.close();
      });
      this.peerConnections.clear();
      this.remoteStreams.clear();
      
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      console.log('🧹 WebRTC service cleaned up');
    }
  
    // 🆕 Debug: Log tất cả ICE servers
    logIceServers() {
      console.log('🌐 Current ICE Servers:', this.config.iceServers);
    }
  
    // 🆕 Event handlers
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