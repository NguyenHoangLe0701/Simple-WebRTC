package com.smartchat.chatfacetimesmartdev.service.Interface;

import com.smartchat.chatfacetimesmartdev.dto.request.RoomRequest;
import com.smartchat.chatfacetimesmartdev.dto.respond.MessageResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.RoomMemberResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.RoomResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoomService {

    // Room CRUD
    RoomResponse createRoom(RoomRequest request, Long userId);
    RoomResponse updateRoom(Long roomId, RoomRequest request, Long userId);
    void deleteRoom(Long roomId, Long userId);

    // Get Room
    RoomResponse getRoomById(Long roomId);
    //RoomResponse getRoomByName(String name);
    List<RoomResponse> getAllRooms();
    List<RoomResponse> getUserRooms(Long userId);
    List<RoomResponse> searchRooms(String query);

    // Room Membership
    RoomMemberResponse joinRoom(Long roomId, Long userId);
    void leaveRoom(Long roomId, Long userId);
    List<RoomMemberResponse> getRoomMembers(Long roomId);
    boolean isUserMember(Long roomId, Long userId);

    // Messages
    Page<MessageResponse> getRoomMessages(Long roomId, Pageable pageable);
    List<MessageResponse> searchMessagesInRoom(Long roomId, String query);

    //Statistics
    Long getRoomMemberCount(Long roomId);
    Long getRoomMessageCount(Long roomId);

    //Optional / WebSocket-related notifications
    void broadcastRoomUpdate(Long roomId);
    void broadcastRoomDeletion(Long roomId);

}
