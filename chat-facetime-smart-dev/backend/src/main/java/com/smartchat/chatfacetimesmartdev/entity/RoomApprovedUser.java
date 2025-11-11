package com.smartchat.chatfacetimesmartdev.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "room_approved_users")
@IdClass(RoomApprovedUserId.class)
public class RoomApprovedUser implements Serializable {

    @Id
    @Column(name = "room_id")
    private Long roomId;

    @Id
    @Column(name = "user_id")
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    private Room room;

    public RoomApprovedUser() {}

    public RoomApprovedUser(Long roomId, String userId) {
        this.roomId = roomId;
        this.userId = userId;
    }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
}
