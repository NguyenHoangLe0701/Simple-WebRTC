package com.smartchat.chatfacetimesmartdev.repository;

import com.smartchat.chatfacetimesmartdev.entity.Message;
import com.smartchat.chatfacetimesmartdev.enums.MessageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Lấy trang các message theo roomId chưa xóa, mới nhất trước
    Page<Message> findByRoomIdAndDeletedFalseOrderByCreatedAtDesc(Long roomId, Pageable pageable);

    // Lấy tất cả message theo roomId chưa xóa, sắp xếp tăng dần thời gian
    List<Message> findByRoomIdAndDeletedFalseOrderByCreatedAtAsc(Long roomId);

    // Tìm kiếm message trong room theo query (content hoặc fileName)
    @Query("SELECT m FROM Message m WHERE m.room.id = :roomId AND m.deleted = false AND (" +
           "LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.fileName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> searchInRoom(@Param("roomId") Long roomId, @Param("query") String query, Pageable pageable);

    // Lấy message theo type trước một thời điểm
    List<Message> findByTypeAndCreatedAtBefore(MessageType type, LocalDateTime date);

    // Lấy tất cả message của user trong room chưa xóa, mới nhất trước
    @Query("SELECT m FROM Message m WHERE m.room.id = :roomId AND m.user.id = :userId AND m.deleted = false ORDER BY m.createdAt DESC")
    List<Message> findUserMessagesInRoom(@Param("roomId") Long roomId, @Param("userId") Long userId);

    // Đếm số message chưa xóa trong room
    Long countByRoomIdAndDeletedFalse(Long roomId);
}
