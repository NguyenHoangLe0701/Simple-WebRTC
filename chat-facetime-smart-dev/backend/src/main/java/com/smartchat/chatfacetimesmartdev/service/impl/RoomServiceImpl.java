package com.smartchat.chatfacetimesmartdev.service.impl;


import com.smartchat.chatfacetimesmartdev.dto.request.RoomRequest;
import com.smartchat.chatfacetimesmartdev.dto.respond.MessageResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.RoomMemberResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.RoomResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.UserResponse;
import com.smartchat.chatfacetimesmartdev.entity.Room;
import com.smartchat.chatfacetimesmartdev.entity.RoomMember;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.enums.RoomType;
import com.smartchat.chatfacetimesmartdev.exception.AppException;
import com.smartchat.chatfacetimesmartdev.exception.ErrorCode;
import com.smartchat.chatfacetimesmartdev.repository.MessageRepository;
import com.smartchat.chatfacetimesmartdev.repository.RoomMemberRepository;
import com.smartchat.chatfacetimesmartdev.repository.RoomRepository;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;
import com.smartchat.chatfacetimesmartdev.service.Interface.RoomService;
import com.smartchat.chatfacetimesmartdev.service.websocket.WebSocketMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final WebSocketMessageService webSocketMessageService;

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request, Long userId) {
        // Check if room name already exists
        if (roomRepository.existsByNameAndIsActiveTrue(request.getName())) {
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Room room = Room.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType() != null ? request.getType() : RoomType.GENERAL)
                .createdBy(user)
                .isActive(true)
                .build();

        Room savedRoom = roomRepository.save(room);

        // Add creator as admin member
        RoomMember creatorMember = RoomMember.builder()
                .room(savedRoom)
                .user(user)
                .role("ADMIN")
                .build();
        roomMemberRepository.save(creatorMember);

        log.info("Room created: {} by user: {}", savedRoom.getName(), user.getUsername());
        return convertToRoomResponse(savedRoom);
    }

    @Override
    @Transactional
    public void deleteRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Check if user is admin
        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));

        if (!"ADMIN".equals(member.getRole())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        room.setIsActive(false);
        roomRepository.save(room);

        log.info("Room deleted: {} by user: {}", room.getName(), userId);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!room.getIsActive()) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }

        return convertToRoomResponse(room);
    }

    @Override
    public List<RoomResponse> getAllRooms() {
        return List.of();
    }

    @Override
    public List<RoomResponse> getUserRooms(Long userId) {
        return List.of();
    }

    @Override
    public List<RoomResponse> searchRooms(String query) {
        return List.of();
    }

    @Override
    @Transactional
    public RoomMemberResponse joinRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Check if already a member
        if (roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new AppException(ErrorCode.ROOM_MEMBER_EXISTS);
        }

        RoomMember member = RoomMember.builder()
                .room(room)
                .user(user)
                .role("MEMBER")
                .build();

        RoomMember savedMember = roomMemberRepository.save(member);
        RoomMemberResponse response = convertToRoomMemberResponse(savedMember);

        // Broadcast user joined event
        webSocketMessageService.broadcastUserJoined(room, user, response);

        log.info("User {} joined room {}", user.getUsername(), room.getName());
        return response;
    }

    @Override
    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_MEMBER_NOT_FOUND));

        roomMemberRepository.delete(member);

        // Broadcast user left event
        webSocketMessageService.broadcastUserLeft(room, user);

        log.info("User {} left room {}", user.getUsername(), room.getName());
    }

    @Override
    public List<RoomMemberResponse> getRoomMembers(Long roomId) {
        return List.of();
    }

    @Override
    public boolean isUserMember(Long roomId, Long userId) {
        return false;
    }

    @Override
    public Page<MessageResponse> getRoomMessages(Long roomId, Pageable pageable) {
        return null;
    }

    @Override
    public List<MessageResponse> searchMessagesInRoom(Long roomId, String query) {
        return List.of();
    }

    @Override
    public Long getRoomMemberCount(Long roomId) {
        return 0L;
    }

    @Override
    public Long getRoomMessageCount(Long roomId) {
        return 0L;
    }

    @Override
    public void broadcastRoomUpdate(Long roomId) {

    }

    @Override
    public void broadcastRoomDeletion(Long roomId) {

    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long roomId, RoomRequest request, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Check if user is admin of the room
        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));

        if (!"ADMIN".equals(member.getRole())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Check if new name is available
        if (!room.getName().equals(request.getName()) &&
                roomRepository.existsByNameAndIsActiveTrue(request.getName())) {
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        }

        room.setName(request.getName());
        room.setDescription(request.getDescription());
        if (request.getType() != null) {
            room.setType(request.getType());
        }

        Room updatedRoom = roomRepository.save(room);

        // Broadcast room update
        webSocketMessageService.broadcastRoomUpdated(updatedRoom);

        return convertToRoomResponse(updatedRoom);
    }


    // Implement other methods similarly...

    private RoomResponse convertToRoomResponse(Room room) {
        Long memberCount = roomMemberRepository.countActiveMembersByRoomId(room.getId());
        Long messageCount = messageRepository.countByRoomIdAndDeletedFalse(room.getId());

        UserResponse createdBy = UserResponse.builder()
                .id(room.getCreatedBy().getId())
                .username(room.getCreatedBy().getUsername())
                .fullName(room.getCreatedBy().getFullName())
                .email(room.getCreatedBy().getEmail())
                .build();

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .type(room.getType())
                .createdBy(createdBy)
                .createdAt(room.getCreatedAt())
                .isActive(room.getIsActive())
                .memberCount(memberCount)
                .messageCount(messageCount)
                .build();
    }


    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .build();
    }

    private RoomMemberResponse convertToRoomMemberResponse(RoomMember member) {
        if (member == null) return null;

        return RoomMemberResponse.builder()
                .id(member.getId())
                .user(convertToUserResponse(member.getUser()))
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .lastSeen(member.getLastSeen())
                .build();
    }


}