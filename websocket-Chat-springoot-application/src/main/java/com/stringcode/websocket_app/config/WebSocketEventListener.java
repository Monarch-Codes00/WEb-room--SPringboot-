package com.stringcode.websocket_app.config;

import com.stringcode.websocket_app.service.PresenceService;
import com.stringcode.websocket_app.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final RoomService roomService;
    private final PresenceService presenceService;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        roomService.handleDisconnect(sessionId);
        log.info("WebSocket connection closed for session: {}", sessionId);
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username != null) {
            log.info("User Disconnected: " + username);
            String room = presenceService.getUserRoom(username);
            if (room != null) {
                presenceService.removeUserFromRoom(username, room);
                // Notify others in the room
                presenceService.broadcastSystemMessage(room, username + " has left the room.");
            }
        }
    }
}
