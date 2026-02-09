package com.stringcode.websocket_app.controller;

import com.stringcode.websocket_app.model.ChatMessage;
import com.stringcode.websocket_app.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/{roomId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable String roomId) {
        return ResponseEntity.ok(chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId));
    }
}
