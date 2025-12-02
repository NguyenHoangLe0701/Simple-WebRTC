import React from "react";

function SDKReleaseNotes() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">SDK Release Notes</h1>

        <p className="mb-6">
          Lịch sử các phiên bản và thay đổi của SimpleWebRTC SDK.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Version 3.2.0 (Latest)</h2>
        <p className="text-gray-600 mb-2">Ngày phát hành: 2024-01-15</p>
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <h3 className="font-semibold mb-2">✨ Tính năng mới:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hỗ trợ React 18 concurrent features</li>
            <li>Thêm component SWRTC.ScreenShare</li>
            <li>Cải thiện error handling</li>
            <li>Thêm support cho custom TURN servers</li>
          </ul>
          <h3 className="font-semibold mb-2 mt-4">🐛 Sửa lỗi:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sửa lỗi memory leak khi disconnect</li>
            <li>Sửa lỗi audio không phát trong một số trình duyệt</li>
            <li>Cải thiện reconnection logic</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Version 3.1.0</h2>
        <p className="text-gray-600 mb-2">Ngày phát hành: 2023-11-20</p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <h3 className="font-semibold mb-2">✨ Tính năng mới:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Thêm support cho user data integration</li>
            <li>Cải thiện TypeScript definitions</li>
            <li>Thêm các utility hooks mới</li>
          </ul>
          <h3 className="font-semibold mb-2 mt-4">🔧 Cải thiện:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Tối ưu performance khi có nhiều peers</li>
            <li>Cải thiện documentation</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Version 3.0.0</h2>
        <p className="text-gray-600 mb-2">Ngày phát hành: 2023-09-10</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <h3 className="font-semibold mb-2">⚠️ Breaking Changes:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Redux store structure đã thay đổi</li>
            <li>Một số action names đã được đổi tên</li>
            <li>Yêu cầu React 16.8+ (Hooks API)</li>
          </ul>
          <h3 className="font-semibold mb-2 mt-4">✨ Tính năng mới:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hoàn toàn viết lại với React Hooks</li>
            <li>Improved TypeScript support</li>
            <li>Better error handling</li>
            <li>New component API</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Version 2.9.0</h2>
        <p className="text-gray-600 mb-2">Ngày phát hành: 2023-06-15</p>
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6">
          <h3 className="font-semibold mb-2">✨ Tính năng mới:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Thêm support cho Redux 5.x</li>
            <li>Cải thiện compatibility với các trình duyệt mới</li>
          </ul>
          <h3 className="font-semibold mb-2 mt-4">🐛 Sửa lỗi:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sửa lỗi với Safari</li>
            <li>Cải thiện connection stability</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Version 2.8.0</h2>
        <p className="text-gray-600 mb-2">Ngày phát hành: 2023-03-20</p>
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6">
          <h3 className="font-semibold mb-2">✨ Tính năng mới:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Thêm support cho screen sharing</li>
            <li>Cải thiện audio quality</li>
            <li>Thêm các utility functions mới</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Cách xem Release Notes mới nhất</h2>
        <p className="mb-4">
          Để xem các release notes mới nhất, bạn có thể:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Kiểm tra trên <a href="https://github.com/andyet/simplewebrtc" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">GitHub repository</a></li>
          <li>Xem trong npm package: <code className="bg-gray-100 px-2 py-1 rounded">npm view @andyet/simplewebrtc</code></li>
          <li>Đăng ký nhận thông báo từ SimpleWebRTC</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Migration Guides</h2>
        <p className="mb-4">
          Nếu bạn đang nâng cấp từ phiên bản cũ, hãy xem:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><a href="#upgrading" className="text-blue-600 underline">Hướng dẫn nâng cấp</a></li>
          <li>CHANGELOG.md trong repository</li>
          <li>Breaking changes documentation</li>
        </ul>
      </article>
    </section>
  );
}

export default SDKReleaseNotes;

