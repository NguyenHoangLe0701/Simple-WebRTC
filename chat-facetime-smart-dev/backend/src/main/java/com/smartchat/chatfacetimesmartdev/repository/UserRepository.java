package com.smartchat.chatfacetimesmartdev.repository;

import java.util.List;
import java.util.Optional;

import com.smartchat.chatfacetimesmartdev.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartchat.chatfacetimesmartdev.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
    
    long countByRole(User.Role role);
}
