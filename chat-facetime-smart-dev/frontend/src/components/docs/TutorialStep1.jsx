import React from "react";
import { AlertTriangle } from "lucide-react";

function TutorialStep1() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Học WebRTC Cơ Bản</h1>

        <h2 className="text-2xl font-semibold mb-4">
          1. Cài đặt và Thiết lập môi trường
        </h2>

        <p className="mb-4">
          Để bắt đầu với SimpleWebRTC, bạn cần cài đặt package và thiết lập môi trường phát triển.
        </p>

        <h3 className="text-xl font-semibold mb-3">Bước 1.1: Cài đặt Package</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-bash">
{`npm install @andyet/simplewebrtc
npm install react-redux redux`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 1.2: Tạo file cấu hình cơ bản</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`// config.js
export const API_KEY = 'YOUR_PUBLISHABLE_API_KEY';
export const ROOM_NAME = 'YOUR_ROOM_NAME';
export const ROOM_PASSWORD = 'YOUR_ROOM_PASSWORD';
export const CONFIG_URL = \`https://api.simplewebrtc.com/config/guest/\${API_KEY}\`;`}
          </code>
        </pre>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-start">
          <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý quan trọng:</strong> Bạn cần thay thế <code className="bg-yellow-100 px-1 rounded">YOUR_PUBLISHABLE_API_KEY</code> bằng API Key thực tế mà bạn nhận được khi đăng ký SimpleWebRTC. Bạn có thể tìm và quản lý API keys tại{" "}
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

        <h3 className="text-xl font-semibold mb-3">Bước 1.3: Import các dependencies cần thiết</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import * as SWRTC from '@andyet/simplewebrtc';
import { API_KEY, CONFIG_URL } from './config';`}
          </code>
        </pre>

        <p className="mb-6">
          Sau khi hoàn thành các bước trên, bạn đã sẵn sàng để bắt đầu tạo ứng dụng WebRTC đầu tiên của mình!
        </p>
      </article>
    </section>
  );
}

export default TutorialStep1;

