package repository;

import entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    Optional<Room> findByRoomId(String roomId);
    
    List<Room> findByHostId(String hostId);
    
    List<Room> findByIsActiveTrue();
    
    List<Room> findByIsPrivateFalse();
    
    @Query("SELECT r FROM Room r WHERE r.hostId = :hostId OR :userId MEMBER OF r.participants")
    List<Room> findRoomsByUser(@Param("hostId") String hostId, @Param("userId") String userId);
    
    @Query("SELECT r FROM Room r WHERE r.name LIKE %:name% OR r.description LIKE %:description%")
    List<Room> findRoomsByNameOrDescription(@Param("name") String name, @Param("description") String description);
    
    boolean existsByRoomId(String roomId);
    
    void deleteByRoomId(String roomId);
}
