import React from "react";

function ReduxActions() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Redux Actions</h1>

        <p className="mb-6">
          SimpleWebRTC cung cấp các Redux actions để bạn có thể điều khiển và tương tác với WebRTC 
          từ bất kỳ đâu trong ứng dụng React của bạn.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Media Actions</h2>

        <h3 className="text-xl font-semibold mb-3">Bật/Tắt Video</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { useDispatch, useSelector } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function VideoControl() {
  const dispatch = useDispatch();
  const localMedia = useSelector(state => state.localMedia);

  const toggleVideo = () => {
    // Lấy trạng thái hiện tại từ Redux store
    const isEnabled = localMedia?.video;
    
    // Toggle video
    dispatch(SWRTC.actions.setLocalVideoEnabled(!isEnabled));
  };

  return (
    <button onClick={toggleVideo}>
      {localMedia?.video ? 'Tắt Camera' : 'Bật Camera'}
    </button>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bật/Tắt Audio</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { useDispatch, useSelector } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function AudioControl() {
  const dispatch = useDispatch();
  const localMedia = useSelector(state => state.localMedia);

  const toggleAudio = () => {
    const isEnabled = localMedia?.audio;
    
    dispatch(SWRTC.actions.setLocalAudioEnabled(!isEnabled));
  };

  return (
    <button onClick={toggleAudio}>
      {localMedia?.audio ? 'Tắt Microphone' : 'Bật Microphone'}
    </button>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Yêu cầu Media mới</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { useDispatch } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function RequestMedia() {
  const dispatch = useDispatch();

  const requestNewMedia = async () => {
    // Yêu cầu cả audio và video
    await dispatch(SWRTC.actions.requestUserMedia({
      audio: true,
      video: true
    }));
  };

  return <button onClick={requestNewMedia}>Yêu cầu Media</button>;
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">2. Room Actions</h2>

        <h3 className="text-xl font-semibold mb-3">Tham gia Room</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { useDispatch } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function JoinRoom() {
  const dispatch = useDispatch();

  const joinRoom = () => {
    dispatch(SWRTC.actions.joinRoom({
      name: 'my-room',
      password: 'optional-password'
    }));
  };

  return <button onClick={joinRoom}>Tham gia Room</button>;
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Rời khỏi Room</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { useDispatch } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function LeaveRoom() {
  const dispatch = useDispatch();

  const leaveRoom = () => {
    dispatch(SWRTC.actions.leaveRoom());
  };

  return <button onClick={leaveRoom}>Rời khỏi Room</button>;
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">3. Connection Actions</h2>

        <h3 className="text-xl font-semibold mb-3">Kết nối/Ngắt kết nối</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { useDispatch } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function ConnectionControl() {
  const dispatch = useDispatch();

  const connect = () => {
    dispatch(SWRTC.actions.connect());
  };

  const disconnect = () => {
    dispatch(SWRTC.actions.disconnect());
  };

  return (
    <div>
      <button onClick={connect}>Kết nối</button>
      <button onClick={disconnect}>Ngắt kết nối</button>
    </div>
  );
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">4. Danh sách đầy đủ các Actions</h2>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>setLocalVideoEnabled(enabled)</strong>: Bật/tắt video</li>
            <li><strong>setLocalAudioEnabled(enabled)</strong>: Bật/tắt audio</li>
            <li><strong>requestUserMedia(&#123;audio, video&#125;)</strong>: Yêu cầu media mới</li>
            <li><strong>joinRoom(&#123;name, password&#125;)</strong>: Tham gia room</li>
            <li><strong>leaveRoom()</strong>: Rời khỏi room</li>
            <li><strong>connect()</strong>: Kết nối với SimpleWebRTC service</li>
            <li><strong>disconnect()</strong>: Ngắt kết nối</li>
            <li><strong>setRoomName(name)</strong>: Đặt tên room</li>
            <li><strong>setRoomPassword(password)</strong>: Đặt mật khẩu room</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">5. Ví dụ sử dụng kết hợp</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { useDispatch, useSelector } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function VideoCallControls() {
  const dispatch = useDispatch();
  const localMedia = useSelector(state => state.localMedia);
  const room = useSelector(state => state.room);

  const handleJoinCall = async () => {
    // 1. Yêu cầu media
    await dispatch(SWRTC.actions.requestUserMedia({
      audio: true,
      video: true
    }));

    // 2. Tham gia room
    dispatch(SWRTC.actions.joinRoom({
      name: 'video-call-room'
    }));
  };

  const handleLeaveCall = () => {
    // Rời khỏi room
    dispatch(SWRTC.actions.leaveRoom());
  };

  return (
    <div>
      {room.joined ? (
        <button onClick={handleLeaveCall}>Rời khỏi cuộc gọi</button>
      ) : (
        <button onClick={handleJoinCall}>Tham gia cuộc gọi</button>
      )}
    </div>
  );
}`}
          </code>
        </pre>
      </article>
    </section>
  );
}

export default ReduxActions;

