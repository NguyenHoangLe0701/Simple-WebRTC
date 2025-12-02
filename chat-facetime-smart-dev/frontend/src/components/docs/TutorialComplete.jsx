import React from "react";
import { CheckCircle } from "lucide-react";

function TutorialComplete() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-3xl font-bold mb-4">Chúc mừng! Bạn đã hoàn thành khóa học cơ bản</h1>
          <p className="text-lg text-gray-600">
            Bạn đã học được những kiến thức cơ bản về WebRTC và SimpleWebRTC
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tổng kết những gì bạn đã học:</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>✅ Cài đặt và thiết lập môi trường SimpleWebRTC</li>
            <li>✅ Thiết lập Redux Store và Provider</li>
            <li>✅ Xử lý các trạng thái kết nối (Connecting, Connected, Disconnected)</li>
            <li>✅ Yêu cầu quyền truy cập Media (Camera/Microphone)</li>
            <li>✅ Tham gia vào Room và hiển thị video của peers</li>
            <li>✅ Điều khiển Media (Bật/Tắt Camera, Microphone)</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Ví dụ hoàn chỉnh</h2>
        <p className="mb-4">
          Dưới đây là một ví dụ hoàn chỉnh kết hợp tất cả những gì bạn đã học:
        </p>

        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { Provider } from 'react-redux';
import React from 'react';
import * as SWRTC from '@andyet/simplewebrtc';

const API_KEY = 'YOUR_PUBLISHABLE_API_KEY';
const CONFIG_URL = \`https://api.simplewebrtc.com/config/guest/\${API_KEY}\`;
const ROOM_NAME = 'my-room';

function VideoCallApp() {
  const store = SWRTC.createStore();
  
  return (
    <Provider store={store}>
      <SWRTC.Provider configUrl={CONFIG_URL}>
        <SWRTC.Connecting>
          <div className="text-center p-8">
            <h2>Đang kết nối...</h2>
          </div>
        </SWRTC.Connecting>

        <SWRTC.Connected>
          <h1>Đã kết nối!</h1>
          
          {/* Yêu cầu media */}
          <SWRTC.RequestUserMedia audio video auto />
          
          {/* Phát audio từ remote peers */}
          <SWRTC.RemoteAudioPlayer />
          
          {/* Tham gia room */}
          <SWRTC.Room name={ROOM_NAME}>
            {({ room, peers }) => (
              <div>
                <h2>Room: {room.name}</h2>
                <p>Số người tham gia: {peers.length + 1}</p>
                
                {/* Video của bạn */}
                <div className="local-video">
                  <SWRTC.LocalVideo />
                </div>
                
                {/* Video của peers */}
                <div className="peers-grid">
                  {peers.map(peer => (
                    <div key={peer.id}>
                      <SWRTC.RemoteVideo peer={peer} />
                    </div>
                  ))}
                </div>
                
                {/* Điều khiển */}
                <div className="controls">
                  <SWRTC.MuteButton>
                    {({ mute, toggleMute }) => (
                      <button onClick={toggleMute}>
                        {mute ? '🔇' : '🎤'}
                      </button>
                    )}
                  </SWRTC.MuteButton>
                  
                  <SWRTC.VideoButton>
                    {({ videoEnabled, toggleVideo }) => (
                      <button onClick={toggleVideo}>
                        {videoEnabled ? '📹' : '📷'}
                      </button>
                    )}
                  </SWRTC.VideoButton>
                </div>
              </div>
            )}
          </SWRTC.Room>
        </SWRTC.Connected>
      </SWRTC.Provider>
    </Provider>
  );
}

export default VideoCallApp;`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">Bước tiếp theo</h2>
        <div className="bg-gray-50 p-6 rounded-md mb-6">
          <ul className="list-disc pl-6 space-y-2">
            <li>Khám phá thêm các tính năng nâng cao trong phần <strong>User Data Integration</strong></li>
            <li>Tìm hiểu về <strong>Server-Side HTTP API</strong> để quản lý rooms từ backend</li>
            <li>Xem các <strong>Redux Actions</strong> và <strong>Redux Store</strong> để tùy chỉnh ứng dụng</li>
            <li>Tham khảo <strong>Components</strong> documentation để tìm các component hữu ích khác</li>
          </ul>
        </div>

        <div className="text-center">
          <a
            href="https://github.com/andyet/simplewebrtc-talky-sample-app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Xem Sample App trên GitHub
          </a>
        </div>
      </article>
    </section>
  );
}

export default TutorialComplete;

