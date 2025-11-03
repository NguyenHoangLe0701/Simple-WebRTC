package model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

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
        SYSTEM;

        // 👇 Thêm 2 annotation này để backend tự hiểu "text", "Text", "TEXT" là như nhau
        @JsonCreator
        public static MessageType fromValue(String value) {
            return MessageType.valueOf(value.toUpperCase());
        }

        @JsonValue
        public String toValue() {
            return this.name();
        }
    }
}
