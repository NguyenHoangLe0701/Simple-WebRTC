import React from "react";

function TutorialStep6() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Học WebRTC Cơ Bản</h1>

        <h2 className="text-2xl font-semibold mb-4">
          6. Điều khiển Media (Bật/Tắt Camera, Microphone)
        </h2>

        <p className="mb-4">
          Bạn có thể điều khiển camera và microphone của mình trong quá trình video call.
        </p>

        <h3 className="text-xl font-semibold mb-3">Bước 6.1: Sử dụng Redux Actions để điều khiển Media</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { useDispatch, useSelector } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function MediaControls() {
  const dispatch = useDispatch();
  const localMedia = useSelector(state => state.localMedia);
  
  const toggleVideo = () => {
    if (localMedia && localMedia.video) {
      // Tắt video
      dispatch(SWRTC.actions.setLocalVideoEnabled(false));
    } else {
      // Bật video
      dispatch(SWRTC.actions.setLocalVideoEnabled(true));
    }
  };
  
  const toggleAudio = () => {
    if (localMedia && localMedia.audio) {
      // Tắt audio
      dispatch(SWRTC.actions.setLocalAudioEnabled(false));
    } else {
      // Bật audio
      dispatch(SWRTC.actions.setLocalAudioEnabled(true));
    }
  };
  
  return (
    <div className="media-controls">
      <button onClick={toggleVideo}>
        {localMedia?.video ? 'Tắt Camera' : 'Bật Camera'}
      </button>
      <button onClick={toggleAudio}>
        {localMedia?.audio ? 'Tắt Microphone' : 'Bật Microphone'}
      </button>
    </div>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 6.2: Sử dụng Component để điều khiển</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import * as SWRTC from '@andyet/simplewebrtc';

function VideoCallControls() {
  return (
    <SWRTC.Room name="my-room">
      {({ localMedia }) => (
        <div>
          {/* Hiển thị video của bạn */}
          <SWRTC.LocalVideo />
          
          {/* Nút điều khiển */}
          <div className="controls">
            <SWRTC.MuteButton>
              {({ mute, toggleMute }) => (
                <button onClick={toggleMute}>
                  {mute ? '🔇 Bật Microphone' : '🎤 Tắt Microphone'}
                </button>
              )}
            </SWRTC.MuteButton>
            
            <SWRTC.VideoButton>
              {({ videoEnabled, toggleVideo }) => (
                <button onClick={toggleVideo}>
                  {videoEnabled ? '📹 Tắt Camera' : '📷 Bật Camera'}
                </button>
              )}
            </SWRTC.VideoButton>
          </div>
        </div>
      )}
    </SWRTC.Room>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 6.3: Hiển thị trạng thái Media</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { useSelector } from 'react-redux';

function MediaStatus() {
  const localMedia = useSelector(state => state.localMedia);
  
  return (
    <div className="media-status">
      <div>
        Camera: {localMedia?.video ? '✅ Bật' : '❌ Tắt'}
      </div>
      <div>
        Microphone: {localMedia?.audio ? '✅ Bật' : '❌ Tắt'}
      </div>
    </div>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Các Actions có sẵn:</h3>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>setLocalVideoEnabled(enabled)</strong>: Bật/tắt video</li>
            <li><strong>setLocalAudioEnabled(enabled)</strong>: Bật/tắt audio</li>
            <li><strong>requestUserMedia(&#123;audio, video&#125;)</strong>: Yêu cầu lại media với cấu hình mới</li>
          </ul>
        </div>
      </article>
    </section>
  );
}

export default TutorialStep6;

