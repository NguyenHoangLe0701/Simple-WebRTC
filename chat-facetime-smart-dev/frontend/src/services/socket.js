import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client = null;
export function connectSock(onConnect) {
  client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    debug: (str) => console.log("STOMP:", str),
    reconnectDelay: 5000,
    onConnect: frame => onConnect(client),
  });
  client.activate();
  return client;
}

export function subscribeToChat(roomId, handler) {
  client?.subscribe(`/topic/chat/${roomId}`, (msg) => {
    handler(JSON.parse(msg.body));
  });
}

export function sendChat(roomId, payload) {
  client.publish({ destination: `/app/chat/${roomId}`, body: JSON.stringify(payload) });
}

export function sendSignal(roomId, payload) {
  client.publish({ destination: `/app/signal/${roomId}`, body: JSON.stringify(payload) });
}
