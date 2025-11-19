package com.smartchat.chatfacetimesmartdev.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartchat.chatfacetimesmartdev.entity.LoginSession;
import com.smartchat.chatfacetimesmartdev.entity.LoginSession.SessionStatus;

@Repository
public interface    LoginSessionRepository extends JpaRepository<LoginSession, Long> {
    
    Optional<LoginSession> findBySessionId(String sessionId);
    
    @Query("SELECT ls FROM LoginSession ls WHERE ls.user.id = :userId")
    List<LoginSession> findByUserId(@Param("userId") Long userId);
    
    List<LoginSession> findByStatus(SessionStatus status);
    
    @Query("SELECT ls FROM LoginSession ls WHERE ls.user.id = :userId AND ls.status = :status")
    List<LoginSession> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") SessionStatus status);
    
    @Query("SELECT ls FROM LoginSession ls WHERE ls.status = :status ORDER BY ls.lastActivity DESC")
    List<LoginSession> findByStatusOrderByLastActivityDesc(@Param("status") SessionStatus status);
    
    @Query("SELECT ls FROM LoginSession ls WHERE ls.user.id = :userId AND ls.status = :status ORDER BY ls.lastActivity DESC")
    List<LoginSession> findByUserIdAndStatusOrderByLastActivityDesc(@Param("userId") Long userId, @Param("status") SessionStatus status);
    
    @Query("SELECT COUNT(ls) FROM LoginSession ls WHERE ls.status = :status")
    long countByStatus(@Param("status") SessionStatus status);
    
    @Query("SELECT COUNT(ls) FROM LoginSession ls WHERE ls.loginTime >= :startDate")
    long countSessionsSince(@Param("startDate") LocalDateTime startDate);
    
    @Modifying
    @Query("UPDATE LoginSession ls SET ls.status = :expiredStatus WHERE ls.status = :activeStatus AND ls.lastActivity < :expiryTime")
    int expireOldSessions(@Param("expiryTime") LocalDateTime expiryTime, @Param("activeStatus") SessionStatus activeStatus, @Param("expiredStatus") SessionStatus expiredStatus);
    
    @Modifying
    @Query("DELETE FROM LoginSession ls WHERE ls.status = :status AND ls.lastActivity < :deleteBefore")
    int deleteExpiredSessions(@Param("deleteBefore") LocalDateTime deleteBefore, @Param("status") SessionStatus status);

    @Query("SELECT ls.ipAddress, COUNT(ls) FROM LoginSession ls WHERE ls.ipAddress IS NOT NULL GROUP BY ls.ipAddress ORDER BY COUNT(ls) DESC")
    List<Object[]> findTopIpAddresses();

    @Query("SELECT ls.deviceInfo, COUNT(ls) FROM LoginSession ls WHERE ls.deviceInfo IS NOT NULL GROUP BY ls.deviceInfo ORDER BY COUNT(ls) DESC")
    List<Object[]> findTopDevices();
}

