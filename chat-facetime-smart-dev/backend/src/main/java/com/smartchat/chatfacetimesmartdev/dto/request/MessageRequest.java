package com.smartchat.chatfacetimesmartdev.dto.request;

import com.smartchat.chatfacetimesmartdev.enums.MessageType;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


@Data
public class MessageRequest {
    @NotBlank(message = "Message content is required")
    private String content;

    @NotNull(message = "Message type is required")
    private MessageType type;

    private String language;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String mimeType;
    private Long replyToId;
}