package com.stringcode.websocket_app.controller;

import com.stringcode.websocket_app.dto.WebSocketMessageDto;
import com.stringcode.websocket_app.enums.MessageType;
import com.stringcode.websocket_app.service.PresenceService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class PresenceController {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public PresenceController(PresenceService presenceService, SimpMessagingTemplate messagingTemplate) {
        this.presenceService = presenceService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/join")
    public void joinRoom(@Payload WebSocketMessageDto message) {
        presenceService.addUserToRoom(message.getSender(), message.getRoom());
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoom(), message);
    }

    @MessageMapping("/leave")
    public void leaveRoom(@Payload WebSocketMessageDto message) {
        presenceService.removeUserFromRoom(message.getSender(), message.getRoom());
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoom(), message);
    }

    @MessageMapping("/ping")
    public void ping(@Payload WebSocketMessageDto message) {
        presenceService.updateLastSeen(message.getSender());
    }

    @MessageMapping("/room-presence")
    public void getRoomPresence(@Payload WebSocketMessageDto message) {
        messagingTemplate.convertAndSendToUser(
            message.getSender(), "/queue/room-presence",
            presenceService.getUsersInRoom(message.getRoom())
        );
    }

    @MessageMapping("/online-users")
    public void getOnlineUsers(@Payload WebSocketMessageDto message) {
        messagingTemplate.convertAndSendToUser(
            message.getSender(), "/queue/online-users",
            presenceService.getOnlineUsers()
        );
    }
}