package com.smartchat.chatfacetimesmartdev.entity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartchat.chatfacetimesmartdev.enums.MessageType;
import lombok.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    // For code messages
    private String language;
    private String fileName;

    // For file messages
    private String fileUrl;
    private Long fileSize;
    private String mimeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Reply functionality
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_id")
    private Message replyTo;

    // Reactions stored as JSON: {"👍": 2, "❤️": 1}
    @Column(columnDefinition = "TEXT")
    private String reactions;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Builder.Default
    private Boolean deleted = false;

    // Helper method to handle reactions
    public void addReaction(String emoji) {
        Map<String, Integer> reactionMap = getReactionsMap();
        reactionMap.put(emoji, reactionMap.getOrDefault(emoji, 0) + 1);
        setReactionsMap(reactionMap);
    }

    public void removeReaction(String emoji) {
        Map<String, Integer> reactionMap = getReactionsMap();
        reactionMap.remove(emoji);
        setReactionsMap(reactionMap);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Integer> getReactionsMap() {
        if (this.reactions == null || this.reactions.trim().isEmpty()) {
            return new HashMap<>();
        }
        try {
            return new ObjectMapper().readValue(this.reactions, HashMap.class);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    public void setReactionsMap(Map<String, Integer> reactions) {
        try {
            this.reactions = new ObjectMapper().writeValueAsString(reactions);
        } catch (Exception e) {
            this.reactions = "{}";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}