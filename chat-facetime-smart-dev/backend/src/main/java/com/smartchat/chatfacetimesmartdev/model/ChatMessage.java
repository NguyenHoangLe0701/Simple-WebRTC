// package com.smartchat.chatfacetimesmartdev.model;

// // import java.time.LocalDateTime; đổi từ localdatetime thành Instal lấy giờ chuẩn UTC quốc tế thay vì nếu giờ của server
// import java.time.Instant;
// import java.util.Map;

// import com.fasterxml.jackson.annotation.JsonCreator;
// import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// import com.fasterxml.jackson.annotation.JsonInclude;
// import com.fasterxml.jackson.annotation.JsonValue;

// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @JsonIgnoreProperties(ignoreUnknown = true)
// @JsonInclude(JsonInclude.Include.NON_NULL)
// public class ChatMessage {
//     private String id;
//     private String roomId;
//     private String senderId;
//     private String senderName;
//     private String sender;      // QUAN TRỌNG: để nhận từ frontend
//     private String content;
//     private MessageType type;
//     // private LocalDateTime timestamp;
//     private Instant timestamp;
//     private String codeLanguage;
//     private String fileName;
//     private String avatar;      // QUAN TRỌNG
//     private Map<String, Object> replyTo; // THÊM FIELD REPLYTO
//     private Map<String, Object> reactions;

//     //  CONSTRUCTOR ĐỂ DỄ DÀNG TẠO OBJECT
//     public ChatMessage(String id, String roomId, String sender, String senderId, String content, MessageType type) {
//         this.id = id;
//         this.roomId = roomId;
//         this.sender = sender;
//         this.senderId = senderId;
//         this.content = content;
//         this.type = type != null ? type : MessageType.TEXT;
//         this.timestamp = Instant.now();

//         // TẠO AVATAR TỰ ĐỘNG TỪ SENDER NAME

//         if (sender != null && !sender.isEmpty()) {
//             this.avatar = sender.substring(0, 1).toUpperCase();
//         }
//     }

//     // Getter ưu tiên sender -  CẢI THIỆN LOGIC
//     public String getDisplaySender() {
//         if (this.sender != null && !this.sender.trim().isEmpty()) {
//             return this.sender;
//         }
//         if (this.senderName != null && !this.senderName.trim().isEmpty()) {
//             return this.senderName;
//         }
//         return "Unknown";
//     }

//     //  GETTER ĐỂ ĐẢM BẢO AVATAR LUÔN CÓ GIÁ TRỊ
//     public String getAvatar() {
//         if (this.avatar != null && !this.avatar.trim().isEmpty()) {
//             return this.avatar;
//         }
//         // Tạo avatar từ sender name nếu chưa có
//         String displayName = getDisplaySender();
//         if (displayName != null && !displayName.trim().isEmpty()) {
//             return displayName.substring(0, 1).toUpperCase();
//         }
//         return "U";
//     }

//     //  GETTER ĐỂ ĐẢM BẢO SENDER ID LUÔN CÓ GIÁ TRỊ
//     public String getSenderId() {
//         if (this.senderId != null && !this.senderId.trim().isEmpty()) {
//             return this.senderId;
//         }
//         // Fallback to sender name if senderId is not provided
//         return getDisplaySender();
//     }


//     public Instant getTimestamp() {
//         return this.timestamp != null ? this.timestamp : Instant.now();
//     }

//     //  GETTER ĐỂ ĐẢM BẢO TYPE LUÔN CÓ GIÁ TRỊ
//     public MessageType getType() {
//         return this.type != null ? this.type : MessageType.TEXT;
//     }

//     //  GETTER ĐỂ ĐẢM BẢO ROOM ID LUÔN CÓ GIÁ TRỊ
//     public String getRoomId() {
//         return this.roomId != null ? this.roomId : "general";
//     }

