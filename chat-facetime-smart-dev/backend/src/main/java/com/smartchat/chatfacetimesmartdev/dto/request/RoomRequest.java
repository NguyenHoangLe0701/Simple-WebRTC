package com.smartchat.chatfacetimesmartdev.dto.request;

import com.smartchat.chatfacetimesmartdev.enums.RoomType;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RoomRequest {
    @NotBlank(message = "Room name is required")
    @Size(min = 1, max = 50, message = "Room name must be between 1 and 50 characters")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    private RoomType type;
}