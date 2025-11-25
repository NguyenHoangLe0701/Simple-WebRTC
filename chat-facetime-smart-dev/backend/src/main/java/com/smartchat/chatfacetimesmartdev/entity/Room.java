package com.smartchat.chatfacetimesmartdev.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roomId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String hostId;

    @Column(nullable = false)
    private String hostName;

    @Column(nullable = false)
    private boolean isPrivate = false;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private boolean isLocked = false;

    @Column(nullable = false)
    private int maxParticipants = 50;

    @Column(nullable = false)
    private boolean allowScreenShare = true;

    @Column(nullable = false)
    private boolean allowChat = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<RoomApprovedUser> approvedUsers = new HashSet<>();

    public Room() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Room(String roomId, String name, String description, String hostId, String hostName) {
        this();
        this.roomId = roomId;
        this.name = name;
        this.description = description;
        this.hostId = hostId;
        this.hostName = hostName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHostId() { return hostId; }
    public void setHostId(String hostId) { this.hostId = hostId; }

    public String getHostName() { return hostName; }
    public void setHostName(String hostName) { this.hostName = hostName; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean aPrivate) { isPrivate = aPrivate; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }

    public int getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(int maxParticipants) { this.maxParticipants = maxParticipants; }

    public boolean isAllowScreenShare() { return allowScreenShare; }
    public void setAllowScreenShare(boolean allowScreenShare) { this.allowScreenShare = allowScreenShare; }

    public boolean isAllowChat() { return allowChat; }
    public void setAllowChat(boolean allowChat) { this.allowChat = allowChat; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Set<RoomApprovedUser> getApprovedUsers() { return approvedUsers; }
    public void setApprovedUsers(Set<RoomApprovedUser> approvedUsers) { this.approvedUsers = approvedUsers; }

    public void addApprovedUser(RoomApprovedUser approvedUser) {
        approvedUsers.add(approvedUser);
    }

    public void removeApprovedUser(RoomApprovedUser approvedUser) {
        approvedUsers.remove(approvedUser);
    }
}
