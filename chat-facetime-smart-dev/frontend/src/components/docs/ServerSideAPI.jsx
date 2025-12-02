import React from "react";

function ServerSideAPI() {
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Server-Side HTTP API</h1>

        <p className="mb-6">
          SimpleWebRTC cung cấp HTTP API để quản lý rooms, users và các tài nguyên khác từ server backend của bạn.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
        <p className="mb-4">
          Tất cả API requests cần được xác thực bằng API Secret của bạn. Gửi API Secret trong header:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`Authorization: Bearer YOUR_API_SECRET`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">Base URL</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`https://api.simplewebrtc.com/v1`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">1. Quản lý Rooms</h2>

        <h3 className="text-xl font-semibold mb-3">Tạo Room mới</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-bash">
{`POST /rooms
Content-Type: application/json
Authorization: Bearer YOUR_API_SECRET

{
  "name": "my-room",
  "password": "optional-password",
  "maxParticipants": 10
}`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Lấy thông tin Room</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-bash">
{`GET /rooms/{roomName}
Authorization: Bearer YOUR_API_SECRET`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Xóa Room</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`DELETE /rooms/{roomName}
Authorization: Bearer YOUR_API_SECRET`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">2. Quản lý Participants</h2>

        <h3 className="text-xl font-semibold mb-3">Lấy danh sách Participants trong Room</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">
          <code className="language-bash">
{`GET /rooms/{roomName}/participants
Authorization: Bearer YOUR_API_SECRET`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mb-3">Xóa Participant khỏi Room</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-bash">
{`DELETE /rooms/{roomName}/participants/{participantId}
Authorization: Bearer YOUR_API_SECRET`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">3. Ví dụ sử dụng với Node.js</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`const axios = require('axios');

const API_SECRET = 'your-api-secret';
const BASE_URL = 'https://api.simplewebrtc.com/v1';

// Tạo room mới
async function createRoom(roomName, password) {
  const response = await axios.post(
    \`\${BASE_URL}/rooms\`,
    {
      name: roomName,
      password: password
    },
    {
      headers: {
        'Authorization': \`Bearer \${API_SECRET}\`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

// Lấy thông tin room
async function getRoom(roomName) {
  const response = await axios.get(
    \`\${BASE_URL}/rooms/\${roomName}\`,
    {
      headers: {
        'Authorization': \`Bearer \${API_SECRET}\`
      }
    }
  );
  return response.data;
}

// Xóa room
async function deleteRoom(roomName) {
  await axios.delete(
    \`\${BASE_URL}/rooms/\${roomName}\`,
    {
      headers: {
        'Authorization': \`Bearer \${API_SECRET}\`
      }
    }
  );
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">4. Response Format</h2>
        <p className="mb-4">Tất cả responses đều trả về JSON format:</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-json">
{`{
  "success": true,
  "data": {
    // Response data
  },
  "error": null
}`}
          </code>
        </pre>

        <h2 className="text-2xl font-semibold mb-4">5. Error Handling</h2>
        <p className="mb-4">Khi có lỗi, API sẽ trả về status code và error message:</p>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-json">
{`{
  "success": false,
  "data": null,
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "Room không tồn tại"
  }
}`}
          </code>
        </pre>
      </article>
    </section>
  );
}

export default ServerSideAPI;

