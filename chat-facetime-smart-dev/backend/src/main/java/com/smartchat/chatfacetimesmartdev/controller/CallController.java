package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.entity.CallHistory;
import com.smartchat.chatfacetimesmartdev.service.CallService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calls")
@RequiredArgsConstructor
public class CallController {

    private final CallService callService;

    /**
     * Bắt đầu cuộc gọi
     */
    @PostMapping("/start")
    public ResponseEntity<CallHistory> startCall(
            @RequestParam String roomId,
            @RequestParam String callType,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Long userId = Long.parseLong(userDetails.getUsername()); // Giả sử username là userId
            
            CallHistory callHistory = callService.startCall(roomId, userId, callType);
            return ResponseEntity.ok(callHistory);
        } catch (Exception e) {
            System.err.println("❌ Error starting call: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Kết thúc cuộc gọi
     */
    @PostMapping("/end")
    public ResponseEntity<CallHistory> endCall(
            @RequestParam String roomId,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Long userId = Long.parseLong(userDetails.getUsername());
            
            CallHistory callHistory = callService.endCall(roomId, userId);
            return ResponseEntity.ok(callHistory);
        } catch (Exception e) {
            System.err.println("❌ Error ending call: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
