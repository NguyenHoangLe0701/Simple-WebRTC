import React from "react";

function TutorialStep2() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Học WebRTC Cơ Bản</h1>

        <h2 className="text-2xl font-semibold mb-4">
          2. Thiết lập Redux Store và Provider
        </h2>

        <p className="mb-4">
          SimpleWebRTC sử dụng Redux để quản lý state. Bạn cần tạo store và wrap ứng dụng với Provider.
        </p>

        <h3 className="text-xl font-semibold mb-3">Bước 2.1: Tạo Redux Store</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import * as SWRTC from '@andyet/simplewebrtc';

// Tạo store từ SimpleWebRTC
const store = SWRTC.createStore();`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 2.2: Wrap ứng dụng với Provider</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import { Provider } from 'react-redux';
import * as SWRTC from '@andyet/simplewebrtc';

function App() {
  const store = SWRTC.createStore();
  
  return (
    <Provider store={store}>
      <SWRTC.Provider configUrl={CONFIG_URL}>
        {/* Các component của bạn ở đây */}
      </SWRTC.Provider>
    </Provider>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Giải thích:</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>SWRTC.createStore()</strong>: Tạo Redux store với các reducers và middleware cần thiết cho WebRTC</li>
          <li><strong>SWRTC.Provider</strong>: Component cung cấp context và kết nối với SimpleWebRTC service</li>
          <li><strong>configUrl</strong>: URL endpoint để lấy cấu hình từ SimpleWebRTC API</li>
        </ul>

        <p className="mb-6">
          Sau khi thiết lập Provider, bạn có thể sử dụng các component và hooks của SimpleWebRTC trong ứng dụng.
        </p>
      </article>
    </section>
  );
}

export default TutorialStep2;

