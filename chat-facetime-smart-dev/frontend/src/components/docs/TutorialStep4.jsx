import React from "react";
import { AlertTriangle } from "lucide-react";

function TutorialStep4() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Học WebRTC Cơ Bản</h1>

        <h2 className="text-2xl font-semibold mb-4">
          4. Yêu cầu quyền truy cập Media (Camera/Microphone)
        </h2>

        <p className="mb-4">
          Trước khi có thể tham gia video call, bạn cần yêu cầu quyền truy cập camera và microphone từ người dùng.
        </p>

        <h3 className="text-xl font-semibold mb-3">Bước 4.1: Sử dụng RequestUserMedia Component</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import * as SWRTC from '@andyet/simplewebrtc';

<SWRTC.Connected>
  <h1>Đã kết nối!</h1>
  
  {/* Yêu cầu quyền truy cập audio và video */}
  <SWRTC.RequestUserMedia audio video auto />
</SWRTC.Connected>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 4.2: Các thuộc tính của RequestUserMedia</h3>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>audio</strong>: Yêu cầu quyền truy cập microphone</li>
            <li><strong>video</strong>: Yêu cầu quyền truy cập camera</li>
            <li><strong>auto</strong>: Tự động yêu cầu khi component mount (không cần user interaction)</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">Bước 4.3: Xử lý Local Media Stream</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import * as SWRTC from '@andyet/simplewebrtc';

function VideoCall() {
  return (
    <SWRTC.Connected>
      <SWRTC.RequestUserMedia audio video auto />
      
      {/* Hiển thị video từ camera của bạn */}
      <SWRTC.LocalVideo />
      
      {/* Hoặc sử dụng hook để lấy stream */}
      <SWRTC.LocalMedia>
        {({ localMedia }) => {
          if (localMedia && localMedia.video) {
            return (
              <video
                ref={ref => {
                  if (ref && localMedia.video) {
                    ref.srcObject = localMedia.video;
                  }
                }}
                autoPlay
                muted
                playsInline
              />
            );
          }
          return <div>Đang tải camera...</div>;
        }}
      </SWRTC.LocalMedia>
    </SWRTC.Connected>
  );
}`}
          </code>
        </pre>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-start">
          <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Trình duyệt sẽ yêu cầu người dùng cho phép truy cập camera và microphone. 
              Nếu người dùng từ chối, bạn cần xử lý lỗi và thông báo cho họ biết.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Bước 4.4: Xử lý lỗi Media</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`<SWRTC.RequestUserMedia 
  audio 
  video 
  auto 
  onError={(error) => {
    console.error('Lỗi khi truy cập media:', error);
    if (error.name === 'NotAllowedError') {
      alert('Vui lòng cho phép truy cập camera và microphone');
    } else if (error.name === 'NotFoundError') {
      alert('Không tìm thấy camera hoặc microphone');
    }
  }}
/>`}
          </code>
        </pre>
      </article>
    </section>
  );
}

export default TutorialStep4;

