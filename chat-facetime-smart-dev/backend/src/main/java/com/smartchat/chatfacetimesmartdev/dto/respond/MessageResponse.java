package com.smartchat.chatfacetimesmartdev.dto.respond;


import com.smartchat.chatfacetimesmartdev.enums.MessageType;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private String content;
    private MessageType type;
    private String language;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String mimeType;
    private UserResponse user;
    private RoomResponse room;
    private MessageResponse replyTo;
    private Map<String, Integer> reactions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean deleted;
}