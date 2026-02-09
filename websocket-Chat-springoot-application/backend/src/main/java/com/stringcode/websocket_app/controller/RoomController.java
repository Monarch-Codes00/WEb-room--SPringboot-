package com.stringcode.websocket_app.controller;

import com.stringcode.websocket_app.model.Room;
import com.stringcode.websocket_app.model.User;
import com.stringcode.websocket_app.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(
            @AuthenticationPrincipal User user,
            @RequestBody Room room
    ) {
        room.setRoomId(UUID.randomUUID().toString());
        room.setCreatedBy(user);
        room.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(roomRepository.save(room));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<Room> getRoom(@PathVariable String roomId) {
        return roomRepository.findByRoomId(roomId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
