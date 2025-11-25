package com.smartchat.chatfacetimesmartdev.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import lombok.Data;

@Data
public class RoomDto {
    private String id;
    private String name;
    private String description;
    private String hostId;
    private String hostName;
    private boolean isPrivate;
    private boolean isActive = true;
    private boolean isLocked = false;
    private int maxParticipants = 50;
    private boolean allowScreenShare = true;
    private boolean allowChat = true;
    private Set<String> participants = new HashSet<>();
    private Set<String> approvedUsers = new HashSet<>();
    private Set<String> waitingUsers = new HashSet<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RoomDto() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public RoomDto(String id, String name, String hostId, String hostName) {
        this();
        this.id = id;
        this.name = name;
        this.hostId = hostId;
        this.hostName = hostName;
    }

    public RoomDto(String id, String name, String description, String hostId, String hostName, 
                  boolean isPrivate, int maxParticipants, boolean allowScreenShare, boolean allowChat) {
        this();
        this.id = id;
        this.name = name;
        this.description = description;
        this.hostId = hostId;
        this.hostName = hostName;
        this.isPrivate = isPrivate;
        this.maxParticipants = maxParticipants;
        this.allowScreenShare = allowScreenShare;
        this.allowChat = allowChat;
    }

    public String getRoomId() {
        return this.id;
    }

    public void setRoomId(String roomId) {
        this.id = roomId;
    }

    public boolean isEmpty() {
        return participants == null || participants.isEmpty();
    }

    public boolean isFull() {
        return participants != null && maxParticipants > 0 && participants.size() >= maxParticipants;
    }

    public boolean containsUser(String userId) {
        return participants != null && participants.contains(userId);
    }

    public boolean isUserApproved(String userId) {
        return approvedUsers != null && approvedUsers.contains(userId);
    }

    public boolean isUserWaiting(String userId) {
        return waitingUsers != null && waitingUsers.contains(userId);
    }

    public boolean addParticipant(String userId) {
        if (participants == null) {
            participants = new HashSet<>();
        }
        updatedAt = LocalDateTime.now();
        return participants.add(userId);
    }

    public boolean removeParticipant(String userId) {
        if (participants != null) {
            updatedAt = LocalDateTime.now();
            return participants.remove(userId);
        }
        return false;
    }

    public boolean approveUser(String userId) {
        if (approvedUsers == null) {
            approvedUsers = new HashSet<>();
        }
        if (waitingUsers != null) {
            waitingUsers.remove(userId);
        }
        updatedAt = LocalDateTime.now();
        return approvedUsers.add(userId);
    }

    public boolean addWaitingUser(String userId) {
        if (waitingUsers == null) {
            waitingUsers = new HashSet<>();
        }
        updatedAt = LocalDateTime.now();
        return waitingUsers.add(userId);
    }

    public boolean removeWaitingUser(String userId) {
        if (waitingUsers != null) {
            updatedAt = LocalDateTime.now();
            return waitingUsers.remove(userId);
        }
        return false;
    }

    public int getParticipantCount() {
        return participants != null ? participants.size() : 0;
    }

    public int getWaitingUserCount() {
        return waitingUsers != null ? waitingUsers.size() : 0;
    }

    @Override
    public String toString() {
        return String.format(
            "RoomDto{id='%s', name='%s', host='%s', private=%s, participants=%d, waiting=%d, active=%s}",
            id, name, hostName, isPrivate, getParticipantCount(), getWaitingUserCount(), isActive
        );
    }
}