//     //  METHOD ĐỂ KIỂM TRA MESSAGE CÓ HỢP LỆ KHÔNG
//     public boolean isValid() {
//         return this.id != null && 
//                !this.id.trim().isEmpty() && 
//                this.content != null && 
//                !this.content.trim().isEmpty() &&
//                getDisplaySender() != null;
//     }

//     //  METHOD ĐỂ LOG THÔNG TIN MESSAGE
//     public String toLogString() {
//         return String.format("Message[id=%s, room=%s, sender=%s, type=%s, content=%s]",
//                 id, getRoomId(), getDisplaySender(), getType(),
//                 content != null ? (content.length() > 50 ? content.substring(0, 50) + "..." : content) : "null");
//     }

//     //  THÊM METHOD ĐỂ TẠO SYSTEM MESSAGE
//     public static ChatMessage createSystemMessage(String roomId, String content) {
//         return ChatMessage.builder()
//                 .id("system_" + System.currentTimeMillis())
//                 .roomId(roomId)
//                 .sender("System")
//                 .senderId("system")
//                 .content(content)
//                 .type(MessageType.SYSTEM)
//                 .avatar("🤖")
//                 .build();
//     }

//     //  THÊM METHOD ĐỂ TẠO CALL MESSAGE
//     public static ChatMessage createCallMessage(String roomId, String sender, String senderId, MessageType callType, String action) {
//         String content = "";
//         if (callType == MessageType.VIDEO_CALL) {
//             content = action.equals("start") ? "đã bắt đầu cuộc gọi video" : "đã kết thúc cuộc gọi video";
//         } else if (callType == MessageType.VOICE_CALL) {
//             content = action.equals("start") ? "đã bắt đầu cuộc gọi thoại" : "đã kết thúc cuộc gọi thoại";
//         }
        
//         return ChatMessage.builder()
//                 .id("call_" + System.currentTimeMillis())
//                 .roomId(roomId)
//                 .sender(sender)
//                 .senderId(senderId)
//                 .content(sender + " " + content)
//                 .type(callType)
//                 .build();
//     }

//     //  THÊM METHOD ĐỂ TẠO JOIN/LEAVE MESSAGE
//     public static ChatMessage createPresenceMessage(String roomId, String username, String action) {
//         String content = action.equals("join") ? 
//             username + " đã tham gia phòng" : 
//             username + " đã rời khỏi phòng";
            
//         return ChatMessage.builder()
//                 .id("presence_" + System.currentTimeMillis())
//                 .roomId(roomId)
//                 .sender("System")
//                 .senderId("system")
//                 .content(content)
//                 .type(MessageType.SYSTEM)
//                 .avatar("👤")
//                 .build();
//     }

//     //  BUILDER PATTERN ĐỂ DỄ DÀNG TẠO MESSAGE
//     public static ChatMessageBuilder builder() {
//         return new ChatMessageBuilder();
//     }

//     public static class ChatMessageBuilder {
//         private String id;
//         private String roomId;
//         private String senderId;
//         private String senderName;
//         private String sender;
//         private String content;
//         private MessageType type = MessageType.TEXT;
//         // private LocalDateTime timestamp;
//         private Instant timestamp;
//         private String codeLanguage;
//         private String fileName;
//         private String avatar;
//         private Map<String, Object> replyTo;
//         private Map<String, Object> reactions;

//         public ChatMessageBuilder id(String id) {
//             this.id = id;
//             return this;
//         }

//         public ChatMessageBuilder roomId(String roomId) {
//             this.roomId = roomId;
//             return this;
//         }

//         public ChatMessageBuilder senderId(String senderId) {
//             this.senderId = senderId;
//             return this;
//         }

//         public ChatMessageBuilder senderName(String senderName) {
//             this.senderName = senderName;
//             return this;
//         }

//         public ChatMessageBuilder sender(String sender) {
//             this.sender = sender;
//             return this;
//         }

//         public ChatMessageBuilder content(String content) {
//             this.content = content;
//             return this;
//         }

//         public ChatMessageBuilder type(MessageType type) {
//             this.type = type;
//             return this;
//         }

