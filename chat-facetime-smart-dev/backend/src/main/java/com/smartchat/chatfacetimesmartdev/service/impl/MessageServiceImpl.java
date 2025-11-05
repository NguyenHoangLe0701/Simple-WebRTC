package com.smartchat.chatfacetimesmartdev.service.impl;

import com.smartchat.chatfacetimesmartdev.dto.request.MessageRequest;
import com.smartchat.chatfacetimesmartdev.dto.respond.MessageResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.RoomResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.UserResponse;
import com.smartchat.chatfacetimesmartdev.entity.Message;
import com.smartchat.chatfacetimesmartdev.entity.Room;
import com.smartchat.chatfacetimesmartdev.entity.RoomMember;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.exception.AppException;
import com.smartchat.chatfacetimesmartdev.exception.ErrorCode;
import com.smartchat.chatfacetimesmartdev.repository.MessageRepository;
import com.smartchat.chatfacetimesmartdev.repository.RoomMemberRepository;
import com.smartchat.chatfacetimesmartdev.repository.RoomRepository;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;
import com.smartchat.chatfacetimesmartdev.service.Interface.MessageService;
import com.smartchat.chatfacetimesmartdev.service.websocket.WebSocketMessageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
    private MessageRepository messageRepository;
    private RoomRepository roomRepository;
    private UserRepository userRepository;
    private RoomMemberRepository roomMemberRepository;

    @Lazy
    private WebSocketMessageService webSocketMessageService;

    // Setter injection cho tất cả các dependency
    @Autowired
    public void setMessageRepository(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Autowired
    public void setRoomRepository(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setRoomMemberRepository(RoomMemberRepository roomMemberRepository) {
        this.roomMemberRepository = roomMemberRepository;
    }

    @Autowired
    public void setWebSocketMessageService(WebSocketMessageService webSocketMessageService) {
        this.webSocketMessageService = webSocketMessageService;
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(Long roomId, MessageRequest request, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!room.getIsActive()) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }

        // Check if user is member of the room
        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new AppException(ErrorCode.ROOM_ACCESS_DENIED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Message message = Message.builder()
                .content(request.getContent())
                .type(request.getType())
                .language(request.getLanguage())
                .fileName(request.getFileName())
                .fileUrl(request.getFileUrl())
                .fileSize(request.getFileSize())
                .mimeType(request.getMimeType())
                .room(room)
                .user(user)
                .deleted(false)
                .build();

        // Handle reply
        if (request.getReplyToId() != null) {
            Message replyTo = messageRepository.findById(request.getReplyToId())
                    .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));
            message.setReplyTo(replyTo);
        }

        Message savedMessage = messageRepository.save(message);
        log.info("Message sent by user {} in room {}: {}", userId, roomId, message.getId());

        // Broadcast the new message to all room members
        webSocketMessageService.broadcastNewMessage(savedMessage, room);

        return convertToMessageResponse(savedMessage);
    }

    @Override
    public MessageResponse getMessageById(Long messageId) {
        return null;
    }

    @Override
    public Page<MessageResponse> getRoomMessages(Long roomId, Pageable pageable) {
        return null;
    }

    @Override
    public List<MessageResponse> searchMessages(Long roomId, String query) {
        return List.of();
    }

    @Override
    @Transactional
    public MessageResponse updateMessage(Long messageId, MessageRequest request, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        // Check if user owns the message
        if (!message.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.MESSAGE_ACCESS_DENIED);
        }

        message.setContent(request.getContent());
        message.setType(request.getType());
        message.setLanguage(request.getLanguage());
        message.setFileName(request.getFileName());

        Message updatedMessage = messageRepository.save(message);

        // Broadcast message update
        webSocketMessageService.broadcastMessageUpdated(updatedMessage, message.getRoom());

        return convertToMessageResponse(updatedMessage);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        // Check if user owns the message or is room admin
        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(message.getRoom().getId(), userId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));

        boolean canDelete = message.getUser().getId().equals(userId) || "ADMIN".equals(member.getRole());
        if (!canDelete) {
            throw new AppException(ErrorCode.MESSAGE_ACCESS_DENIED);
        }

        message.setDeleted(true);
        message.setContent("[Message deleted]");
        messageRepository.save(message);

        // Broadcast message deletion
        webSocketMessageService.broadcastMessageDeleted(messageId, message.getRoom().getId(), userId);
    }

    @Override
    @Transactional
    public MessageResponse addReaction(Long messageId, String reaction, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        message.addReaction(reaction);
        Message updatedMessage = messageRepository.save(message);

        // Broadcast reaction
        webSocketMessageService.broadcastMessageReaction(messageId, message.getRoom().getId(), reaction, user, true);

        return convertToMessageResponse(updatedMessage);
    }

    @Override
    @Transactional
    public MessageResponse removeReaction(Long messageId, String reaction, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        message.removeReaction(reaction);
        Message updatedMessage = messageRepository.save(message);

        // Broadcast reaction removal
        webSocketMessageService.broadcastMessageReaction(messageId, message.getRoom().getId(), reaction, user, false);

        return convertToMessageResponse(updatedMessage);
    }

    @Override
    public List<MessageResponse> getUserMessagesInRoom(Long roomId, Long userId) {
        return List.of();
    }


    private MessageResponse convertToMessageResponse(Message message) {
        if (message == null) return null;

        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .type(message.getType())
                .language(message.getLanguage())
                .fileName(message.getFileName())
                .fileUrl(message.getFileUrl())
                .fileSize(message.getFileSize())
                .mimeType(message.getMimeType())
                .user(convertToUserResponse(message.getUser()))
                .room(convertToRoomResponse(message.getRoom()))
                .replyTo(convertToMessageResponse(message.getReplyTo())) // đệ quy
                .reactions(message.getReactionsMap())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .deleted(message.getDeleted())
                .build();
    }

    private UserResponse convertToUserResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .build();
    }

    // Chuyển Room entity → RoomResponse
    private RoomResponse convertToRoomResponse(Room room) {
        if (room == null) return null;

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .type(room.getType())
                .build();
    }

    // ... other methods
}