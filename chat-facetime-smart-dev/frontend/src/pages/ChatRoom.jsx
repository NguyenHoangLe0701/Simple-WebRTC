import { useEffect, useState } from "react";
import { connectSock, subscribeToChat, sendChat } from "../services/socket";

export default function ChatRoom({roomId}) {
  const [messages,setMessages]=useState([]);
  useEffect(()=> {
    connectSock((client) => {
      subscribeToChat(roomId, (payload) => {
        setMessages(prev => [...prev, payload]);
      });
    });
  }, [roomId]);

  function send(text) {
    sendChat(roomId, {sender: "me", content: text, timestamp: Date.now()});
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        {messages.map((m,i)=> <div key={i} className="mb-2"><b>{m.sender}</b>: {m.content}</div>)}
      </div>
      <ChatInput onSend={send} />
    </div>
  );
}

function ChatInput({onSend}) {
  const [t,setT]=useState("");
  return (
    <div className="p-2">
      <input value={t} onChange={e=>setT(e.target.value)} className="w-4/5 p-2 border"/>
      <button onClick={()=>{onSend(t); setT("");}} className="ml-2 p-2 bg-purple-600 text-white rounded">Send</button>
    </div>
  );
}
