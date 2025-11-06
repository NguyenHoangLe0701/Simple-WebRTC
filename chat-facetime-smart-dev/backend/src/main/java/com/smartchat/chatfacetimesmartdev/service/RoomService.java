package com.smartchat.chatfacetimesmartdev.service;

import com.smartchat.chatfacetimesmartdev.dto.RoomJoinDto;
import com.smartchat.chatfacetimesmartdev.dto.RoomCreateDto;
import com.smartchat.chatfacetimesmartdev.dto.RoomDto;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {
    private final Map<String, RoomDto> rooms = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> roomParticipants = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> waitingUsers = new ConcurrentHashMap<>(); // 🆕 THÊM WAITING USERS

    public RoomDto createRoom(RoomCreateDto createDto) {
        RoomDto room = new RoomDto();
        // 🆕 SỬ DỤNG ĐÚNG SETTER TỪ RoomDto
        room.setId(createDto.getRoomId());
        room.setName(createDto.getName());
        room.setHostId(createDto.getHostId());
        room.setHostName(createDto.getHostName());
        room.setPrivate(createDto.isPrivate());
        room.setApprovedUsers(new HashSet<>());
        room.setParticipants(new HashSet<>()); // 🆕 THÊM PARTICIPANTS
        room.setWaitingUsers(new HashSet<>()); // 🆕 THÊM WAITING USERS
        
        // 🆕 THÊM HOST VÀO APPROVED USERS
        room.getApprovedUsers().add(createDto.getHostId());
        
        // 🆕 THÊM CÁC FIELD MỚI
        room.setActive(true);
        room.setLocked(false);
        room.setAllowScreenShare(createDto.isAllowScreenShare());
        room.setAllowChat(createDto.isAllowChat());
        room.setMaxParticipants(createDto.getMaxParticipants());
        room.setDescription(createDto.getDescription());
        room.setCreatedAt(java.time.LocalDateTime.now());
        room.setUpdatedAt(java.time.LocalDateTime.now());
        
        rooms.put(createDto.getRoomId(), room);
        roomParticipants.put(createDto.getRoomId(), new HashSet<>());
        waitingUsers.put(createDto.getRoomId(), new HashSet<>()); // 🆕 INIT WAITING USERS
        
        System.out.println("✅ Room created: " + createDto.getRoomId());
        debugRoomState(createDto.getRoomId());
        
        return room; // 🆕 TRẢ VỀ ROOM ĐÃ TẠO
    }

    public RoomJoinDto joinRoom(String roomId, RoomJoinDto joinDto) {
        RoomDto room = rooms.get(roomId);
        if (room == null) {
            throw new RuntimeException("Room not found: " + roomId);
        }
        
        String userId = joinDto.getUserId();
        
        // 🆕 KIỂM TRA ROOM ĐÃ ĐẦY CHƯA
        if (room.getMaxParticipants() > 0 && 
            roomParticipants.get(roomId).size() >= room.getMaxParticipants()) {
            throw new RuntimeException("Room is full: " + roomId);
        }
        
        // 🆕 KIỂM TRA ROOM CÓ BỊ KHÓA KHÔNG
        if (room.isLocked()) {
            throw new RuntimeException("Room is locked: " + roomId);
        }
        
        // 🆕 KIỂM TRA PHÒNG PRIVATE
        if (room.isPrivate() && !room.getApprovedUsers().contains(userId)) {
            // THÊM VÀO DANH SÁCH CHỜ DUYỆT
            waitingUsers.get(roomId).add(userId);
            room.getWaitingUsers().add(userId);
            System.out.println("⏳ User waiting for approval: " + userId + " -> " + roomId);
            debugRoomState(roomId);
            return joinDto; // 🆕 TRẢ VỀ MÀ KHÔNG THÊM VÀO PARTICIPANTS
        }
        
        // 🆕 THÊM VÀO PARTICIPANTS
        roomParticipants.computeIfAbsent(roomId, k -> new HashSet<>()).add(userId);
        room.getParticipants().add(userId);
        room.setUpdatedAt(java.time.LocalDateTime.now());
        
        System.out.println("✅ User joined room: " + userId + " -> " + roomId);
        debugRoomParticipants(roomId);
        debugRoomState(roomId);
        
        return joinDto;
    }

    public void leaveRoom(String roomId, String userId) {
        Set<String> participants = roomParticipants.get(roomId);
        RoomDto room = rooms.get(roomId);
        
        if (participants != null) {
            participants.remove(userId);
        }
        
        if (room != null) {
            room.getParticipants().remove(userId);
            room.setUpdatedAt(java.time.LocalDateTime.now());
        }
        
        // 🆕 XÓA KHỎI WAITING USERS NẾU CÓ
        Set<String> waiting = waitingUsers.get(roomId);
        if (waiting != null) {
            waiting.remove(userId);
        }
        if (room != null && room.getWaitingUsers() != null) {
            room.getWaitingUsers().remove(userId);
        }
        
        System.out.println("✅ User left room: " + userId + " <- " + roomId);
        
        // 🆕 NẾU ROOM TRỐNG, CÓ THỂ XÓA ROOM
        if (participants != null && participants.isEmpty() && 
            (waiting == null || waiting.isEmpty())) {
            rooms.remove(roomId);
            roomParticipants.remove(roomId);
            waitingUsers.remove(roomId);
            System.out.println("🗑️ Room removed (empty): " + roomId);
        }
        
        debugRoomParticipants(roomId);
        debugRoomState(roomId);
    }

    public RoomDto getRoomInfo(String roomId) {
        RoomDto room = rooms.get(roomId);
        if (room == null) {
            throw new RuntimeException("Room not found: " + roomId);
        }
        return room;
    }

    public void approveUser(String roomId, String userId) {
        RoomDto room = rooms.get(roomId);
        if (room != null) {
            // 🆕 THÊM VÀO APPROVED USERS
            if (room.getApprovedUsers() == null) {
                room.setApprovedUsers(new HashSet<>());
            }
            room.getApprovedUsers().add(userId);
            
            // 🆕 XÓA KHỎI WAITING USERS
            if (room.getWaitingUsers() != null) {
                room.getWaitingUsers().remove(userId);
            }
            
            Set<String> waiting = waitingUsers.get(roomId);
            if (waiting != null) {
                waiting.remove(userId);
            }
            
            room.setUpdatedAt(java.time.LocalDateTime.now());
            System.out.println("✅ User approved: " + userId + " in room " + roomId);
            debugRoomState(roomId);
        }
    }

    // 🆕 THÊM METHOD REJECT USER
    public void rejectUser(String roomId, String userId) {
        RoomDto room = rooms.get(roomId);
        if (room != null) {
            // 🆕 CHỈ XÓA KHỎI WAITING USERS
            if (room.getWaitingUsers() != null) {
                room.getWaitingUsers().remove(userId);
            }
            
            Set<String> waiting = waitingUsers.get(roomId);
            if (waiting != null) {
                waiting.remove(userId);
            }
            
            room.setUpdatedAt(java.time.LocalDateTime.now());
            System.out.println("❌ User rejected: " + userId + " in room " + roomId);
            debugRoomState(roomId);
        }
    }

    // 🆕 THÊM METHOD LẤY WAITING USERS
    public Set<String> getWaitingUsers(String roomId) {
        return waitingUsers.getOrDefault(roomId, new HashSet<>());
    }

    // 🆕 THÊM METHOD KIỂM TRA USER CÓ TRONG ROOM KHÔNG
    public boolean isUserInRoom(String roomId, String userId) {
        Set<String> participants = roomParticipants.get(roomId);
        return participants != null && participants.contains(userId);
    }

    // 🆕 THÊM METHOD KIỂM TRA USER CÓ ĐƯỢC APPROVE KHÔNG
    public boolean isUserApproved(String roomId, String userId) {
        RoomDto room = rooms.get(roomId);
        return room != null && room.getApprovedUsers() != null && 
               room.getApprovedUsers().contains(userId);
    }

    // 🆕 THÊM METHOD KIỂM TRA USER CÓ ĐANG CHỜ DUYỆT KHÔNG
    public boolean isUserWaiting(String roomId, String userId) {
        Set<String> waiting = waitingUsers.get(roomId);
        return waiting != null && waiting.contains(userId);
    }

    public int getRoomParticipantCount(String roomId) {
        Set<String> participants = roomParticipants.get(roomId);
        return participants != null ? participants.size() : 0;
    }

    // 🆕 THÊM METHOD LẤY TẤT CẢ ROOMS
    public List<RoomDto> getAllRooms() {
        return new ArrayList<>(rooms.values());
    }

    // 🆕 THÊM METHOD XÓA ROOM
    public void deleteRoom(String roomId, String hostId) {
        RoomDto room = rooms.get(roomId);
        if (room != null && room.getHostId().equals(hostId)) {
            rooms.remove(roomId);
            roomParticipants.remove(roomId);
            waitingUsers.remove(roomId);
            System.out.println("🗑️ Room deleted by host: " + roomId);
        } else {
            throw new RuntimeException("Only host can delete room or room not found");
        }
    }

    // 🆕 THÊM METHOD UPDATE ROOM SETTINGS
    public RoomDto updateRoomSettings(String roomId, RoomDto settings) {
        RoomDto room = rooms.get(roomId);
        if (room != null) {
            if (settings.getName() != null) {
                room.setName(settings.getName());
            }
            if (settings.getDescription() != null) {
                room.setDescription(settings.getDescription());
            }
            room.setPrivate(settings.isPrivate());
            room.setLocked(settings.isLocked());
            room.setAllowScreenShare(settings.isAllowScreenShare());
            room.setAllowChat(settings.isAllowChat());
            room.setMaxParticipants(settings.getMaxParticipants());
            room.setUpdatedAt(java.time.LocalDateTime.now());
            
            System.out.println("⚙️ Room settings updated: " + roomId);
            debugRoomState(roomId);
        }
        return room;
    }

    // 🆕 DEBUG METHOD
    private void debugRoomParticipants(String roomId) {
        Set<String> participants = roomParticipants.get(roomId);
        Set<String> waiting = waitingUsers.get(roomId);
        
        System.out.println("=== 🐛 ROOM PARTICIPANTS ===");
        System.out.println("Room: " + roomId);
        System.out.println("Participants count: " + (participants != null ? participants.size() : 0));
        if (participants != null) {
            participants.forEach(userId -> System.out.println(" 👤 Participant: " + userId));
        }
        System.out.println("Waiting users count: " + (waiting != null ? waiting.size() : 0));
        if (waiting != null) {
            waiting.forEach(userId -> System.out.println(" ⏳ Waiting: " + userId));
        }
        System.out.println("=============================");
    }

    // 🆕 DEBUG ROOM STATE
    private void debugRoomState(String roomId) {
        RoomDto room = rooms.get(roomId);
        if (room != null) {
            System.out.println("=== 🏠 ROOM STATE ===");
            System.out.println("ID: " + room.getId());
            System.out.println("Name: " + room.getName());
            System.out.println("Host: " + room.getHostId());
            System.out.println("Private: " + room.isPrivate());
            System.out.println("Locked: " + room.isLocked());
            System.out.println("Active: " + room.isActive());
            System.out.println("Participants: " + (room.getParticipants() != null ? room.getParticipants().size() : 0));
            System.out.println("Approved Users: " + (room.getApprovedUsers() != null ? room.getApprovedUsers().size() : 0));
            System.out.println("Waiting Users: " + (room.getWaitingUsers() != null ? room.getWaitingUsers().size() : 0));
            System.out.println("Max Participants: " + room.getMaxParticipants());
            System.out.println("Allow Screen Share: " + room.isAllowScreenShare());
            System.out.println("Allow Chat: " + room.isAllowChat());
            System.out.println("=====================");
        }
    }
}