//         public ChatMessageBuilder timestamp(Instant timestamp) {
//             this.timestamp = timestamp;
//             return this;
//         }

//         public ChatMessageBuilder codeLanguage(String codeLanguage) {
//             this.codeLanguage = codeLanguage;
//             return this;
//         }

//         public ChatMessageBuilder fileName(String fileName) {
//             this.fileName = fileName;
//             return this;
//         }

//         public ChatMessageBuilder avatar(String avatar) {
//             this.avatar = avatar;
//             return this;
//         }

//         public ChatMessageBuilder replyTo(Map<String, Object> replyTo) {
//             this.replyTo = replyTo;
//             return this;
//         }

//         public ChatMessageBuilder reactions(Map<String, Object> reactions) {
//             this.reactions = reactions;
//             return this;
//         }

//         public ChatMessage build() {
//             ChatMessage message = new ChatMessage();
//             message.id = this.id;
//             message.roomId = this.roomId;
//             message.senderId = this.senderId;
//             message.senderName = this.senderName;
//             message.sender = this.sender;
//             message.content = this.content;
//             message.type = this.type;
//             // message.timestamp = this.timestamp != null ? this.timestamp : LocalDateTime.now();
//             message.timestamp = this.timestamp != null ? this.timestamp : Instant.now();
//             message.codeLanguage = this.codeLanguage;
//             message.fileName = this.fileName;
//             message.avatar = this.avatar;
//             message.replyTo = this.replyTo;
//             message.reactions = this.reactions;
            
//             // AUTO-GENERATE MISSING FIELDS
//             if (message.avatar == null && message.sender != null) {
//                 message.avatar = message.sender.substring(0, 1).toUpperCase();
//             }
//             if (message.senderId == null && message.sender != null) {
//                 message.senderId = message.sender;
//             }
//             if (message.id == null) {
//                 message.id = "msg_" + System.currentTimeMillis() + "_" + Math.random();
//             }
            
//             return message;
//         }
//     }

//     public enum MessageType {
//         TEXT,
//         CODE,
//         FILE,
//         IMAGE,
//         VIDEO_CALL,
//         VOICE_CALL,
//         SYSTEM,
//         EDIT,
//         DELETE;

//         @JsonCreator
//         public static MessageType fromValue(String value) {
//             if (value == null) return TEXT;
//             try {
//                 return MessageType.valueOf(value.toUpperCase());
//             } catch (IllegalArgumentException e) {
//                 System.err.println("❌ Unknown message type: " + value + ", defaulting to TEXT");
//                 return TEXT;
//             }
//         }

//         @JsonValue
//         public String toValue() {
//             return this.name().toLowerCase();
//         }

//         // METHOD KIỂM TRA TYPE CÓ PHẢI LÀ MEDIA KHÔNG
//         public boolean isMedia() {
//             return this == IMAGE || this == FILE;
//         }

//         // METHOD KIỂM TRA TYPE CÓ PHẢI LÀ CALL KHÔNG
//         public boolean isCall() {
//             return this == VIDEO_CALL || this == VOICE_CALL;
//         }

//         //  METHOD KIỂM TRA TYPE CÓ PHẢI LÀ SYSTEM KHÔNG
//         public boolean isSystem() {
//             return this == SYSTEM;
//         }

//         // METHOD KIỂM TRA TYPE CÓ PHẢI LÀ CODE KHÔNG
//         public boolean isCode() {
//             return this == CODE;
//         }
//         public boolean isEdit() { return this == EDIT; }
//         public boolean isDelete() { return this == DELETE; }
//     }

//     //  OVERRIDE toString ĐỂ LOG DỄ ĐỌC HƠN
//     @Override
//     public String toString() {
//         return String.format(
//             "ChatMessage{id='%s', roomId='%s', sender='%s', senderId='%s', type=%s, content='%s', timestamp=%s}",
//             id, roomId, getDisplaySender(), getSenderId(), type, 
//             content != null ? (content.length() > 30 ? content.substring(0, 30) + "..." : content) : "null",
//             getTimestamp()
//         );
//     }

