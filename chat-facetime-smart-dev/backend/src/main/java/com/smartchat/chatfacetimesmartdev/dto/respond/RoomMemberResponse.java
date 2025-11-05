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
public class RoomMemberResponse {
    private Long id;
    private UserResponse user;
    private String role;
    private LocalDateTime joinedAt;
    private LocalDateTime lastSeen;
}