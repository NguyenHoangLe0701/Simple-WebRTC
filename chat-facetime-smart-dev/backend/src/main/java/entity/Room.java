package entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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

    @ElementCollection
    @CollectionTable(name = "room_participants", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "user_id")
    private List<String> participants = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_approved_users", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "user_id")
    private List<String> approvedUsers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_waiting_users", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "user_id")
    private List<String> waitingUsers = new ArrayList<>();

    @Column(nullable = false)
    private boolean allowScreenShare = true;

    @Column(nullable = false)
    private boolean allowChat = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
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

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
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

    // Helper methods
    public void addParticipant(String userId) {
        if (!participants.contains(userId)) {
            participants.add(userId);
        }
    }

    public void removeParticipant(String userId) {
        participants.remove(userId);
    }

    public void addWaitingUser(String userId) {
        if (!waitingUsers.contains(userId)) {
            waitingUsers.add(userId);
        }
    }

    public void removeWaitingUser(String userId) {
        waitingUsers.remove(userId);
    }

    public void approveUser(String userId) {
        removeWaitingUser(userId);
        if (!approvedUsers.contains(userId)) {
            approvedUsers.add(userId);
        }
    }

    public boolean isUserApproved(String userId) {
        return approvedUsers.contains(userId) || hostId.equals(userId);
    }

    public boolean canJoin(String userId) {
        return !isLocked && 
               participants.size() < maxParticipants && 
               (isUserApproved(userId) || !isPrivate);
    }
}
