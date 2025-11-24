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
    private final Map<String, Set<String>> waitingUsers = new ConcurrentHashMap<>();

    public RoomDto createRoom(RoomCreateDto createDto) {
        RoomDto room = new RoomDto();
        room.setId(createDto.getRoomId());
        room.setName(createDto.getName());
        room.setHostId(createDto.getHostId());
        room.setHostName(createDto.getHostName());
        room.setPrivate(createDto.isPrivate());
        room.setApprovedUsers(new HashSet<>());
        room.setParticipants(new HashSet<>());
        room.setWaitingUsers(new HashSet<>());
        
        room.getApprovedUsers().add(createDto.getHostId());
        
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
        waitingUsers.put(createDto.getRoomId(), new HashSet<>());
        
        return room;
    }

    public RoomJoinDto joinRoom(String roomId, RoomJoinDto joinDto) {
        RoomDto room = rooms.get(roomId);
        if (room == null) {
            throw new RuntimeException("Room not found: " + roomId);
        }
        
        String userId = joinDto.getUserId();
        
        if (room.getMaxParticipants() > 0 && 
            roomParticipants.get(roomId).size() >= room.getMaxParticipants()) {
            throw new RuntimeException("Room is full: " + roomId);
        }
        
        if (room.isLocked()) {
            throw new RuntimeException("Room is locked: " + roomId);
        }
        
        if (room.isPrivate() && !room.getApprovedUsers().contains(userId)) {
            waitingUsers.get(roomId).add(userId);
            room.getWaitingUsers().add(userId);
            return joinDto;
        }
        
        roomParticipants.computeIfAbsent(roomId, k -> new HashSet<>()).add(userId);
        room.getParticipants().add(userId);
        room.setUpdatedAt(java.time.LocalDateTime.now());
        
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
        
        Set<String> waiting = waitingUsers.get(roomId);
        if (waiting != null) {
            waiting.remove(userId);
        }
        if (room != null && room.getWaitingUsers() != null) {
            room.getWaitingUsers().remove(userId);
        }
        
        if (participants != null && participants.isEmpty() && 
            (waiting == null || waiting.isEmpty())) {
            rooms.remove(roomId);
            roomParticipants.remove(roomId);
            waitingUsers.remove(roomId);
        }
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
            if (room.getApprovedUsers() == null) {
                room.setApprovedUsers(new HashSet<>());
            }
            room.getApprovedUsers().add(userId);
            
            if (room.getWaitingUsers() != null) {
                room.getWaitingUsers().remove(userId);
            }
            
            Set<String> waiting = waitingUsers.get(roomId);
            if (waiting != null) {
                waiting.remove(userId);
            }
            
            room.setUpdatedAt(java.time.LocalDateTime.now());
        }
    }

    public void rejectUser(String roomId, String userId) {
        RoomDto room = rooms.get(roomId);
        if (room != null) {
            if (room.getWaitingUsers() != null) {
                room.getWaitingUsers().remove(userId);
            }
            
            Set<String> waiting = waitingUsers.get(roomId);
            if (waiting != null) {
                waiting.remove(userId);
            }
            
            room.setUpdatedAt(java.time.LocalDateTime.now());
        }
    }

    public Set<String> getWaitingUsers(String roomId) {
        return waitingUsers.getOrDefault(roomId, new HashSet<>());
    }

    public boolean isUserInRoom(String roomId, String userId) {
        Set<String> participants = roomParticipants.get(roomId);
        return participants != null && participants.contains(userId);
    }

    public boolean isUserApproved(String roomId, String userId) {
        RoomDto room = rooms.get(roomId);
        return room != null && room.getApprovedUsers() != null && 
               room.getApprovedUsers().contains(userId);
    }

    public boolean isUserWaiting(String roomId, String userId) {
        Set<String> waiting = waitingUsers.get(roomId);
        return waiting != null && waiting.contains(userId);
    }

    public int getRoomParticipantCount(String roomId) {
        Set<String> participants = roomParticipants.get(roomId);
        return participants != null ? participants.size() : 0;
    }

    public List<RoomDto> getAllRooms() {
        return new ArrayList<>(rooms.values());
    }

    public void deleteRoom(String roomId, String hostId) {
        RoomDto room = rooms.get(roomId);
        if (room != null && room.getHostId().equals(hostId)) {
            rooms.remove(roomId);
            roomParticipants.remove(roomId);
            waitingUsers.remove(roomId);
        } else {
            throw new RuntimeException("Only host can delete room or room not found");
        }
    }

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
        }
        return room;
    }

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