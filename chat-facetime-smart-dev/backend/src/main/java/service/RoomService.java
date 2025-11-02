package service;

import dto.RoomDto;
import dto.RoomCreateDto;
import dto.RoomJoinDto;
import entity.Room;
import repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<RoomDto> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return rooms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public RoomDto getRoomInfo(String roomId) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (roomOpt.isPresent()) {
            return convertToDto(roomOpt.get());
        }
        throw new RuntimeException("Room not found");
    }

    public RoomDto createRoom(RoomCreateDto roomCreateDto) {
        // Use provided roomId or generate unique room ID
        String roomId = roomCreateDto.getRoomId() != null ? 
            roomCreateDto.getRoomId() : generateRoomId();
        
        // Check if room already exists
        Optional<Room> existing = roomRepository.findByRoomId(roomId);
        if (existing.isPresent()) {
            return convertToDto(existing.get());
        }
        
        Room room = new Room();
        room.setRoomId(roomId);
        room.setName(roomCreateDto.getName());
        room.setDescription(roomCreateDto.getDescription());
        room.setHostId(roomCreateDto.getHostId());
        room.setHostName(roomCreateDto.getHostName());
        room.setPrivate(roomCreateDto.isPrivate());
        room.setMaxParticipants(roomCreateDto.getMaxParticipants());
        room.setAllowScreenShare(roomCreateDto.isAllowScreenShare());
        room.setAllowChat(roomCreateDto.isAllowChat());
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());
        
        // Add host as approved user
        room.getApprovedUsers().add(roomCreateDto.getHostId());
        
        Room savedRoom = roomRepository.save(room);
        return convertToDto(savedRoom);
    }

    public RoomJoinDto joinRoom(String roomId, RoomJoinDto joinDto) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (!roomOpt.isPresent()) {
            throw new RuntimeException("Room not found");
        }
        
        Room room = roomOpt.get();
        
        if (room.isLocked()) {
            throw new RuntimeException("Room is locked");
        }
        
        if (room.getParticipants().size() >= room.getMaxParticipants()) {
            throw new RuntimeException("Room is full");
        }
        
        // Check if user can join
        if (room.isPrivate() && !room.isUserApproved(joinDto.getUserId())) {
            // Add to waiting list
            room.addWaitingUser(joinDto.getUserId());
            roomRepository.save(room);
            return new RoomJoinDto(joinDto.getUserId(), joinDto.getUsername(), joinDto.getFullName(), joinDto.getEmail());
        }
        
        // Add to participants
        room.addParticipant(joinDto.getUserId());
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);
        
        return joinDto;
    }

    public void approveUser(String roomId, String userId) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (!roomOpt.isPresent()) {
            throw new RuntimeException("Room not found");
        }
        
        Room room = roomOpt.get();
        room.approveUser(userId);
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);
    }

    public void rejectUser(String roomId, String userId) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (!roomOpt.isPresent()) {
            throw new RuntimeException("Room not found");
        }
        
        Room room = roomOpt.get();
        room.removeWaitingUser(userId);
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);
    }

    public void leaveRoom(String roomId, String userId) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (!roomOpt.isPresent()) {
            throw new RuntimeException("Room not found");
        }
        
        Room room = roomOpt.get();
        room.removeParticipant(userId);
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);
    }

    public void deleteRoom(String roomId, String hostId) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (!roomOpt.isPresent()) {
            throw new RuntimeException("Room not found");
        }
        
        Room room = roomOpt.get();
        if (!room.getHostId().equals(hostId)) {
            throw new RuntimeException("Only host can delete room");
        }
        
        roomRepository.delete(room);
    }

    public RoomDto updateRoomSettings(String roomId, RoomDto settingsDto) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (!roomOpt.isPresent()) {
            throw new RuntimeException("Room not found");
        }
        
        Room room = roomOpt.get();
        room.setName(settingsDto.getName());
        room.setDescription(settingsDto.getDescription());
        room.setPrivate(settingsDto.isPrivate());
        room.setMaxParticipants(settingsDto.getMaxParticipants());
        room.setAllowScreenShare(settingsDto.isAllowScreenShare());
        room.setAllowChat(settingsDto.isAllowChat());
        room.setLocked(settingsDto.isLocked());
        room.setUpdatedAt(LocalDateTime.now());
        
        Room savedRoom = roomRepository.save(room);
        return convertToDto(savedRoom);
    }

    private RoomDto convertToDto(Room room) {
        RoomDto dto = new RoomDto();
        dto.setId(room.getRoomId());
        dto.setName(room.getName());
        dto.setDescription(room.getDescription());
        dto.setHostId(room.getHostId());
        dto.setHostName(room.getHostName());
        dto.setPrivate(room.isPrivate());
        dto.setActive(room.isActive());
        dto.setLocked(room.isLocked());
        dto.setMaxParticipants(room.getMaxParticipants());
        dto.setParticipants(room.getParticipants());
        dto.setApprovedUsers(room.getApprovedUsers());
        dto.setWaitingUsers(room.getWaitingUsers());
        dto.setAllowScreenShare(room.isAllowScreenShare());
        dto.setAllowChat(room.isAllowChat());
        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());
        return dto;
    }

    private String generateRoomId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
