package com.smartchat.chatfacetimesmartdev.dto.respond;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private Long id;
    private String originalName;
    private String storedName;
    private String fileUrl;
    private String mimeType;
    private Long size;
    private UserResponse uploadedBy;
    private LocalDateTime uploadedAt;
}