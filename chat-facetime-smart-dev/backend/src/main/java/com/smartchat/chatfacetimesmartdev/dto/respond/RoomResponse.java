package com.smartchat.chatfacetimesmartdev.dto.respond;

import com.smartchat.chatfacetimesmartdev.enums.RoomType;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String name;
    private String description;
    private RoomType type;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private Long memberCount;
    private Long messageCount;
}