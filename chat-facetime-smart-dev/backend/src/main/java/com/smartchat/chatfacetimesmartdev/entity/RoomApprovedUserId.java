package com.smartchat.chatfacetimesmartdev.entity;

import java.io.Serializable;
import java.util.Objects;

public class RoomApprovedUserId implements Serializable {
    private Long roomId;
    private String userId;

    public RoomApprovedUserId() {}

    public RoomApprovedUserId(Long roomId, String userId) {
        this.roomId = roomId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RoomApprovedUserId)) return false;
        RoomApprovedUserId that = (RoomApprovedUserId) o;
        return Objects.equals(roomId, that.roomId) &&
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomId, userId);
    }
}
