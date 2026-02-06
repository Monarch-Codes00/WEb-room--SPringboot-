package com.example.websocket.controller;

import com.example.websocket.dto.MessageDTO;
import com.example.websocket.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/join")
    public void joinRoom(@Payload MessageDTO message) {
        roomService.addUserToRoom(message.getUsername(), message.getRoom());
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoom(), message.getUsername() + " joined the room.");
    }
}