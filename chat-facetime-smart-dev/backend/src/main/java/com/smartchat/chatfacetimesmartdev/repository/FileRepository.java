package com.smartchat.chatfacetimesmartdev.repository;
import com.smartchat.chatfacetimesmartdev.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    Optional<FileEntity> findByStoredName(String storedName);
    List<FileEntity> findByRoomIdAndIsActiveTrue(Long roomId);
    List<FileEntity> findByUploadedByIdAndIsActiveTrue(Long userId);

    @Query("SELECT f FROM FileEntity f WHERE f.isActive = true AND (" +
           "LOWER(f.originalName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.mimeType) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<FileEntity> searchFiles(@Param("query") String query);

    @Query("SELECT SUM(f.size) FROM FileEntity f WHERE f.room.id = :roomId AND f.isActive = true")
    Long getTotalStorageUsedByRoom(@Param("roomId") Long roomId);
}