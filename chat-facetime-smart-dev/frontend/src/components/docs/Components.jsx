import React from "react";

function Components() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Components</h1>

        <p className="mb-6">
          SimpleWebRTC cung cấp nhiều React components sẵn có để bạn có thể xây dựng ứng dụng 
          video call một cách nhanh chóng và dễ dàng.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Provider Components</h2>

        <h3 className="text-xl font-semibold mb-3">SWRTC.Provider</h3>
        <p className="mb-3">Component chính để khởi tạo SimpleWebRTC trong ứng dụng của bạn.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.Provider 
  configUrl={CONFIG_URL}
  userDataToken={userDataToken}
>
  {/* Các component của bạn */}
</SWRTC.Provider>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Props:</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>configUrl</strong> (required): URL để lấy cấu hình từ SimpleWebRTC API</li>
          <li><strong>userDataToken</strong> (optional): JWT token chứa dữ liệu người dùng</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">2. Connection State Components</h2>

        <h3 className="text-xl font-semibold mb-3">SWRTC.Connecting</h3>
        <p className="mb-3">Hiển thị khi đang kết nối với SimpleWebRTC service.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.Connecting>
  <div>Đang kết nối...</div>
</SWRTC.Connecting>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">SWRTC.Connected</h3>
        <p className="mb-3">Hiển thị khi đã kết nối thành công.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.Connected>
  <div>Đã kết nối!</div>
</SWRTC.Connected>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">SWRTC.Disconnected</h3>
        <p className="mb-3">Hiển thị khi mất kết nối.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`<SWRTC.Disconnected>
  <div>Đã ngắt kết nối</div>
</SWRTC.Disconnected>`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">3. Media Components</h2>

        <h3 className="text-xl font-semibold mb-3">SWRTC.RequestUserMedia</h3>
        <p className="mb-3">Yêu cầu quyền truy cập camera và microphone.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.RequestUserMedia 
  audio 
  video 
  auto 
  onError={(error) => console.error(error)}
/>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">SWRTC.LocalVideo</h3>
        <p className="mb-3">Hiển thị video từ camera của bạn.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.LocalVideo 
  muted 
  playsInline 
  className="local-video"
/>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">SWRTC.RemoteVideo</h3>
        <p className="mb-3">Hiển thị video từ peer khác.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.RemoteVideo 
  peer={peer}
  playsInline 
  className="remote-video"
/>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">SWRTC.RemoteAudioPlayer</h3>
        <p className="mb-3">Tự động phát audio từ remote peers.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`<SWRTC.RemoteAudioPlayer />`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">4. Room Components</h2>

        <h3 className="text-xl font-semibold mb-3">SWRTC.Room</h3>
        <p className="mb-3">Component chính để tham gia và quản lý room.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`<SWRTC.Room name="my-room" password="optional-password">
  {({ room, peers, localMedia }) => (
    <div>
      <h2>Room: {room.name}</h2>
      <p>Số người tham gia: {peers.length + 1}</p>
      
      {/* Hiển thị video của bạn */}
      <SWRTC.LocalVideo />
      
      {/* Hiển thị video của peers */}
      {peers.map(peer => (
        <SWRTC.RemoteVideo key={peer.id} peer={peer} />
      ))}
    </div>
  )}
</SWRTC.Room>`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">5. Control Components</h2>

        <h3 className="text-xl font-semibold mb-3">SWRTC.MuteButton</h3>
        <p className="mb-3">Button để bật/tắt microphone.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-js">
{`<SWRTC.MuteButton>
  {({ mute, toggleMute }) => (
    <button onClick={toggleMute}>
      {mute ? '🔇 Tắt' : '🎤 Bật'} Microphone
    </button>
  )}
</SWRTC.MuteButton>`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">SWRTC.VideoButton</h3>
        <p className="mb-3">Button để bật/tắt camera.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`<SWRTC.VideoButton>
  {({ videoEnabled, toggleVideo }) => (
    <button onClick={toggleVideo}>
      {videoEnabled ? '📹 Tắt' : '📷 Bật'} Camera
    </button>
  )}
</SWRTC.VideoButton>`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">6. Ví dụ hoàn chỉnh</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`function VideoCallApp() {
  return (
    <SWRTC.Provider configUrl={CONFIG_URL}>
      <SWRTC.Connecting>
        <div>Đang kết nối...</div>
      </SWRTC.Connecting>

      <SWRTC.Connected>
        <SWRTC.RequestUserMedia audio video auto />
        <SWRTC.RemoteAudioPlayer />

        <SWRTC.Room name="my-room">
          {({ peers }) => (
            <div className="video-call">
              <div className="local-video">
                <SWRTC.LocalVideo />
              </div>

              <div className="remote-videos">
                {peers.map(peer => (
                  <SWRTC.RemoteVideo key={peer.id} peer={peer} />
                ))}
              </div>

              <div className="controls">
                <SWRTC.MuteButton>
                  {({ mute, toggleMute }) => (
                    <button onClick={toggleMute}>
                      {mute ? '🔇' : '🎤'}
                    </button>
                  )}
                </SWRTC.MuteButton>

                <SWRTC.VideoButton>
                  {({ videoEnabled, toggleVideo }) => (
                    <button onClick={toggleVideo}>
                      {videoEnabled ? '📹' : '📷'}
                    </button>
                  )}
                </SWRTC.VideoButton>
              </div>
            </div>
          )}
        </SWRTC.Room>
      </SWRTC.Connected>
    </SWRTC.Provider>
  );
}`}
          </code>
        </pre>
      </article>
    </section>
  );
}

export default Components;

