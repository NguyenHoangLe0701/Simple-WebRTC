package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.RoomService;
import dto.RoomDto;
import dto.RoomCreateDto;
import dto.RoomJoinDto;
import dto.RoomApprovalDto;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomDto>> getAllRooms() {
        try {
            List<RoomDto> rooms = roomService.getAllRooms();
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{roomId}/info")
    public ResponseEntity<RoomDto> getRoomInfo(@PathVariable String roomId) {
        try {
            RoomDto room = roomService.getRoomInfo(roomId);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<RoomDto> createRoom(@RequestBody RoomCreateDto roomCreateDto) {
        try {
            RoomDto room = roomService.createRoom(roomCreateDto);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<RoomJoinDto> joinRoom(@PathVariable String roomId, @RequestBody RoomJoinDto joinDto) {
        try {
            // Check if room exists, if not create it as public room
            try {
                roomService.getRoomInfo(roomId);
            } catch (Exception e) {
                // Room doesn't exist - auto-create as public room
                RoomCreateDto createDto = new RoomCreateDto();
                createDto.setName(roomId);
                createDto.setRoomId(roomId);
                createDto.setDescription("Auto-created room");
                createDto.setHostId(joinDto.getUserId() != null ? joinDto.getUserId() : joinDto.getUsername());
                createDto.setHostName(joinDto.getFullName() != null ? joinDto.getFullName() : joinDto.getUsername());
                createDto.setPrivate(false);
                createDto.setMaxParticipants(50);
                createDto.setAllowScreenShare(true);
                createDto.setAllowChat(true);
                roomService.createRoom(createDto);
            }
            
            RoomJoinDto result = roomService.joinRoom(roomId, joinDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/approve")
    public ResponseEntity<Void> approveUser(@PathVariable String roomId, @RequestBody RoomApprovalDto approvalDto) {
        try {
            roomService.approveUser(roomId, approvalDto.getUserId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/reject")
    public ResponseEntity<Void> rejectUser(@PathVariable String roomId, @RequestBody RoomApprovalDto approvalDto) {
        try {
            roomService.rejectUser(roomId, approvalDto.getUserId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(@PathVariable String roomId, @RequestBody RoomJoinDto leaveDto) {
        try {
            roomService.leaveRoom(roomId, leaveDto.getUserId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String roomId, @RequestParam String hostId) {
        try {
            roomService.deleteRoom(roomId, hostId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{roomId}/settings")
    public ResponseEntity<RoomDto> updateRoomSettings(@PathVariable String roomId, @RequestBody RoomDto settingsDto) {
        try {
            RoomDto room = roomService.updateRoomSettings(roomId, settingsDto);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
