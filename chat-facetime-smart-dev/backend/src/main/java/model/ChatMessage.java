package model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String id;
    private String roomId;
    private String senderId;
    private String senderName;
    private String content;
    private MessageType type;
    private LocalDateTime timestamp;
    private String codeLanguage; // For code snippets
    private String fileName; // For file sharing
    
    public enum MessageType {
        TEXT,
        CODE,
        FILE,
        IMAGE,
        VIDEO_CALL,
        VOICE_CALL,
        SYSTEM
    }
}
