package com.smartchat.chatfacetimesmartdev.repository;

import com.smartchat.chatfacetimesmartdev.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {

    // Tìm RoomMember theo roomId và userId
    Optional<RoomMember> findByRoomIdAndUserId(Long roomId, Long userId);

    // Lấy tất cả RoomMember theo roomId
    List<RoomMember> findByRoomId(Long roomId);

    // Lấy tất cả RoomMember theo userId
    List<RoomMember> findByUserId(Long userId);

    // Lấy tất cả RoomMember mà Room và User đều active
    @Query("SELECT rm FROM RoomMember rm WHERE rm.room.id = :roomId AND rm.room.isActive = true AND rm.user.isActive = true")
    List<RoomMember> findActiveMembersByRoomId(@Param("roomId") Long roomId);

    // Kiểm tra RoomMember có tồn tại
    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    // Đếm RoomMember mà Room active
    @Query("SELECT COUNT(rm) FROM RoomMember rm WHERE rm.room.id = :roomId AND rm.room.isActive = true")
    Long countActiveMembersByRoomId(@Param("roomId") Long roomId);

    // Xóa RoomMember theo roomId và userId
    void deleteByRoomIdAndUserId(Long roomId, Long userId);

    // Lấy tất cả RoomMember của user với Room active
    List<RoomMember> findByUserIdAndRoomIsActiveTrue(Long userId);
}
