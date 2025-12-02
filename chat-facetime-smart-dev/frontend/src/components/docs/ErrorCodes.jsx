import React from "react";

function ErrorCodes() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mã lỗi (Error Codes)</h1>

        <p className="mb-6">
          Danh sách đầy đủ các mã lỗi mà SimpleWebRTC có thể trả về và cách xử lý chúng.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Connection Errors</h2>

        <h3 className="text-xl font-semibold mb-3">CONNECTION_FAILED</h3>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Không thể kết nối với SimpleWebRTC service.</p>
          <p className="font-semibold mb-2">Nguyên nhân có thể:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Mạng internet không ổn định</li>
            <li>Config URL không đúng</li>
            <li>API Key không hợp lệ</li>
            <li>Firewall chặn kết nối</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">CONNECTION_TIMEOUT</h3>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Kết nối bị timeout sau một khoảng thời gian.</p>
          <p className="font-semibold mb-2">Cách xử lý:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kiểm tra kết nối mạng</li>
            <li>Thử kết nối lại</li>
            <li>Kiểm tra config URL</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">2. Media Errors</h2>

        <h3 className="text-xl font-semibold mb-3">MEDIA_PERMISSION_DENIED</h3>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Người dùng từ chối cấp quyền truy cập camera/microphone.</p>
          <p className="font-semibold mb-2">Cách xử lý:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hướng dẫn người dùng cấp quyền trong trình duyệt</li>
            <li>Kiểm tra cài đặt privacy của trình duyệt</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">MEDIA_NOT_AVAILABLE</h3>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Không tìm thấy camera hoặc microphone.</p>
          <p className="font-semibold mb-2">Cách xử lý:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kiểm tra thiết bị đã kết nối</li>
            <li>Kiểm tra driver của thiết bị</li>
            <li>Thử trên trình duyệt khác</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">MEDIA_GET_FAILED</h3>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Không thể lấy media stream từ thiết bị.</p>
          <p className="font-semibold mb-2">Cách xử lý:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kiểm tra thiết bị có đang được sử dụng bởi ứng dụng khác không</li>
            <li>Khởi động lại trình duyệt</li>
            <li>Kiểm tra quyền truy cập hệ thống</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">3. Room Errors</h2>

        <h3 className="text-xl font-semibold mb-3">ROOM_NOT_FOUND</h3>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Room không tồn tại hoặc đã bị xóa.</p>
          <p className="font-semibold mb-2">Cách xử lý:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kiểm tra tên room có đúng không</li>
            <li>Tạo room mới nếu cần</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">ROOM_PASSWORD_INCORRECT</h3>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Mật khẩu room không đúng.</p>
          <p className="font-semibold mb-2">Cách xử lý:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Yêu cầu người dùng nhập lại mật khẩu</li>
            <li>Kiểm tra mật khẩu có phân biệt hoa thường không</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mb-3">ROOM_FULL</h3>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Room đã đạt số lượng người tham gia tối đa.</p>
          <p className="font-semibold mb-2">Cách xử lý:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Thông báo cho người dùng</li>
            <li>Đề xuất tham gia room khác</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">4. WebRTC Errors</h2>

        <h3 className="text-xl font-semibold mb-3">WEBRTC_OFFER_FAILED</h3>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Không thể tạo WebRTC offer.</p>
        </div>

        <h3 className="text-xl font-semibold mb-3">WEBRTC_ANSWER_FAILED</h3>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">Không thể tạo WebRTC answer.</p>
        </div>

        <h3 className="text-xl font-semibold mb-3">ICE_CONNECTION_FAILED</h3>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="font-semibold mb-2">Mô tả:</p>
          <p className="mb-2">ICE connection không thể thiết lập.</p>
          <p className="font-semibold mb-2">Cách xử lý:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kiểm tra firewall/NAT settings</li>
            <li>Sử dụng TURN server nếu cần</li>
            <li>Kiểm tra STUN server configuration</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">5. Xử lý lỗi trong code</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { useSelector } from 'react-redux';

function ErrorHandler() {
  const connection = useSelector(state => state.connection);
  const room = useSelector(state => state.room);

  // Xử lý connection errors
  if (connection.error) {
    switch (connection.error.code) {
      case 'CONNECTION_FAILED':
        return <div>Không thể kết nối. Vui lòng thử lại.</div>;
      case 'CONNECTION_TIMEOUT':
        return <div>Kết nối bị timeout. Đang thử lại...</div>;
      default:
        return <div>Lỗi kết nối: {connection.error.message}</div>;
    }
  }

  // Xử lý room errors
  if (room.error) {
    switch (room.error.code) {
      case 'ROOM_NOT_FOUND':
        return <div>Room không tồn tại.</div>;
      case 'ROOM_PASSWORD_INCORRECT':
        return <div>Mật khẩu không đúng.</div>;
      case 'ROOM_FULL':
        return <div>Room đã đầy.</div>;
      default:
        return <div>Lỗi room: {room.error.message}</div>;
    }
  }

  return null;
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">6. Danh sách đầy đủ mã lỗi</h2>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Mã lỗi</th>
                <th className="text-left p-2">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2"><code>CONNECTION_FAILED</code></td>
                <td className="p-2">Kết nối thất bại</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>CONNECTION_TIMEOUT</code></td>
                <td className="p-2">Kết nối timeout</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>MEDIA_PERMISSION_DENIED</code></td>
                <td className="p-2">Từ chối quyền media</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>MEDIA_NOT_AVAILABLE</code></td>
                <td className="p-2">Media không khả dụng</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>ROOM_NOT_FOUND</code></td>
                <td className="p-2">Room không tìm thấy</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>ROOM_PASSWORD_INCORRECT</code></td>
                <td className="p-2">Mật khẩu sai</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>ROOM_FULL</code></td>
                <td className="p-2">Room đầy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default ErrorCodes;

