import React from "react";

function ReduxStore() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Redux Store</h1>

        <p className="mb-6">
          SimpleWebRTC sử dụng Redux để quản lý state. Store được tạo tự động và chứa tất cả 
          thông tin về kết nối, media, rooms, và peers.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Tạo Store</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import * as SWRTC from '@andyet/simplewebrtc';

// Tạo store với tất cả reducers và middleware cần thiết
const store = SWRTC.createStore();

// Sử dụng với Redux Provider
import { Provider } from 'react-redux';

function App() {
  return (
    <Provider store={store}>
      <SWRTC.Provider configUrl={CONFIG_URL}>
        {/* App của bạn */}
      </SWRTC.Provider>
    </Provider>
  );
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">2. Cấu trúc State</h2>

        <h3 className="text-xl font-semibold mb-3">Connection State</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`state.connection = {
  status: 'connecting' | 'connected' | 'disconnected' | 'error',
  error: null | Error
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Local Media State</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`state.localMedia = {
  audio: MediaStreamTrack | null,
  video: MediaStreamTrack | null,
  audioEnabled: boolean,
  videoEnabled: boolean
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Room State</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`state.room = {
  name: string | null,
  password: string | null,
  joined: boolean,
  joining: boolean,
  error: null | Error
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Peers State</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`state.peers = {
  [peerId]: {
    id: string,
    userData: object | null,
    audio: MediaStreamTrack | null,
    video: MediaStreamTrack | null,
    audioEnabled: boolean,
    videoEnabled: boolean
  }
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">3. Sử dụng Selectors</h2>

        <h3 className="text-xl font-semibold mb-3">Lấy Connection Status</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { useSelector } from 'react-redux';

function ConnectionStatus() {
  const connection = useSelector(state => state.connection);

  return (
    <div>
      <p>Trạng thái: {connection.status}</p>
      {connection.error && (
        <p className="text-red-500">Lỗi: {connection.error.message}</p>
      )}
    </div>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Lấy Local Media State</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { useSelector } from 'react-redux';

function MediaStatus() {
  const localMedia = useSelector(state => state.localMedia);

  return (
    <div>
      <p>Camera: {localMedia.videoEnabled ? 'Bật' : 'Tắt'}</p>
      <p>Microphone: {localMedia.audioEnabled ? 'Bật' : 'Tắt'}</p>
    </div>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Lấy Room và Peers</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { useSelector } from 'react-redux';

function RoomInfo() {
  const room = useSelector(state => state.room);
  const peers = useSelector(state => state.peers);

  return (
    <div>
      <h2>Room: {room.name}</h2>
      <p>Đã tham gia: {room.joined ? 'Có' : 'Chưa'}</p>
      <p>Số người tham gia: {Object.keys(peers).length + 1}</p>
    </div>
  );
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">4. Custom Selectors</h2>
        <p className="mb-4">Bạn có thể tạo custom selectors để lấy dữ liệu đã được xử lý:</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { useSelector } from 'react-redux';

// Selector để lấy số lượng peers có video
const getPeersWithVideo = (state) => {
  return Object.values(state.peers).filter(peer => peer.videoEnabled).length;
};

// Selector để lấy danh sách peer IDs
const getPeerIds = (state) => {
  return Object.keys(state.peers);
};

function RoomStats() {
  const peersWithVideo = useSelector(getPeersWithVideo);
  const peerIds = useSelector(getPeerIds);

  return (
    <div>
      <p>Peers có video: {peersWithVideo}</p>
      <p>Tổng số peers: {peerIds.length}</p>
    </div>
  );
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">5. Middleware và Enhancers</h2>
        <p className="mb-4">
          Store được tạo với các middleware cần thiết để xử lý WebRTC actions và side effects.
        </p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`// Store đã được cấu hình sẵn với:
// - Redux Thunk (cho async actions)
// - WebRTC middleware (xử lý media streams)
// - Connection middleware (quản lý kết nối)

// Bạn không cần cấu hình thêm gì, chỉ cần sử dụng:
const store = SWRTC.createStore();`}
          </code>
        </pre>
      </article>
    </section>
  );
}

export default ReduxStore;

