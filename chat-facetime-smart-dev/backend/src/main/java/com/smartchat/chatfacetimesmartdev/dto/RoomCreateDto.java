package com.smartchat.chatfacetimesmartdev.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RoomCreateDto {
    
    @NotBlank(message = "Room name is required")
    @Size(min = 1, max = 100, message = "Room name must be between 1 and 100 characters")
    private String name;
    
    private String description;
    private boolean isPublic = true;
    
    // THÊM CÁC FIELD MỚI
    private String roomId;
    private String hostId;
    private String hostName;
    private boolean isPrivate;
    private int maxParticipants = 50;
    private boolean allowScreenShare = true;
    private boolean allowChat = true;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    // THÊM GETTER/SETTER CHO CÁC FIELD MỚI
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getHostId() { return hostId; }
    public void setHostId(String hostId) { this.hostId = hostId; }

    public String getHostName() { return hostName; }
    public void setHostName(String hostName) { this.hostName = hostName; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean isPrivate) { this.isPrivate = isPrivate; }

    public int getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(int maxParticipants) { this.maxParticipants = maxParticipants; }

    public boolean isAllowScreenShare() { return allowScreenShare; }
    public void setAllowScreenShare(boolean allowScreenShare) { this.allowScreenShare = allowScreenShare; }

    public boolean isAllowChat() { return allowChat; }
    public void setAllowChat(boolean allowChat) { this.allowChat = allowChat; }
}