//     //  THÊM METHOD EQUALS VÀ HASHCODE ĐỂ SO SÁNH MESSAGE
//     @Override
//     public boolean equals(Object o) {
//         if (this == o) return true;
//         if (o == null || getClass() != o.getClass()) return false;
//         ChatMessage that = (ChatMessage) o;
//         return id != null && id.equals(that.id);
//     }

//     @Override
//     public int hashCode() {
//         return id != null ? id.hashCode() : 0;
//     }

//     // METHOD ĐỂ TẠO COPY CỦA MESSAGE
//     public ChatMessage copy() {
//         return ChatMessage.builder()
//                 .id(this.id)
//                 .roomId(this.roomId)
//                 .senderId(this.senderId)
//                 .senderName(this.senderName)
//                 .sender(this.sender)
//                 .content(this.content)
//                 .type(this.type)
//                 .timestamp(this.timestamp)
//                 .codeLanguage(this.codeLanguage)
//                 .fileName(this.fileName)
//                 .avatar(this.avatar)
//                 .replyTo(this.replyTo)
//                 .reactions(this.reactions)
//                 .build();
//     }
// }

package com.smartchat.chatfacetimesmartdev.model;

import java.time.Instant;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessage {
    private String id;
    private String roomId;
    private String senderId;
    private String senderName;
    private String sender;
    private String content;
    private MessageType type;
    private Instant timestamp;
    private String codeLanguage;
    private String fileName;
    private String avatar;
    private Map<String, Object> replyTo;
    private Map<String, Object> reactions;

    // Constructor không tham số (Bắt buộc cho Jackson và fix lỗi "found: no arguments")
    public ChatMessage() {
    }

    // Constructor đầy đủ tham số
    public ChatMessage(String id, String roomId, String senderId, String senderName, String sender, String content, MessageType type, Instant timestamp, String codeLanguage, String fileName, String avatar, Map<String, Object> replyTo, Map<String, Object> reactions) {
        this.id = id;
        this.roomId = roomId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.sender = sender;
        this.content = content;
        this.type = type;
        this.timestamp = timestamp;
        this.codeLanguage = codeLanguage;
        this.fileName = fileName;
        this.avatar = avatar;
        this.replyTo = replyTo;
        this.reactions = reactions;
    }

    // Các Getter và Setter thủ công (Fix lỗi "cannot find symbol method set...")
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    @JsonProperty("type")
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getCodeLanguage() { return codeLanguage; }
    public void setCodeLanguage(String codeLanguage) { this.codeLanguage = codeLanguage; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Map<String, Object> getReplyTo() { return replyTo; }
    public void setReplyTo(Map<String, Object> replyTo) { this.replyTo = replyTo; }

    public Map<String, Object> getReactions() { return reactions; }
    public void setReactions(Map<String, Object> reactions) { this.reactions = reactions; }

    // Enum MessageType
    public enum MessageType {
        TEXT, CODE, FILE, IMAGE, VIDEO_CALL, VOICE_CALL, SYSTEM, EDIT, DELETE, REACTION;

        @JsonCreator
        public static MessageType fromValue(String value) {
            if (value == null) return TEXT;
            try {
                return MessageType.valueOf(value.toUpperCase());
            } catch (IllegalArgumentException e) {
                return TEXT;
            }
        }

        @JsonValue
        public String toValue() {
            return this.name().toLowerCase();
        }
        
        // Helper methods cho enum
        public boolean isMedia() { return this == IMAGE || this == FILE; }
        public boolean isCall() { return this == VIDEO_CALL || this == VOICE_CALL; }
        public boolean isSystem() { return this == SYSTEM; }
        public boolean isCode() { return this == CODE; }
        public boolean isEdit() { return this == EDIT; }
        public boolean isDelete() { return this == DELETE; }
    }
}