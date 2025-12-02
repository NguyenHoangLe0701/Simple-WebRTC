import React from "react";

function TutorialStep3() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Học WebRTC Cơ Bản</h1>

        <h2 className="text-2xl font-semibold mb-4">
          3. Xử lý trạng thái kết nối
        </h2>

        <p className="mb-4">
          SimpleWebRTC cung cấp các component để xử lý các trạng thái kết nối khác nhau.
        </p>

        <h3 className="text-xl font-semibold mb-3">Bước 3.1: Sử dụng Connecting Component</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import * as SWRTC from '@andyet/simplewebrtc';

function App() {
  return (
    <SWRTC.Provider configUrl={CONFIG_URL}>
      {/* Hiển thị khi đang kết nối */}
      <SWRTC.Connecting>
        <div className="text-center p-8">
          <h2>Đang kết nối...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </SWRTC.Connecting>
    </SWRTC.Provider>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 3.2: Sử dụng Connected Component</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.Provider configUrl={CONFIG_URL}>
  <SWRTC.Connecting>
    <h1>Đang kết nối...</h1>
  </SWRTC.Connecting>

  {/* Chỉ render khi đã kết nối thành công */}
  <SWRTC.Connected>
    <h1>Đã kết nối!</h1>
    {/* Các component khác của bạn */}
  </SWRTC.Connected>
</SWRTC.Provider>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 3.3: Xử lý lỗi kết nối</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`<SWRTC.Provider configUrl={CONFIG_URL}>
  <SWRTC.Connecting>
    <div>Đang kết nối...</div>
  </SWRTC.Connecting>

  <SWRTC.Connected>
    {/* Nội dung khi kết nối thành công */}
  </SWRTC.Connected>

  <SWRTC.Disconnected>
    <div className="text-red-500">
      <h2>Kết nối bị ngắt</h2>
      <button onClick={() => window.location.reload()}>
        Thử lại
      </button>
    </div>
  </SWRTC.Disconnected>
</SWRTC.Provider>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Giải thích các trạng thái:</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Connecting</strong>: Hiển thị khi đang thiết lập kết nối với SimpleWebRTC service</li>
          <li><strong>Connected</strong>: Hiển thị khi đã kết nối thành công, sẵn sàng để join room</li>
          <li><strong>Disconnected</strong>: Hiển thị khi mất kết nối, có thể do lỗi mạng hoặc server</li>
        </ul>
      </article>
    </section>
  );
}

export default TutorialStep3;

