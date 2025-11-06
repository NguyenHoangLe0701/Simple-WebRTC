package com.smartchat.chatfacetimesmartdev.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import lombok.Data;

@Data
public class RoomDto {
    private String id; // 🆕 ĐỔI TÊN từ roomId -> id để đồng bộ
    private String name;
    private String description;
    private String hostId;
    private String hostName;
    private boolean isPrivate;
    private boolean isActive = true; // 🆕 THÊM
    private boolean isLocked = false; // 🆕 THÊM
    private int maxParticipants = 50;
    private boolean allowScreenShare = true;
    private boolean allowChat = true;
    private Set<String> participants = new HashSet<>(); // 🆕 THÊM
    private Set<String> approvedUsers = new HashSet<>(); // 🆕 THÊM
    private Set<String> waitingUsers = new HashSet<>(); // 🆕 THÊM
    private LocalDateTime createdAt; // 🆕 THÊM
    private LocalDateTime updatedAt; // 🆕 THÊM

    // 🆕 CONSTRUCTORS
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

    // 🆕 GETTER CHO ROOM ID (COMPATIBILITY)
    public String getRoomId() {
        return this.id;
    }

    // 🆕 SETTER CHO ROOM ID (COMPATIBILITY)
    public void setRoomId(String roomId) {
        this.id = roomId;
    }

    // 🆕 METHOD KIỂM TRA ROOM CÓ TRỐNG KHÔNG
    public boolean isEmpty() {
        return participants == null || participants.isEmpty();
    }

    // 🆕 METHOD KIỂM TRA ROOM CÓ ĐẦY KHÔNG
    public boolean isFull() {
        return participants != null && maxParticipants > 0 && participants.size() >= maxParticipants;
    }

    // 🆕 METHOD KIỂM TRA USER CÓ TRONG ROOM KHÔNG
    public boolean containsUser(String userId) {
        return participants != null && participants.contains(userId);
    }

    // 🆕 METHOD KIỂM TRA USER CÓ ĐƯỢC APPROVE KHÔNG
    public boolean isUserApproved(String userId) {
        return approvedUsers != null && approvedUsers.contains(userId);
    }

    // 🆕 METHOD KIỂM TRA USER CÓ ĐANG CHỜ DUYỆT KHÔNG
    public boolean isUserWaiting(String userId) {
        return waitingUsers != null && waitingUsers.contains(userId);
    }

    // 🆕 METHOD THÊM PARTICIPANT
    public boolean addParticipant(String userId) {
        if (participants == null) {
            participants = new HashSet<>();
        }
        updatedAt = LocalDateTime.now();
        return participants.add(userId);
    }

    // 🆕 METHOD XÓA PARTICIPANT
    public boolean removeParticipant(String userId) {
        if (participants != null) {
            updatedAt = LocalDateTime.now();
            return participants.remove(userId);
        }
        return false;
    }

    // 🆕 METHOD APPROVE USER
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

    // 🆕 METHOD ADD WAITING USER
    public boolean addWaitingUser(String userId) {
        if (waitingUsers == null) {
            waitingUsers = new HashSet<>();
        }
        updatedAt = LocalDateTime.now();
        return waitingUsers.add(userId);
    }

    // 🆕 METHOD REMOVE WAITING USER
    public boolean removeWaitingUser(String userId) {
        if (waitingUsers != null) {
            updatedAt = LocalDateTime.now();
            return waitingUsers.remove(userId);
        }
        return false;
    }

    // 🆕 METHOD GET PARTICIPANT COUNT
    public int getParticipantCount() {
        return participants != null ? participants.size() : 0;
    }

    // 🆕 METHOD GET WAITING USER COUNT
    public int getWaitingUserCount() {
        return waitingUsers != null ? waitingUsers.size() : 0;
    }

    // 🆕 METHOD TO STRING FOR DEBUGGING
    @Override
    public String toString() {
        return String.format(
            "RoomDto{id='%s', name='%s', host='%s', private=%s, participants=%d, waiting=%d, active=%s}",
            id, name, hostName, isPrivate, getParticipantCount(), getWaitingUserCount(), isActive
        );
    }
}