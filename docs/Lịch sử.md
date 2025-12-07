# Hướng dẫn Tích hợp Tính năng Lịch sử Tin nhắn

Tài liệu này mô tả chi tiết các bước để triển khai tính năng lưu trữ và truy xuất lịch sử tin nhắn cho dự án **Chat & FaceTime & Code Thông Minh**.

## 🎯 Mục tiêu

1.  **Lưu trữ tin nhắn**: Mọi tin nhắn gửi qua WebSocket sẽ được lưu vào cơ sở dữ liệu MySQL.
2.  **Truy xuất lịch sử**: Khi người dùng mở một cuộc trò chuyện, hệ thống sẽ tải và hiển thị các tin nhắn cũ.

---

## ⚙️ I. Cập nhật Backend (Spring Boot)

Phần này tập trung vào việc tạo cơ sở dữ liệu, định nghĩa các lớp cần thiết và tạo API để frontend có thể gọi.

### Bước 1: Tạo `ChatMessage` Entity

Tạo một file Java mới để định nghĩa cấu trúc bảng `chat_messages` trong database. JPA sẽ tự động tạo bảng này dựa trên entity.

**Tạo file mới:** `d:/Workspace/Simple-WebRTC/chat-facetime-smart-dev/backend/src/main/java/com/example/chatfacetimesmartdev/entity/ChatMessage.java`

```java
package com.example.chatfacetimesmartdev.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
package com.example.chatfacetimesmartdev.repository;

import com.example.chatfacetimesmartdev.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Tìm kiếm lịch sử tin nhắn giữa hai người dùng, sắp xếp theo thời gian tăng dần.
     */
    @Query("SELECT m FROM ChatMessage m WHERE (m.sender.id = :userId1 AND m.recipient.id = :userId2) OR (m.sender.id = :userId2 AND m.recipient.id = :userId1) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
package com.example.chatfacetimesmartdev.controller;

import com.example.chatfacetimesmartdev.dto.MessageDTO;
import com.example.chatfacetimesmartdev.entity.ChatMessage;
import com.example.chatfacetimesmartdev.entity.User;
import com.example.chatfacetimesmartdev.repository.ChatMessageRepository;
import com.example.chatfacetimesmartdev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ChatMessageRepository chatMessageRepository; // Thêm repository
    private final UserRepository userRepository; // Thêm repository

    @MessageMapping("/chat")
    public void sendMessage(@Payload MessageDTO messageDTO) {
        // Tìm người gửi và người nhận từ DB
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(messageDTO.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        // Tạo đối tượng ChatMessage để lưu
        ChatMessage messageToSave = ChatMessage.builder()
                .sender(sender)
                .recipient(recipient)
                .content(messageDTO.getContent())
                .build();

        // Lưu tin nhắn vào DB
        chatMessageRepository.save(messageToSave);

        // Gửi tin nhắn real-time đến người nhận
        simpMessagingTemplate.convertAndSendToUser(
                String.valueOf(messageDTO.getRecipientId()), "/private", messageDTO
        );
    }
}
package com.example.chatfacetimesmartdev.controller;

import com.example.chatfacetimesmartdev.entity.ChatMessage;
import com.example.chatfacetimesmartdev.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/history/{userId1}/{userId2}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long userId1, @PathVariable Long userId2) {
        List<ChatMessage> history = chatMessageRepository.findChatHistory(userId1, userId2);
        return ResponseEntity.ok(history);
    }
}
import { getAuthToken } from './authService'; // Giả sử bạn có hàm lấy token

const API_URL = 'http://localhost:8080/api'; // Hoặc lấy từ biến môi trường

export const getChatHistory = async (userId1, userId2) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch(`${API_URL}/messages/history//`, {
    headers: {
      'Authorization': `Bearer `,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }
  return response.json();
};
import React, { useEffect, useState, useRef } from 'react';
import { getChatHistory } from '../services/messageService'; // Import hàm mới

// ... các import khác

const ChatRoom = ({ currentUser, selectedUser, stompClient }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Ref cho vùng chứa tin nhắn để cuộn xuống dưới
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect để tải lịch sử tin nhắn
  useEffect(() => {
    if (selectedUser && currentUser) {
      const fetchHistory = async () => {
        try {
          const history = await getChatHistory(currentUser.id, selectedUser.id);
          setMessages(history);
        } catch (error) {
          console.error("Error fetching chat history:", error);
          setMessages([]); // Xóa tin nhắn cũ nếu có lỗi
        }
      };
      fetchHistory();
    }
  }, [selectedUser, currentUser]); // Chạy lại khi người dùng chọn chat với người khác

  // Effect để lắng nghe tin nhắn mới từ WebSocket
  useEffect(() => {
    if (stompClient && currentUser) {
      const subscription = stompClient.subscribe(`/user/${currentUser.id}/private`, (payload) => {
        const receivedMessage = JSON.parse(payload.body);
        
        // Chỉ thêm tin nhắn nếu nó thuộc về cuộc trò chuyện hiện tại
        if (receivedMessage.senderId === selectedUser.id) {
            setMessages(prevMessages => [...prevMessages, receivedMessage]);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [stompClient, currentUser, selectedUser]); // Phụ thuộc vào selectedUser để logic được chính xác

  // Effect để cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (stompClient && newMessage.trim() && selectedUser) {
      const messagePayload = {
        senderId: currentUser.id,
        recipientId: selectedUser.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };
      
      stompClient.send("/app/chat", {}, JSON.stringify(messagePayload));
      
      // Thêm tin nhắn đã gửi vào state để hiển thị ngay lập tức
      setMessages(prevMessages => [...prevMessages, messagePayload]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header của chat room */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{selectedUser?.username || 'Select a chat'}</h2>
      </div>

      {/* Vùng hiển thị tin nhắn */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                msg.senderId === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Vùng nhập tin nhắn */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!selectedUser}
          />
          <button
            onClick={handleSendMessage}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!selectedUser}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
