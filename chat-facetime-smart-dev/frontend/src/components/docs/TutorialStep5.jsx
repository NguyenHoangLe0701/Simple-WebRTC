import React from "react";

function TutorialStep5() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Học WebRTC Cơ Bản</h1>

        <h2 className="text-2xl font-semibold mb-4">
          5. Tham gia vào Room (Phòng chat)
        </h2>

        <p className="mb-4">
          Room là nơi các người dùng kết nối với nhau để thực hiện video call. Bạn cần join vào một room để bắt đầu cuộc gọi.
        </p>

        <h3 className="text-xl font-semibold mb-3">Bước 5.1: Sử dụng Room Component</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`import * as SWRTC from '@andyet/simplewebrtc';

const ROOM_NAME = 'my-room';
const ROOM_PASSWORD = 'optional-password';

<SWRTC.Connected>
  <SWRTC.RequestUserMedia audio video auto />
  
  {/* Tham gia vào room */}
  <SWRTC.Room name={ROOM_NAME} password={ROOM_PASSWORD}>
    {({ room, peers, localMedia }) => {
      return (
        <div>
          <h2>Room: {room.name}</h2>
          <p>Số người tham gia: {peers.length + 1}</p>
          {/* Render UI của bạn */}
        </div>
      );
    }}
  </SWRTC.Room>
</SWRTC.Connected>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 5.2: Hiển thị danh sách Peers (Người tham gia)</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.Room name={ROOM_NAME}>
  {({ room, peers }) => {
    return (
      <div>
        <h2>Room: {room.name}</h2>
        
        {/* Video của bạn */}
        <div className="local-video">
          <SWRTC.LocalVideo />
        </div>
        
        {/* Video của các peers khác */}
        <div className="peers-grid">
          {peers.map(peer => (
            <div key={peer.id} className="peer-video">
              <SWRTC.RemoteVideo peer={peer} />
              <p>{peer.id}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }}
</SWRTC.Room>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 5.3: Xử lý Audio từ Remote Peers</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.Connected>
  {/* Component này tự động phát audio từ remote peers */}
  <SWRTC.RemoteAudioPlayer />
  
  <SWRTC.Room name={ROOM_NAME}>
    {({ peers }) => (
      <div>
        {peers.map(peer => (
          <div key={peer.id}>
            <SWRTC.RemoteVideo peer={peer} />
            {/* Audio sẽ tự động được phát bởi RemoteAudioPlayer */}
          </div>
        ))}
      </div>
    )}
  </SWRTC.Room>
</SWRTC.Connected>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Bước 5.4: Quản lý Room State</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { useSelector } from 'react-redux';

function RoomStatus() {
  const room = useSelector(state => state.room);
  const peers = useSelector(state => state.peers);
  
  return (
    <div>
      {room.joined ? (
        <div>
          <p>Đã tham gia room: {room.name}</p>
          <p>Số peers: {Object.keys(peers).length}</p>
        </div>
      ) : (
        <p>Đang tham gia room...</p>
      )}
    </div>
  );
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Giải thích:</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Room name</strong>: Tên duy nhất của room, các user cùng room name sẽ kết nối với nhau</li>
          <li><strong>Password</strong>: (Tùy chọn) Mật khẩu để bảo vệ room</li>
          <li><strong>Peers</strong>: Danh sách các người dùng khác đang trong cùng room</li>
          <li><strong>LocalMedia</strong>: Media stream từ camera/microphone của bạn</li>
        </ul>
      </article>
    </section>
  );
}

export default TutorialStep5;

