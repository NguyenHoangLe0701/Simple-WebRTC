package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.dto.ApiResponse;
import com.smartchat.chatfacetimesmartdev.dto.request.MessageRequest;
import com.smartchat.chatfacetimesmartdev.dto.respond.MessageResponse;
import com.smartchat.chatfacetimesmartdev.service.Interface.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/{roomId}")
    public ApiResponse<MessageResponse> sendMessage(
            @PathVariable Long roomId,
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal Long userId) {

        MessageResponse response = messageService.sendMessage(roomId, request, userId);
        return ApiResponse.success("Message sent successfully", response);
    }

    @GetMapping("/{messageId}")
    public ApiResponse<MessageResponse> getMessage(@PathVariable Long messageId) {
        MessageResponse response = messageService.getMessageById(messageId);
        return ApiResponse.success("Message retrieved successfully", response);
    }

    @PutMapping("/{messageId}")
    public ApiResponse<MessageResponse> updateMessage(
            @PathVariable Long messageId,
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal Long userId) {

        MessageResponse response = messageService.updateMessage(messageId, request, userId);
        return ApiResponse.success("Message updated successfully", response);
    }

    @DeleteMapping("/{messageId}")
    public ApiResponse<Void> deleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal Long userId) {

        messageService.deleteMessage(messageId, userId);
        return ApiResponse.success("Message deleted successfully", null);
    }

    @PostMapping("/{messageId}/reactions/{reaction}")
    public ApiResponse<MessageResponse> addReaction(
            @PathVariable Long messageId,
            @PathVariable String reaction,
            @AuthenticationPrincipal Long userId) {

        MessageResponse response = messageService.addReaction(messageId, reaction, userId);
        return ApiResponse.success("Reaction added successfully", response);
    }

    @DeleteMapping("/{messageId}/reactions/{reaction}")
    public ApiResponse<MessageResponse> removeReaction(
            @PathVariable Long messageId,
            @PathVariable String reaction,
            @AuthenticationPrincipal Long userId) {

        MessageResponse response = messageService.removeReaction(messageId, reaction, userId);
        return ApiResponse.success("Reaction removed successfully", response);
    }

    @GetMapping("/room/{roomId}/user/{userId}")
    public ApiResponse<List<MessageResponse>> getUserMessagesInRoom(
            @PathVariable Long roomId,
            @PathVariable Long userId) {

        List<MessageResponse> responses = messageService.getUserMessagesInRoom(roomId, userId);
        return ApiResponse.success("User messages retrieved successfully", responses);
    }
}
