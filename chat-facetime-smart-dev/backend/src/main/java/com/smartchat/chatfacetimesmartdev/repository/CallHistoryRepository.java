package com.smartchat.chatfacetimesmartdev.repository;

import com.smartchat.chatfacetimesmartdev.entity.CallHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CallHistoryRepository extends JpaRepository<CallHistory, Long> {
    
    /**
     * Tìm cuộc gọi đang diễn ra trong một phòng
     */
    @Query("SELECT c FROM CallHistory c WHERE c.roomId = :roomId AND c.status = 'ongoing' ORDER BY c.startedAt DESC")
    List<CallHistory> findOngoingCallsByRoomId(@Param("roomId") String roomId);
    
    /**
     * Tìm lịch sử cuộc gọi của một phòng
     */
    @Query("SELECT c FROM CallHistory c WHERE c.roomId = :roomId ORDER BY c.startedAt DESC")
    List<CallHistory> findByRoomIdOrderByStartedAtDesc(@Param("roomId") String roomId);
    
    /**
     * Tìm cuộc gọi đang diễn ra của một người dùng trong phòng
     */
    @Query("SELECT c FROM CallHistory c WHERE c.roomId = :roomId AND c.initiator.id = :userId AND c.status = 'ongoing' ORDER BY c.startedAt DESC")
    Optional<CallHistory> findOngoingCallByRoomAndUser(@Param("roomId") String roomId, @Param("userId") Long userId);
}
