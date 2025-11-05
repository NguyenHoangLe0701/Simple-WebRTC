package com.smartchat.chatfacetimesmartdev.service.Interface;


public interface WebSocketService {

    void sendToUser(Long userId, String destination, Object payload);

    void sendToRoom(Long roomId, String destination, Object payload);

    void notifyUserStatusChange(Long userId, String status);

    void notifyRoomActivity(Long roomId, String activityType, Object data);

    boolean isUserOnline(Long userId);

    int getOnlineUsersCount();
}
