import React from "react";

function CreatingApp() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">SimpleWebRTC Documentation</h1>

        <h2 className="text-2xl font-semibold mb-4">
          Tạo ứng dụng SimpleWebRTC mới
        </h2>

        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import * as SWRTC from '@andyet/simplewebrtc';

// ====================================================================
// THIẾT LẬP QUAN TRỌNG
// ====================================================================
// Thay thế \`YOUR_PUBLISHABLE_API_KEY\` ở đây bằng Publishable API Key
// mà bạn nhận được khi đăng ký SimpleWebRTC
// --------------------------------------------------------------------
const API_KEY = 'YOUR_PUBLISHABLE_API_KEY';
// ====================================================================

const ROOM_NAME = 'YOUR_ROOM_NAME';
const ROOM_PASSWORD = 'YOUR_ROOM_PASSWORD';
const CONFIG_URL = \`https://api.simplewebrtc.com/config/guest/\${API_KEY}\`;

const store = SWRTC.createStore();

ReactDOM.render(
  <Provider store={store}>
    <SWRTC.Provider configUrl={CONFIG_URL}>
      {/* Hiển thị dựa trên trạng thái kết nối */}
      <SWRTC.Connecting>
        <h1>Đang kết nối...</h1>
      </SWRTC.Connecting>

      <SWRTC.Connected>
        <h1>Đã kết nối!</h1>
        {/* Yêu cầu media từ người dùng */}
        <SWRTC.RequestUserMedia audio video auto />

        {/* Bật phát audio từ remote peers */}
        <SWRTC.RemoteAudioPlayer />

        {/* Kết nối vào room với tên và mật khẩu (tùy chọn) */}
        <SWRTC.Room name={ROOM_NAME} password={ROOM_PASSWORD}>
          {props => {
            // Sử dụng các React Components khác của SWRTC để render UI của bạn
          }}
        </SWRTC.Room>
      </SWRTC.Connected>
    </SWRTC.Provider>
  </Provider>,
  document.getElementById('app')
);`}
          </code>
        </pre>

        <p className="mb-6">
          Xem{" "}
          <a
            href="https://github.com/andyet/simplewebrtc-talky-sample-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            SimpleWebRTC Demo App
          </a>{" "}
          để xem thêm các ví dụ.
        </p>

        <h3 className="text-xl font-semibold mb-3">Giải thích từng bước:</h3>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Tạo Redux Store:</strong> <code>SWRTC.createStore()</code> tạo store với tất cả reducers cần thiết</li>
            <li><strong>Wrap với Provider:</strong> Redux Provider và SWRTC.Provider cung cấp context cho toàn bộ ứng dụng</li>
            <li><strong>Xử lý trạng thái kết nối:</strong> Sử dụng Connecting và Connected components để hiển thị UI phù hợp</li>
            <li><strong>Yêu cầu Media:</strong> RequestUserMedia component yêu cầu quyền truy cập camera/microphone</li>
            <li><strong>Phát Audio:</strong> RemoteAudioPlayer tự động phát audio từ các peers khác</li>
            <li><strong>Tham gia Room:</strong> Room component quản lý việc join/leave room và hiển thị peers</li>
          </ol>
        </div>
      </article>
    </section>
  );
}

export default CreatingApp;

