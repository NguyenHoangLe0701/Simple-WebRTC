package com.smartchat.chatfacetimesmartdev.repository;

import com.smartchat.chatfacetimesmartdev.entity.Room;
import com.smartchat.chatfacetimesmartdev.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByName(String name);
    List<Room> findByType(RoomType type);
    List<Room> findByIsActiveTrue();

    @Query("SELECT r FROM Room r WHERE r.isActive = true AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Room> searchActiveRooms(@Param("query") String query);

    @Query("SELECT r FROM Room r JOIN r.members rm WHERE rm.user.id = :userId AND r.isActive = true")
    List<Room> findActiveRoomsByUserId(@Param("userId") Long userId);

    boolean existsByNameAndIsActiveTrue(String name);
}