package com.smartchat.chatfacetimesmartdev.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    
    @Column(name = "room_id", nullable = false, length = 255)
    private String roomId;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @Column(name = "sender_name", length = 255)
    private String senderName;
    
    @Column(name = "sender_id_string", length = 255)
    private String senderIdString;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "message_type", length = 50)
    private String messageType;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "code_language", length = 50)
    private String codeLanguage;
    
    @Column(name = "file_name", length = 255)
    private String fileName;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "avatar", length = 10)
    private String avatar;

    // Lưu thông tin cuộc gọi (nếu có)
    @Column(name = "call_duration_seconds")
    private Long callDurationSeconds;

    @Column(name = "call_action", length = 20)
    private String callAction;
    
    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}

