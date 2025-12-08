package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.entity.ChatMessage;
import com.smartchat.chatfacetimesmartdev.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final ChatMessageRepository chatMessageRepository;

    /**
     * Lấy lịch sử tin nhắn của một phòng
     * @param roomId ID của phòng
     * @return Danh sách tin nhắn sắp xếp theo thời gian tăng dần
     */
    @GetMapping("/history/room/{roomId}")
    public ResponseEntity<List<ChatMessage>> getChatHistoryByRoom(@PathVariable String roomId) {
        try {
            List<ChatMessage> history = chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.err.println("❌ Error fetching chat history for room " + roomId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lấy lịch sử tin nhắn trực tiếp giữa hai người dùng
     * @param userId1 ID của người dùng thứ nhất
     * @param userId2 ID của người dùng thứ hai
     * @return Danh sách tin nhắn sắp xếp theo thời gian tăng dần
     */
    @GetMapping("/history/{userId1}/{userId2}")
    public ResponseEntity<List<ChatMessage>> getDirectChatHistory(
            @PathVariable Long userId1, 
            @PathVariable Long userId2) {
        try {
            List<ChatMessage> history = chatMessageRepository.findDirectChatHistory(userId1, userId2);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.err.println("❌ Error fetching direct chat history: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}

