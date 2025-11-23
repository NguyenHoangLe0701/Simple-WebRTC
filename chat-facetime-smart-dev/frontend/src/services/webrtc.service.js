// File: WebRTCService.js

class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.remoteStreams = new Map();
    this.localStream = null;
    this.roomId = null;
    
    // 🔥 FIX: Queue để lưu ICE candidates và answers đến trước khi peer connection sẵn sàng
    this.pendingIceCandidates = new Map(); // Map<userId, candidate[]>
    this.pendingAnswers = new Map(); // Map<userId, answer>
    
    // 🔥 FIX: Track connection timestamps để detect slow connections
    this.connectionStartTimes = new Map(); // Map<userId, timestamp>
    this.CONNECTION_TIMEOUT_MS = 15000; // 15 giây timeout
    
    // ============================================
    // CẤU HÌNH TURN SERVER TỐI ƯU CHO DEMO
    // Sử dụng Metered.ca - Ổn định & Miễn phí
    // ============================================
    
    this.config = {
      iceServers: [
        // 🔥 PRIMARY: Metered.ca TURN (chống lag, ổn định)
        {
          urls: "turn:standard.relay.metered.ca:80",
          username: "cb123ac328807f8b8037b50e",
          credential: "YbrS2Sch00jYJFGn"
        },
        
        // 🔥 SECONDARY: Metered.ca TURN TLS 
        {
          urls: "turn:standard.relay.metered.ca:443",
          username: "cb123ac328807f8b8037b50e",
          credential: "YbrS2Sch00jYJFGn"
        },
        
        // 🔥 BACKUP 1: Twilio STUN (reliable, public, no credentials needed)
        { urls: 'stun:global.stun.twilio.com:3478' },
        
        // 🔥 BACKUP 2: Google STUN servers (multiple for redundancy, public, no credentials)
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        
        // 🔥 BACKUP 3: Mozilla STUN (public, no credentials)
        { urls: 'stun:stun.services.mozilla.com:3478' },
        
        // 🔥 BACKUP 4: Additional public STUN servers for better connectivity
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.voiparound.com' },
        { urls: 'stun:stun.voipbuster.com' }
      ],
      
      // 🔥 Optimization cho ổn định và tốc độ kết nối
      iceTransportPolicy: 'all', // Dùng cả relay và direct (quan trọng cho NAT traversal)
      iceCandidatePoolSize: 10, // Pre-gather ICE candidates để kết nối nhanh hơn
      bundlePolicy: 'max-bundle', // Bundle audio/video để giảm bandwidth
      rtcpMuxPolicy: 'require', // Mux RTCP để giảm số lượng ports cần mở
      
      // 🔥 FIX: Thêm cấu hình để tăng tốc độ kết nối
      sdpSemantics: 'unified-plan', // Sử dụng unified plan (standard)
      continualGatheringPolicy: 'gather_continually' // Tiếp tục gather ICE candidates
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
    // 🔥 FIX: Kiểm tra và trả về connection hiện có nếu đã tồn tại và chưa đóng
    const existingPc = this.peerConnections.get(userId);
    if (existingPc && existingPc.signalingState !== 'closed') {
      return existingPc;
    }
    
    // 🔥 FIX: Nếu connection cũ đã đóng, xóa nó trước
    if (existingPc && existingPc.signalingState === 'closed') {
      this.peerConnections.delete(userId);
    }

    try {
      // 🔥 FIX: Tạo peer connection mới với config riêng cho mỗi user
      // Mỗi user có một peer connection độc lập để hỗ trợ multi-peer
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
          // 🔥 FIX: Retry nhanh hơn (1 giây thay vì 2 giây)
          setTimeout(() => {
            if (pc.connectionState === 'failed' && pc.signalingState !== 'closed') {
              this.restartIce(userId).catch(err => {
                console.error('❌ Error restarting ICE after failure:', err);
              });
            }
          }, 1000);
        } else if (state === 'connected') {
          console.log(`✅ Connection established for ${userId}`);
          // 🔥 FIX: Xóa connection start time khi đã connected
          const startTime = this.connectionStartTimes.get(userId);
          if (startTime) {
            const connectionTime = Date.now() - startTime;
            console.log(`⏱️ Connection time for ${userId}: ${connectionTime}ms`);
            this.connectionStartTimes.delete(userId);
          }
        } else if (state === 'disconnected') {
          console.warn(`⚠️ Connection disconnected for ${userId}`);
          // 🔥 FIX: Tự động reconnect khi disconnected
          setTimeout(() => {
            if (pc.connectionState === 'disconnected' && pc.signalingState !== 'closed') {
              console.log(`🔄 Attempting to reconnect ${userId}...`);
              this.restartIce(userId).catch(err => {
                console.error('❌ Error reconnecting:', err);
              });
            }
          }, 2000);
        } else if (state === 'connecting') {
          console.log(`🔄 Connecting to ${userId}...`);
        }
      };

      // Theo dõi ICE connection state
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log(`🧊 ICE connection state changed for ${userId}:`, state);
        
        if (this.onIceConnectionStateChange) {
          this.onIceConnectionStateChange(userId, state);
        }
        
        if (state === 'connected' || state === 'completed') {
          console.log(`✅ ICE connected for ${userId}`);
        } else if (state === 'failed') {
          console.warn(`⚠️ ICE failed for ${userId}, attempting restart...`);
          // 🔥 FIX: Tự động restart ICE khi failed
          setTimeout(() => {
            if (pc.iceConnectionState === 'failed' && pc.signalingState !== 'closed') {
              this.restartIce(userId).catch(err => {
                console.error('❌ Error restarting ICE:', err);
              });
            }
          }, 1000);
        } else if (state === 'disconnected') {
          console.warn(`⚠️ ICE disconnected for ${userId}`);
          // Thử reconnect sau 2 giây
          setTimeout(() => {
            if (pc.iceConnectionState === 'disconnected' && pc.signalingState !== 'closed') {
              this.restartIce(userId).catch(err => {
                console.error('❌ Error reconnecting ICE:', err);
              });
            }
          }, 2000);
        }
      };
      
      // 🔥 FIX: Theo dõi ICE gathering để log progress
      pc.onicegatheringstatechange = () => {
        const state = pc.iceGatheringState;
        if (state === 'gathering') {
          console.log(`🔍 ICE gathering started for ${userId}`);
        } else if (state === 'complete') {
          console.log(`✅ ICE gathering complete for ${userId}`);
        }
      };

      this.peerConnections.set(userId, pc);
      
      // 🔥 FIX: Monitor connection timeout
      this.monitorConnectionTimeout(userId, pc);
      
      return pc;

    } catch (error) {
      console.error('❌ Error creating peer connection for', userId + ':', error);
      throw error;
    }
  }

  async createOffer(userId) {
    try {
      // 🔥 FIX: Đảm bảo peer connection được tạo và lưu trữ đúng cách
      let pc = this.peerConnections.get(userId);
      
      // 🔥 FIX: Kiểm tra nếu đã có remote offer (offer collision)
      // Nếu đã có remote offer, không tạo offer mới (để tránh conflict)
      if (pc && pc.signalingState === 'have-remote-offer') {
        console.log(`ℹ️ Remote offer already exists for ${userId}, skipping local offer creation`);
        // Đợi answer được tạo từ handleOffer
        return null;
      }
      
      // Nếu đã có peer connection nhưng ở trạng thái không hợp lệ, đóng và tạo lại
      if (pc) {
        const state = pc.signalingState;
        // Chỉ tạo offer nếu ở stable hoặc đã có local offer (có thể là retry)
        if (state !== 'stable' && state !== 'have-local-offer') {
          // Nếu đang ở have-remote-offer, không tạo offer (đã xử lý ở trên)
          if (state === 'have-remote-offer') {
            return null;
          }
          console.warn(`⚠️ Existing peer connection for ${userId} in invalid state: ${state}, recreating...`);
          this.closePeerConnection(userId);
          pc = null;
        }
      }
      
      // Tạo peer connection mới nếu chưa có hoặc đã đóng
      if (!pc || pc.signalingState === 'closed') {
        if (pc && pc.signalingState === 'closed') {
          // Xóa connection cũ trước khi tạo mới
          this.closePeerConnection(userId);
        }
        pc = this.createPeerConnection(userId);
      }
      
      // 🔥 FIX: Đảm bảo peer connection đã được lưu vào Map
      // createPeerConnection đã tự động lưu, nhưng double-check để an toàn
      if (!this.peerConnections.has(userId) || this.peerConnections.get(userId) !== pc) {
        this.peerConnections.set(userId, pc);
      }
      
      // 🔥 FIX: Kiểm tra lại state trước khi tạo offer (có thể đã thay đổi)
      if (pc.signalingState === 'have-remote-offer') {
        console.log(`ℹ️ Remote offer detected for ${userId} during offer creation, skipping`);
        return null;
      }
      
      // 🔥 FIX: Track thời gian bắt đầu kết nối
      this.connectionStartTimes.set(userId, Date.now());
      
      // 🔥 QUAN TRỌNG: Không dùng offerOptions với offerToReceiveAudio/Video
      // Để browser tự động tạo SDP dựa trên tracks đã add
      // Điều này đảm bảo m-lines được tạo đúng thứ tự
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(`✅ Created and set local offer for ${userId}`);
      
      // 🔥 FIX: Xử lý các pending answers và ICE candidates sau khi set local description
      this.processPendingSignals(userId, pc);
      
      // 🔥 FIX: Chờ ICE gathering với timeout ngắn hơn để kết nối nhanh hơn
      // Không cần chờ hoàn toàn complete, chỉ cần có một số candidates là đủ
      if (pc.iceGatheringState !== 'complete') {
        // Chờ tối đa 3 giây thay vì 5 giây để kết nối nhanh hơn
        await this.waitForIceGathering(pc, userId, 3000);
      }
      
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error creating offer for', userId + ':', error);
      throw error;
    }
  }

  async waitForIceGathering(pc, userId, timeout = 3000) {
    return new Promise((resolve, reject) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      // 🔥 FIX: Resolve sớm nếu đã có candidates (không cần chờ complete)
      let hasCandidates = false;
      const checkCandidates = () => {
        if (pc.localDescription && pc.localDescription.sdp) {
          // Kiểm tra xem đã có ít nhất 1 candidate trong SDP chưa
          const candidateCount = (pc.localDescription.sdp.match(/a=candidate:/g) || []).length;
          if (candidateCount > 0 && !hasCandidates) {
            hasCandidates = true;
            // Nếu đã có candidates, có thể resolve sớm (sau 500ms) để kết nối nhanh hơn
            setTimeout(() => {
              if (pc.iceGatheringState !== 'complete') {
                console.log(`⚡ Early resolve for ${userId} - ${candidateCount} candidates found`);
                clearTimeout(timeoutId);
                resolve();
              }
            }, 500);
          }
        }
      };

      const timeoutId = setTimeout(() => {
        resolve(); // Timeout - vẫn resolve để không block
        console.log(`⏱️ ICE gathering timeout for ${userId}, proceeding with available candidates`);
      }, timeout);

      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeoutId);
          resolve();
        } else {
          checkCandidates();
        }
      };

      // Kiểm tra candidates ngay lập tức
      checkCandidates();
      
      // Theo dõi state changes
      pc.addEventListener('icegatheringstatechange', checkState);
      
      // Theo dõi khi có candidates mới
      pc.addEventListener('icecandidate', checkCandidates);
    });
  }

  // 🔥 FIX: Xử lý các pending ICE candidates
  async processPendingIceCandidates(userId, pc) {
    const pendingCandidates = this.pendingIceCandidates.get(userId);
    if (!pendingCandidates || pendingCandidates.length === 0) {
      return;
    }

    console.log(`🔄 Processing ${pendingCandidates.length} pending ICE candidates for ${userId}`);
    
    const validStates = ['stable', 'have-local-offer', 'have-remote-offer', 'have-local-answer', 'have-remote-answer'];
    
    for (const candidate of pendingCandidates) {
      try {
        if (validStates.includes(pc.signalingState)) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        if (error.name !== 'OperationError' && error.name !== 'InvalidStateError') {
          console.warn('⚠️ Error processing pending ICE candidate:', error);
        }
      }
    }
    
    // Xóa queue sau khi xử lý
    this.pendingIceCandidates.delete(userId);
  }

  // 🔥 FIX: Xử lý các pending signals (answers và ICE candidates)
  async processPendingSignals(userId, pc) {
    // Xử lý pending answer nếu có
    const pendingAnswer = this.pendingAnswers.get(userId);
    if (pendingAnswer && pc.signalingState === 'have-local-offer') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingAnswer));
        console.log('✅ Processed pending answer for:', userId);
        this.pendingAnswers.delete(userId);
        
        // Sau khi set answer, xử lý pending ICE candidates
        await this.processPendingIceCandidates(userId, pc);
      } catch (error) {
        console.warn('⚠️ Error processing pending answer:', error);
      }
    }
    
    // Xử lý pending ICE candidates nếu đã có remote description
    const validStates = ['have-local-offer', 'have-remote-offer', 'have-local-answer', 'have-remote-answer'];
    if (validStates.includes(pc.signalingState)) {
      await this.processPendingIceCandidates(userId, pc);
    }
  }

  async handleOffer(userId, offer) {
    try {
      let pc = this.peerConnections.get(userId);
      const currentState = pc?.signalingState;
      
      // 🔥 FIX: Xử lý offer collision - khi cả 2 users cùng tạo offer
      // Nếu đã có local offer (have-local-offer), rollback và xử lý remote offer
      if (currentState === 'have-local-offer') {
        console.log(`🔄 Offer collision detected for ${userId} - rolling back local offer and accepting remote offer`);
        // Đóng connection cũ và tạo mới để xử lý remote offer
        this.closePeerConnection(userId);
        pc = this.createPeerConnection(userId);
      }
      
      // Nếu peer connection đã tồn tại, kiểm tra state
      if (pc) {
        // Nếu đã ở trạng thái have-remote-offer hoặc have-local-answer, đóng và tạo mới
        if (pc.signalingState === 'have-remote-offer' || pc.signalingState === 'have-local-answer') {
          console.warn(`⚠️ Connection for ${userId} in invalid state ${pc.signalingState}, recreating...`);
          this.closePeerConnection(userId);
          pc = this.createPeerConnection(userId);
        } else if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
          // Nếu không ở trạng thái phù hợp, tạo mới
          console.warn(`⚠️ Connection for ${userId} in unexpected state ${pc.signalingState}, recreating...`);
          this.closePeerConnection(userId);
          pc = this.createPeerConnection(userId);
        }
      } else {
        pc = this.createPeerConnection(userId);
      }
      
      // 🔥 FIX: Chỉ set remote description nếu đang ở trạng thái stable
      // Nếu đã có local offer, đã được xử lý ở trên (rollback)
      if (pc.signalingState === 'stable') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          console.log(`✅ Set remote offer for ${userId}`);
        } catch (setError) {
          // Nếu lỗi khi set remote description, đóng và tạo lại
          if (setError.name === 'InvalidAccessError' || setError.name === 'InvalidStateError') {
            console.warn('⚠️ Error setting remote description - recreating connection');
            this.closePeerConnection(userId);
            return null;
          }
          throw setError;
        }
      } else if (pc.signalingState === 'have-local-offer') {
        // Nếu vẫn còn local offer (chưa rollback được), bỏ qua
        console.warn(`⚠️ Cannot handle offer for ${userId} - still have local offer, skipping`);
        return null;
      } else {
        // Trạng thái khác, bỏ qua
        console.warn(`⚠️ Cannot handle offer for ${userId} - invalid state: ${pc.signalingState}`);
        return null;
      }
      
      // 🔥 QUAN TRỌNG: Không dùng options khi tạo answer
      // Browser sẽ tự động match m-lines với offer
      // Điều này đảm bảo thứ tự m-lines khớp với offer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log(`✅ Created and set local answer for ${userId}`);
      
      // 🔥 FIX: Xử lý các pending ICE candidates sau khi set local description
      await this.processPendingIceCandidates(userId, pc);
      
      return pc.localDescription;
      
    } catch (error) {
      // Nếu lỗi là InvalidStateError, có thể do race condition, bỏ qua
      if (error.name === 'InvalidStateError') {
        console.warn(`⚠️ InvalidStateError handling offer for ${userId}, likely race condition`);
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
      // 🔥 FIX: Validate answer trước khi xử lý
      if (!answer || !answer.type || answer.type !== 'answer') {
        console.error('❌ Invalid answer format for:', userId, answer);
        return;
      }

      let pc = this.peerConnections.get(userId);
      
      if (!pc) {
        // 🔥 FIX: Nếu không có peer connection, lưu answer vào queue để xử lý sau
        console.warn('⚠️ No peer connection for answer from:', userId, '- queuing answer');
        this.pendingAnswers.set(userId, answer);
        
        // Thử tạo peer connection nếu có local stream (có thể offer đang được tạo)
        if (this.localStream) {
          console.log('🔄 Attempting to create peer connection for pending answer:', userId);
          // Không tạo offer ở đây, chỉ đợi offer được tạo từ phía kia
        }
        return;
      }

      // 🔥 FIX: Kiểm tra state chi tiết hơn
      const currentState = pc.signalingState;
      console.log(`🔍 Current signaling state for ${userId}:`, currentState);
      
      if (currentState === 'stable') {
        // 🔥 FIX: Nếu ở stable, kiểm tra xem có local description không
        if (!pc.localDescription) {
          console.warn('⚠️ Answer received but no local offer set for:', userId, '- queuing answer');
          // Lưu answer vào queue để xử lý sau khi offer được tạo
          this.pendingAnswers.set(userId, answer);
          return;
        }
        
        // 🔥 FIX: Nếu đã có local description nhưng state là stable
        // Có thể là answer đến muộn sau khi đã xử lý xong
        // Hoặc có thể là answer cho một offer khác (offer collision resolution)
        // Kiểm tra xem answer này có match với local offer không
        const localOfferSdp = pc.localDescription.sdp;
        const answerSdp = answer.sdp;
        
        // Nếu answer có fingerprint khác với offer, có thể là answer cũ
        const localFingerprint = localOfferSdp.match(/a=fingerprint:(\w+)/)?.[1];
        const answerFingerprint = answerSdp.match(/a=fingerprint:(\w+)/)?.[1];
        
        if (localFingerprint && answerFingerprint && localFingerprint !== answerFingerprint) {
          console.warn('⚠️ Answer fingerprint mismatch for:', userId, '- likely stale answer, ignoring');
          return;
        }
        
        // Nếu match, có thể answer đến muộn nhưng vẫn hợp lệ
        // Thử set remote description nếu có thể
        try {
          // Kiểm tra xem có remote description chưa
          if (!pc.remoteDescription) {
            console.log('🔄 Answer received in stable state but no remote description - attempting to set');
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('✅ Successfully set late answer for:', userId);
            await this.processPendingIceCandidates(userId, pc);
            return;
          } else {
            // Đã có remote description, answer này có thể là duplicate
            console.warn('⚠️ Answer received in stable state with existing remote description - likely duplicate, ignoring');
            return;
          }
        } catch (error) {
          if (error.name === 'InvalidStateError') {
            console.warn('⚠️ Cannot set answer in stable state - likely already processed');
            return;
          }
          throw error;
        }
      }
      
      if (currentState !== 'have-local-offer') {
        // 🔥 FIX: Nếu không ở trạng thái đúng, lưu vào queue
        console.warn('⚠️ Answer received in wrong state for:', userId, '- state:', currentState, '- queuing answer');
        this.pendingAnswers.set(userId, answer);
        return;
      }

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Successfully set remote answer for:', userId);
      
      // 🔥 FIX: Xử lý các pending ICE candidates sau khi set remote description
      this.processPendingIceCandidates(userId, pc);
      
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
        const pc = this.peerConnections.get(userId);
        const currentState = pc?.signalingState;
        console.warn(`⚠️ InvalidStateError when handling answer for ${userId} - current state:`, currentState);
        
        // Nếu đã ở stable, bỏ qua (có thể đã được xử lý)
        if (currentState === 'stable' || currentState === 'have-remote-answer') {
          console.log('ℹ️ Answer already processed, ignoring');
          return;
        }
        
        // Nếu ở trạng thái khác, lưu vào queue
        if (currentState === 'have-local-answer') {
          console.warn('⚠️ Duplicate answer detected, ignoring');
          return;
        }
        
        // Lưu vào queue để xử lý sau
        this.pendingAnswers.set(userId, answer);
        return;
      }
      
      console.error('❌ Error handling answer from', userId + ':', error);
      // Không throw error để tránh crash, chỉ log
    }
  }

  async handleIceCandidate(userId, candidate) {
    try {
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
      
      const pc = this.peerConnections.get(userId);
      if (!pc) {
        // 🔥 FIX: Nếu không có peer connection, lưu candidate vào queue
        console.warn('⚠️ No peer connection for ICE candidate from:', userId, '- queuing candidate');
        if (!this.pendingIceCandidates.has(userId)) {
          this.pendingIceCandidates.set(userId, []);
        }
        this.pendingIceCandidates.get(userId).push(candidate);
        return;
      }
      
      // 🔥 FIX: Chỉ add candidate khi ở trạng thái hợp lệ
      const validStates = ['stable', 'have-local-offer', 'have-remote-offer', 'have-local-answer', 'have-remote-answer'];
      if (!validStates.includes(pc.signalingState)) {
        // Lưu vào queue để xử lý sau
        console.warn('⚠️ Cannot add ICE candidate - invalid signaling state:', pc.signalingState, '- queuing candidate');
        if (!this.pendingIceCandidates.has(userId)) {
          this.pendingIceCandidates.set(userId, []);
        }
        this.pendingIceCandidates.get(userId).push(candidate);
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
        // Connection đã đóng hoặc state không hợp lệ - lưu vào queue
        const pc = this.peerConnections.get(userId);
        if (pc && pc.signalingState !== 'closed') {
          if (!this.pendingIceCandidates.has(userId)) {
            this.pendingIceCandidates.set(userId, []);
          }
          this.pendingIceCandidates.get(userId).push(candidate);
        }
        return;
      }
      console.error('❌ Error adding ICE candidate for', userId + ':', error);
    }
  }

  async restartIce(userId) {
    try {
      const pc = this.peerConnections.get(userId);
      if (!pc) {
        console.warn(`⚠️ Cannot restart ICE - no peer connection for ${userId}`);
        return null;
      }
      
      // 🔥 FIX: Kiểm tra state trước khi restart
      if (pc.signalingState === 'closed') {
        console.warn(`⚠️ Cannot restart ICE - connection closed for ${userId}`);
        return null;
      }
      
      console.log(`🔄 Restarting ICE for ${userId}...`);
      
      // 🔥 FIX: Tạo offer với iceRestart để force renegotiation
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      
      // 🔥 FIX: Chờ một chút để ICE gathering bắt đầu
      await this.waitForIceGathering(pc, userId, 2000);
      
      console.log(`✅ ICE restart completed for ${userId}`);
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error restarting ICE for', userId + ':', error);
      // 🔥 FIX: Nếu restart thất bại, thử tạo lại connection
      if (error.name === 'InvalidStateError' || error.name === 'InvalidAccessError') {
        console.warn(`⚠️ ICE restart failed, attempting to recreate connection for ${userId}`);
        this.closePeerConnection(userId);
        // Component sẽ tự động tạo lại offer khi phát hiện connection bị đóng
      }
      return null;
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
      // 🔥 FIX: Clear tất cả timeouts trước khi đóng
      if (pc._timeoutIds) {
        pc._timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
        pc._timeoutIds = [];
      }
      
      // Cleanup event handlers
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      
      pc.close();
      this.peerConnections.delete(userId);
      this.remoteStreams.delete(userId);
    }
    
    // 🔥 FIX: Xóa các pending signals khi đóng connection
    this.pendingIceCandidates.delete(userId);
    this.pendingAnswers.delete(userId);
    this.connectionStartTimes.delete(userId);
  }
  
  // 🔥 FIX: Monitor connection timeout để detect slow connections
  monitorConnectionTimeout(userId, pc) {
    const startTime = this.connectionStartTimes.get(userId);
    if (!startTime) return;
    
    const timeoutId = setTimeout(() => {
      // Kiểm tra lại xem connection vẫn còn tồn tại không
      const currentPc = this.peerConnections.get(userId);
      if (!currentPc || currentPc !== pc) {
        return; // Connection đã bị thay thế hoặc đóng
      }
      
      const currentState = pc.connectionState;
      const iceState = pc.iceConnectionState;
      
      // Nếu vẫn chưa connected sau timeout
      if (currentState !== 'connected' && currentState !== 'closed') {
        const elapsed = Date.now() - startTime;
        console.warn(`⏱️ Connection timeout warning for ${userId} after ${elapsed}ms`);
        console.warn(`   Connection state: ${currentState}, ICE state: ${iceState}`);
        
        // Nếu đang ở trạng thái connecting quá lâu, thử restart ICE
        if (currentState === 'connecting' && iceState !== 'connected' && iceState !== 'completed') {
          console.log(`🔄 Attempting ICE restart due to slow connection for ${userId}`);
          this.restartIce(userId).catch(err => {
            console.error('❌ Error restarting ICE on timeout:', err);
          });
        }
      }
    }, this.CONNECTION_TIMEOUT_MS);
    
    // 🔥 FIX: Lưu timeout ID vào connection để có thể clear sau
    if (!pc._timeoutIds) {
      pc._timeoutIds = [];
    }
    pc._timeoutIds.push(timeoutId);
    
    // Clear timeout khi connection thành công (sẽ được gọi trong onconnectionstatechange)
    const checkAndClear = () => {
      if (pc.connectionState === 'connected' || pc.connectionState === 'closed') {
        clearTimeout(timeoutId);
        if (pc._timeoutIds) {
          const index = pc._timeoutIds.indexOf(timeoutId);
          if (index > -1) {
            pc._timeoutIds.splice(index, 1);
          }
        }
      }
    };
    
    // Thêm listener để clear timeout
    pc.addEventListener('connectionstatechange', checkAndClear);
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
    
    // 🔥 FIX: Xóa tất cả pending signals
    this.pendingIceCandidates.clear();
    this.pendingAnswers.clear();
    
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