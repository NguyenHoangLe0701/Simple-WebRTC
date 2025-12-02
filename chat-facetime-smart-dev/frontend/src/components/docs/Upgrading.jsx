import React from "react";

function Upgrading() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Nâng cấp SimpleWebRTC</h1>

        <p className="mb-6">
          Hướng dẫn nâng cấp SimpleWebRTC từ phiên bản cũ lên phiên bản mới nhất.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Kiểm tra phiên bản hiện tại</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`npm list @andyet/simplewebrtc
# hoặc
yarn list @andyet/simplewebrtc`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">2. Nâng cấp lên phiên bản mới nhất</h2>

        <h3 className="text-xl font-semibold mb-3">Với npm</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-bash">
{`npm install @andyet/simplewebrtc@latest`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Với yarn</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-bash">
{`yarn upgrade @andyet/simplewebrtc@latest`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Với pnpm</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`pnpm update @andyet/simplewebrtc@latest`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">3. Breaking Changes theo phiên bản</h2>

        <h3 className="text-xl font-semibold mb-3">Từ v2.x lên v3.x</h3>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>API Changes:</strong> Một số props của components đã thay đổi</li>
            <li><strong>Redux Store:</strong> Cấu trúc state đã được cập nhật</li>
            <li><strong>Actions:</strong> Một số action names đã thay đổi</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">Migration Guide v2 → v3</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`// V2 (Cũ)
<SWRTC.Provider configUrl={CONFIG_URL}>
  <SWRTC.Room name="room">
    {/* ... */}
  </SWRTC.Room>
</SWRTC.Provider>

// V3 (Mới) - Không có thay đổi lớn, chỉ cần cập nhật package
<SWRTC.Provider configUrl={CONFIG_URL}>
  <SWRTC.Room name="room">
    {/* ... */}
  </SWRTC.Room>
</SWRTC.Provider>`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">4. Cập nhật Dependencies</h2>
        <p className="mb-4">
          Khi nâng cấp SimpleWebRTC, bạn cũng nên cập nhật các dependencies liên quan:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`# Cập nhật React và Redux nếu cần
npm install react@latest redux@latest react-redux@latest

# Sau đó cập nhật SimpleWebRTC
npm install @andyet/simplewebrtc@latest`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">5. Kiểm tra sau khi nâng cấp</h2>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <ol className="list-decimal pl-6 space-y-2">
            <li>Kiểm tra console có lỗi không</li>
            <li>Test kết nối với SimpleWebRTC service</li>
            <li>Test video/audio call</li>
            <li>Test join/leave room</li>
            <li>Kiểm tra các tính năng đã sử dụng trong ứng dụng</li>
          </ol>
        </div>

        <h2 className="text-2xl font-semibold mb-4">6. Rollback nếu có vấn đề</h2>
        <p className="mb-4">
          Nếu gặp vấn đề sau khi nâng cấp, bạn có thể rollback về phiên bản cũ:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`# Cài đặt lại phiên bản cũ
npm install @andyet/simplewebrtc@2.9.0

# Hoặc xem lịch sử phiên bản
npm view @andyet/simplewebrtc versions`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">7. Best Practices</h2>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Luôn đọc CHANGELOG trước khi nâng cấp</li>
            <li>Test trên môi trường development trước</li>
            <li>Backup code trước khi nâng cấp</li>
            <li>Nâng cấp từng bước nhỏ thay vì nhảy nhiều phiên bản</li>
            <li>Kiểm tra breaking changes trong documentation</li>
          </ul>
        </div>
      </article>
    </section>
  );
}

export default Upgrading;

