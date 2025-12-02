import React from "react";

function ReactReduxVersions() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">React/Redux Versions</h1>

        <p className="mb-6">
          SimpleWebRTC yêu cầu các phiên bản cụ thể của React và Redux để hoạt động tốt nhất. 
          Dưới đây là thông tin về các phiên bản được hỗ trợ.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Yêu cầu phiên bản</h2>

        <h3 className="text-xl font-semibold mb-3">React</h3>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Phiên bản tối thiểu:</strong> React 16.8.0 (để sử dụng Hooks)</li>
            <li><strong>Phiên bản được khuyến nghị:</strong> React 18.x hoặc mới hơn</li>
            <li><strong>Phiên bản hiện tại hỗ trợ:</strong> React 16.8.0 - 18.x</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">Redux</h3>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Phiên bản tối thiểu:</strong> Redux 4.0.0</li>
            <li><strong>Phiên bản được khuyến nghị:</strong> Redux 4.x hoặc 5.x</li>
            <li><strong>Phiên bản hiện tại hỗ trợ:</strong> Redux 4.0.0 - 5.x</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">React-Redux</h3>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Phiên bản tối thiểu:</strong> react-redux 7.0.0</li>
            <li><strong>Phiên bản được khuyến nghị:</strong> react-redux 8.x hoặc 9.x</li>
            <li><strong>Phiên bản hiện tại hỗ trợ:</strong> react-redux 7.0.0 - 9.x</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">2. Cài đặt</h2>

        <h3 className="text-xl font-semibold mb-3">Với npm</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-bash">
{`npm install react@^18.0.0
npm install redux@^4.0.0
npm install react-redux@^8.0.0
npm install @andyet/simplewebrtc`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Với yarn</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-bash">
{`yarn add react@^18.0.0
yarn add redux@^4.0.0
yarn add react-redux@^8.0.0
yarn add @andyet/simplewebrtc`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Với pnpm</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`pnpm add react@^18.0.0
pnpm add redux@^4.0.0
pnpm add react-redux@^8.0.0
pnpm add @andyet/simplewebrtc`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">3. Kiểm tra phiên bản</h2>

        <h3 className="text-xl font-semibold mb-3">Kiểm tra trong package.json</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-json">
{`{
  "dependencies": {
    "react": "^18.2.0",
    "redux": "^4.2.1",
    "react-redux": "^8.1.3",
    "@andyet/simplewebrtc": "^3.0.0"
  }
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Kiểm tra trong code</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import React from 'react';
import { version as reduxVersion } from 'redux';
import { version as reactReduxVersion } from 'react-redux';

console.log('React version:', React.version);
console.log('Redux version:', reduxVersion);
console.log('React-Redux version:', reactReduxVersion);`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">4. Tương thích</h2>

        <h3 className="text-xl font-semibold mb-3">React 18 Features</h3>
        <p className="mb-3">
          SimpleWebRTC hoàn toàn tương thích với các tính năng mới của React 18:
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <ul className="list-disc pl-6 space-y-2">
            <li>Concurrent rendering</li>
            <li>Automatic batching</li>
            <li>Suspense và Server Components (nếu sử dụng)</li>
            <li>useTransition và useDeferredValue hooks</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">Redux Toolkit (Tùy chọn)</h3>
        <p className="mb-3">
          Bạn có thể sử dụng Redux Toolkit cùng với SimpleWebRTC, nhưng không bắt buộc:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`npm install @reduxjs/toolkit`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">5. Lưu ý về phiên bản</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>React 16.8.0 là phiên bản tối thiểu vì cần Hooks API</li>
            <li>React 17 và 18 đều được hỗ trợ đầy đủ</li>
            <li>Redux 5.x có một số breaking changes, nhưng SimpleWebRTC vẫn tương thích</li>
            <li>Nếu gặp vấn đề, hãy đảm bảo bạn đang sử dụng các phiên bản được khuyến nghị</li>
          </ul>
        </div>
      </article>
    </section>
  );
}

export default ReactReduxVersions;

