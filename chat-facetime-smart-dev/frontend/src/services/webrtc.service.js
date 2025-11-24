class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.remoteStreams = new Map();
    this.localStream = null;
    this.roomId = null;
    
    this.pendingIceCandidates = new Map();
    this.pendingAnswers = new Map();
    
    this.connectionStartTimes = new Map();
    this.CONNECTION_TIMEOUT_MS = 15000;
    
    this.pendingOffers = new Map();
    
    this.config = {
      iceServers: [
        {
          urls: [
            "turn:standard.relay.metered.ca:80",
            "turn:standard.relay.metered.ca:443",
            "turns:standard.relay.metered.ca:443?transport=tcp"
          ],
          username: "cb123ac328807f8b8037b50e",
          credential: "YbrS2Sch00jYJFGn"
        },
        
        { urls: 'stun:global.stun.twilio.com:3478' },
        
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        
        { urls: 'stun:stun.services.mozilla.com:3478' },
        
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.voiparound.com' },
        { urls: 'stun:stun.voipbuster.com' },
        { urls: 'stun:stun.ekiga.net' },
        { urls: 'stun:stun.fwdnet.net' }
      ],
      
      iceTransportPolicy: 'all',
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      
      sdpSemantics: 'unified-plan',
      continualGatheringPolicy: 'gather_continually'
    };

    this.onRemoteStream = null;
    this.onIceCandidate = null;
    this.onConnectionStateChange = null;
    this.onIceConnectionStateChange = null;
    this.onIceRestartOffer = null;
  }

  setRoomId(roomId) {
    this.roomId = roomId;
  }

  setLocalStream(stream) {
    this.localStream = stream;
  }

  createPeerConnection(userId) {
    const existingPc = this.peerConnections.get(userId);
    if (existingPc && existingPc.signalingState !== 'closed') {
      return existingPc;
    }
    
    if (existingPc && existingPc.signalingState === 'closed') {
      this.peerConnections.delete(userId);
    }

    try {
      const pc = new RTCPeerConnection(this.config);

      if (this.localStream) {
        const audioTracks = this.localStream.getAudioTracks();
        const videoTracks = this.localStream.getVideoTracks();
        
        audioTracks.forEach(track => {
          try {
            if (!track.enabled) {
              console.log(`🔊 Enabling local audio track for ${userId}`);
              track.enabled = true;
            }
            pc.addTrack(track, this.localStream);
            console.log(`✅ Added audio track for ${userId}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
          } catch (error) {
            console.error('❌ Error adding audio track:', error);
          }
        });
        
        videoTracks.forEach(track => {
          try {
            pc.addTrack(track, this.localStream);
          } catch (error) {
            console.error('❌ Error adding video track:', error);
          }
        });
      }

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          const audioTracks = remoteStream.getAudioTracks();
          audioTracks.forEach(track => {
            if (!track.enabled) {
              console.log(`🔊 Enabling audio track for ${userId}`);
              track.enabled = true;
            }
          });
          
          console.log('📹 Received remote stream from:', userId, {
            audioTracks: audioTracks.length,
            videoTracks: remoteStream.getVideoTracks().length,
            audioEnabled: audioTracks.every(t => t.enabled),
            audioReadyState: audioTracks.map(t => t.readyState)
          });
          
          this.remoteStreams.set(userId, remoteStream);
          
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
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`🔗 Connection state changed for ${userId}:`, state);
        
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(userId, state);
        }
        
        if (state === 'failed') {
          console.warn(`⚠️ Connection failed for ${userId}, attempting ICE restart...`);
          setTimeout(() => {
            if (pc.connectionState === 'failed' && pc.signalingState !== 'closed') {
              this.restartIce(userId).catch(err => {
                console.error('❌ Error restarting ICE after failure:', err);
              });
            }
          }, 1000);
        } else if (state === 'connected') {
          console.log(`✅ Connection established for ${userId}`);
          const startTime = this.connectionStartTimes.get(userId);
          if (startTime) {
            const connectionTime = Date.now() - startTime;
            console.log(`⏱️ Connection time for ${userId}: ${connectionTime}ms`);
            this.connectionStartTimes.delete(userId);
          }
        } else if (state === 'disconnected') {
          console.warn(`⚠️ Connection disconnected for ${userId}`);
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
          setTimeout(() => {
            if (pc.iceConnectionState === 'failed' && pc.signalingState !== 'closed') {
              this.restartIce(userId).catch(err => {
                console.error('❌ Error restarting ICE:', err);
              });
            }
          }, 1000);
        } else if (state === 'disconnected') {
          console.warn(`⚠️ ICE disconnected for ${userId}`);
          setTimeout(() => {
            if (pc.iceConnectionState === 'disconnected' && pc.signalingState !== 'closed') {
              this.restartIce(userId).catch(err => {
                console.error('❌ Error reconnecting ICE:', err);
              });
            }
          }, 2000);
        }
      };
      
      pc.onicegatheringstatechange = () => {
        const state = pc.iceGatheringState;
        if (state === 'gathering') {
          console.log(`🔍 ICE gathering started for ${userId}`);
        } else if (state === 'complete') {
          console.log(`✅ ICE gathering complete for ${userId}`);
        }
      };

      this.peerConnections.set(userId, pc);
      
      this.monitorConnectionTimeout(userId, pc);
      
      return pc;

    } catch (error) {
      console.error('❌ Error creating peer connection for', userId + ':', error);
      throw error;
    }
  }

  async createOffer(userId) {
    if (this.pendingOffers.has(userId)) {
      console.log(`ℹ️ Offer already being created for ${userId}, waiting...`);
      try {
        return await this.pendingOffers.get(userId);
      } catch (error) {
        this.pendingOffers.delete(userId);
      }
    }
    
    const offerPromise = (async () => {
      try {
        let pc = this.peerConnections.get(userId);
        
        if (pc && pc.signalingState === 'have-remote-offer') {
          console.log(`ℹ️ Remote offer already exists for ${userId}, skipping local offer creation`);
          return null;
        }
        
        if (pc) {
          const state = pc.signalingState;
          if (state !== 'stable' && state !== 'have-local-offer') {
            if (state === 'have-remote-offer') {
              return null;
            }
            console.warn(`⚠️ Existing peer connection for ${userId} in invalid state: ${state}, recreating...`);
            this.closePeerConnection(userId);
            pc = null;
          }
        }
        
        if (!pc || pc.signalingState === 'closed') {
          if (pc && pc.signalingState === 'closed') {
            this.closePeerConnection(userId);
          }
          pc = this.createPeerConnection(userId);
        }
        
        if (!this.peerConnections.has(userId) || this.peerConnections.get(userId) !== pc) {
          this.peerConnections.set(userId, pc);
          console.log(`💾 Peer connection saved for ${userId} before creating offer`);
        }
        
        if (pc.signalingState === 'have-remote-offer') {
          console.log(`ℹ️ Remote offer detected for ${userId} during offer creation, skipping`);
          return null;
        }
        
        this.connectionStartTimes.set(userId, Date.now());
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log(`✅ Created and set local offer for ${userId}`);
        
        if (!this.peerConnections.has(userId) || this.peerConnections.get(userId) !== pc) {
          console.warn(`⚠️ Peer connection lost for ${userId} after setting local description, restoring...`);
          this.peerConnections.set(userId, pc);
        }
        
        this.processPendingSignals(userId, pc);
        
        if (pc.iceGatheringState !== 'complete') {
          await this.waitForIceGathering(pc, userId, 3000);
        }
        
        if (!this.peerConnections.has(userId)) {
          console.warn(`⚠️ Peer connection lost for ${userId} after ICE gathering, restoring...`);
          this.peerConnections.set(userId, pc);
        }
        
        return pc.localDescription;
        
      } catch (error) {
        console.error('❌ Error creating offer for', userId + ':', error);
        throw error;
      } finally {
        this.pendingOffers.delete(userId);
      }
    })();
    
    this.pendingOffers.set(userId, offerPromise);
    
    return await offerPromise;
  }

  async waitForIceGathering(pc, userId, timeout = 3000) {
    return new Promise((resolve, reject) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      let hasCandidates = false;
      const checkCandidates = () => {
        if (pc.localDescription && pc.localDescription.sdp) {
          const candidateCount = (pc.localDescription.sdp.match(/a=candidate:/g) || []).length;
          if (candidateCount > 0 && !hasCandidates) {
            hasCandidates = true;
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
        resolve();
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

      checkCandidates();
      
      pc.addEventListener('icegatheringstatechange', checkState);
      
      pc.addEventListener('icecandidate', checkCandidates);
    });
  }

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
    
    this.pendingIceCandidates.delete(userId);
  }

  async processPendingSignals(userId, pc) {
    const pendingAnswer = this.pendingAnswers.get(userId);
    if (pendingAnswer && pc.signalingState === 'have-local-offer') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingAnswer));
        console.log('✅ Processed pending answer for:', userId);
        this.pendingAnswers.delete(userId);
        
        await this.processPendingIceCandidates(userId, pc);
      } catch (error) {
        console.warn('⚠️ Error processing pending answer:', error);
      }
    }
    
    const validStates = ['have-local-offer', 'have-remote-offer', 'have-local-answer', 'have-remote-answer'];
    if (validStates.includes(pc.signalingState)) {
      await this.processPendingIceCandidates(userId, pc);
    }
  }

  async handleOffer(userId, offer) {
    try {
      let pc = this.peerConnections.get(userId);
      const currentState = pc?.signalingState;
      
      const isIceRestart = offer.sdp && offer.sdp.includes('ice-ufrag');
      const existingOffer = pc?.localDescription?.sdp;
      const isNewIceRestart = isIceRestart && existingOffer && 
        offer.sdp.match(/ice-ufrag:(\S+)/)?.[1] !== existingOffer.match(/ice-ufrag:(\S+)/)?.[1];
      
      if (isNewIceRestart) {
        console.log(`🔄 Received ICE restart offer from ${userId}`);
      }
      
      if (currentState === 'have-local-offer') {
        console.log(`🔄 Offer collision detected for ${userId} - rolling back local offer and accepting remote offer`);
        this.closePeerConnection(userId);
        pc = this.createPeerConnection(userId);
      }
      
      if (pc) {
        if (pc.signalingState === 'have-remote-offer' || pc.signalingState === 'have-local-answer') {
          console.warn(`⚠️ Connection for ${userId} in invalid state ${pc.signalingState}, recreating...`);
          this.closePeerConnection(userId);
          pc = this.createPeerConnection(userId);
        } else if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
          console.warn(`⚠️ Connection for ${userId} in unexpected state ${pc.signalingState}, recreating...`);
          this.closePeerConnection(userId);
          pc = this.createPeerConnection(userId);
        }
      } else {
        pc = this.createPeerConnection(userId);
      }
      
      if (pc.signalingState === 'stable') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          console.log(`✅ Set remote offer for ${userId}${isNewIceRestart ? ' (ICE restart)' : ''}`);
        } catch (setError) {
          if (setError.name === 'InvalidAccessError' || setError.name === 'InvalidStateError') {
            console.warn('⚠️ Error setting remote description - recreating connection');
            this.closePeerConnection(userId);
            return null;
          }
          throw setError;
        }
      } else if (pc.signalingState === 'have-local-offer') {
        console.warn(`⚠️ Cannot handle offer for ${userId} - still have local offer, skipping`);
        return null;
      } else {
        console.warn(`⚠️ Cannot handle offer for ${userId} - invalid state: ${pc.signalingState}`);
        return null;
      }
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log(`✅ Created and set local answer for ${userId}${isNewIceRestart ? ' (ICE restart)' : ''}`);
      
      await this.processPendingIceCandidates(userId, pc);
      
      return pc.localDescription;
      
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        console.warn(`⚠️ InvalidStateError handling offer for ${userId}, likely race condition`);
        return null;
      }
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
      if (!answer || !answer.type || answer.type !== 'answer') {
        console.error('❌ Invalid answer format for:', userId, answer);
        return;
      }

      let pc = this.peerConnections.get(userId);
      
      if (!pc) {
        if (this.pendingOffers.has(userId)) {
          console.log(`⏳ Offer being created for ${userId}, waiting for peer connection...`);
          try {
            await this.pendingOffers.get(userId);
            pc = this.peerConnections.get(userId);
            if (pc) {
              console.log(`✅ Peer connection found for ${userId} after waiting for offer`);
            }
          } catch (error) {
            console.warn(`⚠️ Error waiting for offer for ${userId}:`, error);
          }
        }
        
        if (!pc) {
          console.warn('⚠️ No peer connection for answer from:', userId, '- queuing answer');
          this.pendingAnswers.set(userId, answer);
          
          if (this.localStream) {
            console.log('🔄 Attempting to create peer connection for pending answer:', userId);
          }
          return;
        }
      }

      const currentState = pc.signalingState;
      console.log(`🔍 Current signaling state for ${userId}:`, currentState);
      
      if (currentState === 'stable') {
        if (!pc.localDescription) {
          console.warn('⚠️ Answer received but no local offer set for:', userId, '- queuing answer');
          this.pendingAnswers.set(userId, answer);
          return;
        }
        
        const localOfferSdp = pc.localDescription.sdp;
        const answerSdp = answer.sdp;
        
        const localFingerprint = localOfferSdp.match(/a=fingerprint:(\w+)/)?.[1];
        const answerFingerprint = answerSdp.match(/a=fingerprint:(\w+)/)?.[1];
        
        if (localFingerprint && answerFingerprint && localFingerprint !== answerFingerprint) {
          console.warn('⚠️ Answer fingerprint mismatch for:', userId, '- likely stale answer, ignoring');
          return;
        }
        
        try {
          if (!pc.remoteDescription) {
            console.log('🔄 Answer received in stable state but no remote description - attempting to set');
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('✅ Successfully set late answer for:', userId);
            await this.processPendingIceCandidates(userId, pc);
            return;
          } else {
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
        console.warn('⚠️ Answer received in wrong state for:', userId, '- state:', currentState, '- queuing answer');
        this.pendingAnswers.set(userId, answer);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Successfully set remote answer for:', userId);
      
      this.processPendingIceCandidates(userId, pc);
      
    } catch (error) {
      if (error.name === 'InvalidAccessError') {
        console.warn('⚠️ SDP m-lines mismatch for', userId, '- recreating connection');
        this.closePeerConnection(userId);
        
        setTimeout(async () => {
          try {
            const newOffer = await this.createOffer(userId);
            if (this.onIceCandidate) {
            }
          } catch (retryError) {
            console.error('❌ Error recreating offer:', retryError);
          }
        }, 500);
        return;
      }
      
      if (error.name === 'InvalidStateError') {
        const pc = this.peerConnections.get(userId);
        const currentState = pc?.signalingState;
        console.warn(`⚠️ InvalidStateError when handling answer for ${userId} - current state:`, currentState);
        
        if (currentState === 'stable' || currentState === 'have-remote-answer') {
          console.log('ℹ️ Answer already processed, ignoring');
          return;
        }
        
        if (currentState === 'have-local-answer') {
          console.warn('⚠️ Duplicate answer detected, ignoring');
          return;
        }
        
        this.pendingAnswers.set(userId, answer);
        return;
      }
      
      console.error('❌ Error handling answer from', userId + ':', error);
    }
  }

  async handleIceCandidate(userId, candidate) {
    try {
      if (!candidate) {
        console.warn('⚠️ Empty ICE candidate from:', userId);
        return;
      }
      
      if (typeof candidate === 'string') {
        try {
          candidate = JSON.parse(candidate);
        } catch (e) {
          console.warn('⚠️ Invalid ICE candidate format (string):', candidate);
          return;
        }
      }
      
      if (!candidate.candidate && !candidate.sdpMLineIndex && !candidate.sdpMid) {
        console.warn('⚠️ Invalid ICE candidate structure:', candidate);
        return;
      }
      
      let pc = this.peerConnections.get(userId);
      if (!pc) {
        if (this.pendingOffers.has(userId)) {
          try {
            await this.pendingOffers.get(userId);
            pc = this.peerConnections.get(userId);
            if (pc) {
              console.log(`✅ Peer connection found for ${userId} after waiting for offer (ICE candidate)`);
            }
          } catch (error) {
          }
        }
        
        if (!pc) {
          console.warn('⚠️ No peer connection for ICE candidate from:', userId, '- queuing candidate');
          if (!this.pendingIceCandidates.has(userId)) {
            this.pendingIceCandidates.set(userId, []);
          }
          this.pendingIceCandidates.get(userId).push(candidate);
          return;
        }
      }
      
      const validStates = ['stable', 'have-local-offer', 'have-remote-offer', 'have-local-answer', 'have-remote-answer'];
      if (!validStates.includes(pc.signalingState)) {
        console.warn('⚠️ Cannot add ICE candidate - invalid signaling state:', pc.signalingState, '- queuing candidate');
        if (!this.pendingIceCandidates.has(userId)) {
          this.pendingIceCandidates.set(userId, []);
        }
        this.pendingIceCandidates.get(userId).push(candidate);
        return;
      }
      
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      
    } catch (error) {
      if (error.name === 'OperationError') {
        return;
      }
      if (error.name === 'InvalidStateError') {
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
      
      if (pc.signalingState === 'closed') {
        console.warn(`⚠️ Cannot restart ICE - connection closed for ${userId}`);
        return null;
      }
      
      console.log(`🔄 Restarting ICE for ${userId}...`);
      
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      console.log(`✅ Created ICE restart offer for ${userId}`);
      
      if (this.onIceRestartOffer) {
        this.onIceRestartOffer(userId, pc.localDescription);
        console.log(`📤 ICE restart offer sent for ${userId}`);
      } else {
        console.warn(`⚠️ No onIceRestartOffer callback - offer not sent for ${userId}`);
      }
      
      await this.waitForIceGathering(pc, userId, 2000);
      
      console.log(`✅ ICE restart completed for ${userId}`);
      return pc.localDescription;
      
    } catch (error) {
      console.error('❌ Error restarting ICE for', userId + ':', error);
      if (error.name === 'InvalidStateError' || error.name === 'InvalidAccessError') {
        console.warn(`⚠️ ICE restart failed, attempting to recreate connection for ${userId}`);
        this.closePeerConnection(userId);
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

  canSendIceCandidate(userId) {
    const pc = this.peerConnections.get(userId);
    if (!pc) return false;
    
    const validStates = ['stable', 'have-local-offer', 'have-remote-offer'];
    return validStates.includes(pc.signalingState);
  }

  closePeerConnection(userId) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      if (pc._timeoutIds) {
        pc._timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
        pc._timeoutIds = [];
      }
      
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      
      pc.close();
      this.peerConnections.delete(userId);
      this.remoteStreams.delete(userId);
    }
    
    this.pendingIceCandidates.delete(userId);
    this.pendingAnswers.delete(userId);
    this.connectionStartTimes.delete(userId);
    this.pendingOffers.delete(userId);
  }
  
  monitorConnectionTimeout(userId, pc) {
    const startTime = this.connectionStartTimes.get(userId);
    if (!startTime) return;
    
    const timeoutId = setTimeout(() => {
      const currentPc = this.peerConnections.get(userId);
      if (!currentPc || currentPc !== pc) {
        return;
      }
      
      const currentState = pc.connectionState;
      const iceState = pc.iceConnectionState;
      
      if (currentState !== 'connected' && currentState !== 'closed') {
        const elapsed = Date.now() - startTime;
        console.warn(`⏱️ Connection timeout warning for ${userId} after ${elapsed}ms`);
        console.warn(`   Connection state: ${currentState}, ICE state: ${iceState}`);
        
        if (currentState === 'connecting' && iceState !== 'connected' && iceState !== 'completed') {
          console.log(`🔄 Attempting ICE restart due to slow connection for ${userId}`);
          this.restartIce(userId).catch(err => {
            console.error('❌ Error restarting ICE on timeout:', err);
          });
        }
      }
    }, this.CONNECTION_TIMEOUT_MS);
    
    if (!pc._timeoutIds) {
      pc._timeoutIds = [];
    }
    pc._timeoutIds.push(timeoutId);
    
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
    
    pc.addEventListener('connectionstatechange', checkAndClear);
  }

  cleanup() {
    this.peerConnections.forEach((pc, userId) => {
      try {
        pc.close();
      } catch (error) {
      }
    });
    
    this.peerConnections.clear();
    this.remoteStreams.clear();
    
    this.pendingIceCandidates.clear();
    this.pendingAnswers.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
        }
      });
      this.localStream = null;
    }
    
    this.roomId = null;
  }

  logConnectionStats() {
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

  checkTurnServerStatus() {
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

  setOnIceRestartOffer(callback) {
    this.onIceRestartOffer = callback;
  }
}

export default new WebRTCService();