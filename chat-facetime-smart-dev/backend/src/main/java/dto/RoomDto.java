package dto;

import java.time.LocalDateTime;
import java.util.List;

public class RoomDto {
    private String id;
    private String name;
    private String description;
    private String hostId;
    private String hostName;
    private boolean isPrivate;
    private boolean isActive;
    private boolean isLocked;
    private int maxParticipants;
    private List<String> participants;
    private List<String> approvedUsers;
    private List<String> waitingUsers;
    private boolean allowScreenShare;
    private boolean allowChat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public RoomDto() {}

    public RoomDto(String id, String name, String description, String hostId, String hostName) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.hostId = hostId;
        this.hostName = hostName;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHostId() {
        return hostId;
    }

    public void setHostId(String hostId) {
        this.hostId = hostId;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean aPrivate) {
        isPrivate = aPrivate;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public boolean isLocked() {
        return isLocked;
    }

    public void setLocked(boolean locked) {
        isLocked = locked;
    }

    public int getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(int maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public List<String> getParticipants() {
        return participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }

    public List<String> getApprovedUsers() {
        return approvedUsers;
    }

    public void setApprovedUsers(List<String> approvedUsers) {
        this.approvedUsers = approvedUsers;
    }

    public List<String> getWaitingUsers() {
        return waitingUsers;
    }

    public void setWaitingUsers(List<String> waitingUsers) {
        this.waitingUsers = waitingUsers;
    }

    public boolean isAllowScreenShare() {
        return allowScreenShare;
    }

    public void setAllowScreenShare(boolean allowScreenShare) {
        this.allowScreenShare = allowScreenShare;
    }

    public boolean isAllowChat() {
        return allowChat;
    }

    public void setAllowChat(boolean allowChat) {
        this.allowChat = allowChat;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
