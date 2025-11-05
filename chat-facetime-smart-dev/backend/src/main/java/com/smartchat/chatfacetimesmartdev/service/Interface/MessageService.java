package com.smartchat.chatfacetimesmartdev.service.Interface;

import com.smartchat.chatfacetimesmartdev.dto.request.MessageRequest;
import com.smartchat.chatfacetimesmartdev.dto.respond.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MessageService {
    MessageResponse sendMessage(Long roomId, MessageRequest request, Long userId);
    MessageResponse getMessageById(Long messageId);
    Page<MessageResponse> getRoomMessages(Long roomId, Pageable pageable);
    List<MessageResponse> searchMessages(Long roomId, String query);
    MessageResponse updateMessage(Long messageId, MessageRequest request, Long userId);
    void deleteMessage(Long messageId, Long userId);
    MessageResponse addReaction(Long messageId, String reaction, Long userId);
    MessageResponse removeReaction(Long messageId, String reaction, Long userId);
    List<MessageResponse> getUserMessagesInRoom(Long roomId, Long userId);
}