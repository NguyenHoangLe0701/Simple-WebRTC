import React from "react";
import { AlertTriangle } from "lucide-react";

function UserDataIntegration() {

  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tích hợp Dữ liệu Người dùng</h1>

        <div id="step-1" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold mb-4">
            1. Tạo JWT đã ký bằng API Secret của bạn
          </h2>
        </div>

        <p className="mb-4">
          Để gửi dữ liệu người dùng tùy chỉnh đến SimpleWebRTC, bạn cần tạo một JWT (JSON Web Token) 
          đã được ký bằng API Secret của bạn trên server backend.
        </p>

        <h3 className="text-xl font-semibold mb-3">Trên server backend của bạn</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`// Trên server backend của bạn
const jwt = require('jsonwebtoken');

const userDataToken = jwt.sign(
  {
    id: 'your-internal-user-id-for-this-user',
    aCustomExampleField: 'you can put whatever in this object'
  },
  YOUR_API_SECRET
);`}
          </code>
        </pre>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-start">
          <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý quan trọng:</strong> API Secret của bạn khác với Publishable API Key, 
              và phải được giữ bí mật. Bạn có thể tìm và quản lý API secrets tại{" "}
              <a
                href="https://accounts.simplewebrtc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-900 underline font-semibold"
              >
                accounts.simplewebrtc.com
              </a>
              .
            </p>
          </div>
        </div>

        <div id="step-2" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold mb-4">
            2. Cấu hình SimpleWebRTC với config URL đúng và user data token
          </h2>
        </div>

        <p className="mb-4">
          Sau khi có user data token, bạn cần truyền nó vào SimpleWebRTC Provider.
        </p>

        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import * as SWRTC from '@andyet/simplewebrtc';

// Lấy userDataToken từ server backend của bạn
const userDataToken = await fetchUserDataToken(); // Hàm này gọi API backend của bạn

<SWRTC.Provider 
  configUrl={CONFIG_URL}
  userDataToken={userDataToken}
>
  {/* Các component của bạn */}
</SWRTC.Provider>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Ví dụ đầy đủ với React</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { Provider } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';
import { useEffect, useState } from 'react';

function App() {
  const [userDataToken, setUserDataToken] = useState(null);
  const store = SWRTC.createStore();

  useEffect(() => {
    // Gọi API backend để lấy user data token
    fetch('/api/user-data-token')
      .then(res => res.json())
      .then(data => setUserDataToken(data.token));
  }, []);

  if (!userDataToken) {
    return <div>Đang tải...</div>;
  }

  return (
    <Provider store={store}>
      <SWRTC.Provider 
        configUrl={CONFIG_URL}
        userDataToken={userDataToken}
      >
        {/* Các component của bạn */}
      </SWRTC.Provider>
    </Provider>
  );
}`}
          </code>
        </pre>

        <div id="step-3" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold mb-4">
            3. Lấy dữ liệu đã cung cấp từ peers
          </h2>
        </div>

        <p className="mb-4">
          Sau khi đã cấu hình user data token, bạn có thể truy cập dữ liệu người dùng từ các peers khác.
        </p>

        <h3 className="text-xl font-semibold mb-3">Sử dụng Redux Selector</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { useSelector } from 'react-redux';

function PeerList() {
  const peers = useSelector(state => state.peers);

  return (
    <div>
      {Object.values(peers).map(peer => (
        <div key={peer.id}>
          <h3>User ID: {peer.userData?.id}</h3>
          <p>Custom Field: {peer.userData?.aCustomExampleField}</p>
        </div>
      ))}
    </div>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Sử dụng Room Component</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`<SWRTC.Room name="my-room">
  {({ peers }) => (
    <div>
      {peers.map(peer => (
        <div key={peer.id}>
          <h3>{peer.userData?.id || peer.id}</h3>
          <p>Dữ liệu tùy chỉnh: {JSON.stringify(peer.userData)}</p>
        </div>
      ))}
    </div>
  )}
</SWRTC.Room>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Giải thích:</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>userData</strong>: Object chứa tất cả dữ liệu bạn đã gửi trong JWT token</li>
          <li><strong>peer.userData.id</strong>: ID người dùng nội bộ của bạn</li>
          <li><strong>peer.userData.*</strong>: Bất kỳ field nào bạn đã thêm vào JWT</li>
        </ul>
      </article>
    </section>
  );
}

export default UserDataIntegration;

