package com.smartchat.chatfacetimesmartdev.dto.respond;


import java.time.LocalDateTime;

import com.smartchat.chatfacetimesmartdev.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO dùng để trả thông tin người dùng ra API (ẩn password)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;

    // Nếu bạn có thuộc tính status trong User (VD: "ONLINE", "OFFLINE", ...)
    private UserStatus status;

    // Nếu cần thông tin thêm
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
}
