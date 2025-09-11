import { useEffect, useRef } from "react";
import { connectSock, sendSignal } from "../services/socket";

export default function VideoCall({roomId}) {
  const localRef = useRef(), remoteRef = useRef(), pcRef = useRef();
  useEffect(()=>{
    let pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
    pcRef.current = pc;
    navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(stream=>{
      localRef.current.srcObject = stream;
      stream.getTracks().forEach(t=>pc.addTrack(t, stream));
    });

    pc.ontrack = e => { remoteRef.current.srcObject = e.streams[0]; };

    connectSock((client) => {
      client.subscribe(`/topic/room/${roomId}`, (m) => {
        const msg = JSON.parse(m.body);
        if(msg.type === "offer"){ pc.setRemoteDescription(msg); pc.createAnswer().then(a=>{ pc.setLocalDescription(a); sendSignal(roomId, a); }); }
        if(msg.type === "answer"){ pc.setRemoteDescription(msg); }
        if(msg.candidate){ pc.addIceCandidate(msg.candidate); }
      });
    });

    pc.onicecandidate = e => {
      if(e.candidate) sendSignal(roomId, {candidate: e.candidate});
    };

    // create offer when user opens
    async function startCall(){
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(roomId, offer);
    }
    // call startCall() on button click in UI
    return ()=> pc.close();
  },[roomId]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <video ref={localRef} autoPlay muted className="w-full"/>
      <video ref={remoteRef} autoPlay className="w-full"/>
    </div>
  );
}
