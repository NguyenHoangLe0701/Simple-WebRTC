package com.smartchat.chatfacetimesmartdev.service;

import com.smartchat.chatfacetimesmartdev.entity.CallHistory;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.CallHistoryRepository;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CallService {
    
    private final CallHistoryRepository callHistoryRepository;
    private final UserRepository userRepository;
    
    /**
     * Bắt đầu một cuộc gọi mới
     */
    @Transactional
    public CallHistory startCall(String roomId, Long initiatorId, String callType) {
        User initiator = userRepository.findById(initiatorId)
                .orElseThrow(() -> new RuntimeException("Initiator not found"));
        
        CallHistory callHistory = CallHistory.builder()
                .roomId(roomId)
                .initiator(initiator)
                .callType(callType)
                .startedAt(LocalDateTime.now())
                .status("ongoing")
                .build();
        
        return callHistoryRepository.save(callHistory);
    }
    
    /**
     * Kết thúc cuộc gọi
     */
    @Transactional
    public CallHistory endCall(String roomId, Long initiatorId) {
        Optional<CallHistory> ongoingCall = callHistoryRepository.findOngoingCallByRoomAndUser(roomId, initiatorId);
        
        if (ongoingCall.isEmpty()) {
            // Nếu không tìm thấy cuộc gọi đang diễn ra, tìm cuộc gọi gần nhất
            List<CallHistory> recentCalls = callHistoryRepository.findOngoingCallsByRoomId(roomId);
            if (!recentCalls.isEmpty()) {
                CallHistory call = recentCalls.get(0);
                return endCallById(call.getId());
            }
            throw new RuntimeException("No ongoing call found");
        }
        
        return endCallById(ongoingCall.get().getId());
    }
    
    /**
     * Kết thúc cuộc gọi theo ID
     */
    @Transactional
    public CallHistory endCallById(Long callId) {
        CallHistory callHistory = callHistoryRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        LocalDateTime endedAt = LocalDateTime.now();
        callHistory.setEndedAt(endedAt);
        callHistory.setStatus("completed");
        
        // Tính duration
        if (callHistory.getStartedAt() != null) {
            Duration duration = Duration.between(callHistory.getStartedAt(), endedAt);
            callHistory.setDurationSeconds(duration.getSeconds());
        }
        
        return callHistoryRepository.save(callHistory);
    }
}
