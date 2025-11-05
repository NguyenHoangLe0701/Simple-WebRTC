package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.dto.ApiResponse;
import com.smartchat.chatfacetimesmartdev.dto.request.RoomRequest;
import com.smartchat.chatfacetimesmartdev.dto.respond.MessageResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.RoomMemberResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.RoomResponse;
import com.smartchat.chatfacetimesmartdev.service.Interface.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ApiResponse<List<RoomResponse>> getAllRooms() {
        List<RoomResponse> responses = roomService.getAllRooms();
        return ApiResponse.success("All rooms retrieved successfully", responses);
    }

    @GetMapping("/my")
    public ApiResponse<List<RoomResponse>> getUserRooms(@AuthenticationPrincipal Long userId) {
        List<RoomResponse> responses = roomService.getUserRooms(userId);
        return ApiResponse.success("User rooms retrieved successfully", responses);
    }

    @GetMapping("/search")
    public ApiResponse<List<RoomResponse>> searchRooms(@RequestParam String q) {
        List<RoomResponse> responses = roomService.searchRooms(q);
        return ApiResponse.success("Search rooms retrieved successfully", responses);
    }

    @PostMapping
    public ApiResponse<RoomResponse> createRoom(
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal Long userId) {

        RoomResponse response = roomService.createRoom(request, userId);
        return ApiResponse.success("Room created successfully", response);
    }

    @GetMapping("/{roomId}")
    public ApiResponse<RoomResponse> getRoom(@PathVariable Long roomId) {
        RoomResponse response = roomService.getRoomById(roomId);
        return ApiResponse.success("Room retrieved successfully", response);
    }

    @PutMapping("/{roomId}")
    public ApiResponse<RoomResponse> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal Long userId) {

        RoomResponse response = roomService.updateRoom(roomId, request, userId);
        return ApiResponse.success("Room updated successfully", response);
    }

    @DeleteMapping("/{roomId}")
    public ApiResponse<Void> deleteRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal Long userId) {

        roomService.deleteRoom(roomId, userId);
        return ApiResponse.success("Room deleted successfully", null);
    }

    @PostMapping("/{roomId}/join")
    public ApiResponse<RoomMemberResponse> joinRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal Long userId) {

        RoomMemberResponse response = roomService.joinRoom(roomId, userId);
        return ApiResponse.success("Joined room successfully", response);
    }

    @PostMapping("/{roomId}/leave")
    public ApiResponse<Void> leaveRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal Long userId) {

        roomService.leaveRoom(roomId, userId);
        return ApiResponse.success("Left room successfully", null);
    }

    @GetMapping("/{roomId}/members")
    public ApiResponse<List<RoomMemberResponse>> getRoomMembers(@PathVariable Long roomId) {
        List<RoomMemberResponse> responses = roomService.getRoomMembers(roomId);
        return ApiResponse.success("Room members retrieved successfully", responses);
    }

    @GetMapping("/{roomId}/messages")
    public ApiResponse<Page<MessageResponse>> getRoomMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> responses = roomService.getRoomMessages(roomId, pageable);
        return ApiResponse.success("Room messages retrieved successfully", responses);
    }

    @GetMapping("/{roomId}/messages/search")
    public ApiResponse<List<MessageResponse>> searchMessagesInRoom(
            @PathVariable Long roomId,
            @RequestParam String q) {

        List<MessageResponse> responses = roomService.searchMessagesInRoom(roomId, q);
        return ApiResponse.success("Messages in room searched successfully", responses);
    }
}
