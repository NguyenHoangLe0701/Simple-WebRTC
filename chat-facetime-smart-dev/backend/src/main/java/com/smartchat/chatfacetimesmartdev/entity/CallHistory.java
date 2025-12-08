package com.smartchat.chatfacetimesmartdev.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "call_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CallHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "room_id", nullable = false, length = 255)
    private String roomId;
    
    @ManyToOne
    @JoinColumn(name = "initiator_id", nullable = false)
    private User initiator;
    
    @Column(name = "call_type", nullable = false, length = 20)
    private String callType; // "video" hoặc "voice"
    
    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    
    @Column(name = "duration_seconds")
    private Long durationSeconds;
    
    @Column(name = "status", length = 20)
    private String status; // "ongoing", "completed", "missed", "cancelled"
    
    @PrePersist
    protected void onCreate() {
        if (this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "ongoing";
        }
    }
}
