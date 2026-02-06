package com.stringcode.websocket_app.controller;

import com.stringcode.websocket_app.dto.MessageDto;
import com.stringcode.websocket_app.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @MessageMapping("/join")
    public void joinRoom(@Payload MessageDto message, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        // Add username to session attributes for interceptors/listeners if needed
        if (headerAccessor.getSessionAttributes() != null) {
            headerAccessor.getSessionAttributes().put("username", message.getSender());
        }
        roomService.joinRoom(sessionId, message);
    }

    @MessageMapping("/leave")
    public void leaveRoom(@Payload MessageDto message, SimpMessageHeaderAccessor headerAccessor) {
        roomService.leaveRoom(headerAccessor.getSessionId(), message);
    }

    @MessageMapping("/heartbeat")
    public void heartbeat(@Payload MessageDto message) {
        roomService.updateHeartbeat(message);
    }

    @MessageMapping("/get-room-presence")
    public void getRoomPresence(@Payload MessageDto message) {
        roomService.broadcastRoomPresence(message.getRoomId());
    }

    @MessageMapping("/get-online-users")
    public void getOnlineUsers() {
        roomService.broadcastOnlineUsers();
    }
}
