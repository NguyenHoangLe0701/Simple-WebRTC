package com.smartchat.chatfacetimesmartdev.repository;

import com.smartchat.chatfacetimesmartdev.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * Tìm kiếm lịch sử tin nhắn trong một phòng, sắp xếp theo thời gian tăng dần.
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.roomId = :roomId ORDER BY m.timestamp ASC")
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(@Param("roomId") String roomId);
    
    /**
     * Tìm kiếm lịch sử tin nhắn giữa hai người dùng (cho tin nhắn trực tiếp), sắp xếp theo thời gian tăng dần.
     * Lưu ý: Nếu cần hỗ trợ tin nhắn trực tiếp, có thể tạo room với format "direct_{userId1}_{userId2}"
     */
    @Query("SELECT m FROM ChatMessage m WHERE (m.sender.id = :userId1 AND m.roomId LIKE CONCAT('direct_', :userId1, '_', :userId2)) OR (m.sender.id = :userId2 AND m.roomId LIKE CONCAT('direct_', :userId1, '_', :userId2)) ORDER BY m.timestamp ASC")
    List<ChatMessage> findDirectChatHistory(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    /**
     * Xóa tin nhắn theo id và room để đảm bảo không xóa nhầm phòng.
     * Trả về số bản ghi đã xóa để kiểm tra.
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM ChatMessage m WHERE m.id = :id AND m.roomId = :roomId")
    int deleteByIdAndRoomId(@Param("id") Long id, @Param("roomId") String roomId);
}

