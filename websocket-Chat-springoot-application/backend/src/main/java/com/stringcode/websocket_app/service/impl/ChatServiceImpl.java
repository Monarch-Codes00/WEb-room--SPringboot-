package com.stringcode.websocket_app.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringcode.websocket_app.dto.WebSocketMessageDto;
import com.stringcode.websocket_app.enums.MessageType;
import com.stringcode.websocket_app.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatServiceImpl.class);
    private final ObjectMapper objectMapper;

    // session → username mapping
    private final Map<WebSocketSession, String> sessions = new ConcurrentHashMap<>();

    @Override
    public void register(WebSocketSession session, String username) {
        sessions.put(session, username);

        broadcast(new WebSocketMessageDto(
                MessageType.JOIN,
                Map.of("username", username, "message", username + " joined the chat"),
                LocalDateTime.now(),
                "SYSTEM",
                "SYSTEM"
        ));
    }

    @Override
    public void unregister(WebSocketSession session) {
        String username = sessions.remove(session);

        if (username != null) {
            broadcast(new WebSocketMessageDto(
                    MessageType.LEAVE,
                    Map.of("username", username, "message", username + " left the chat"),
                    LocalDateTime.now(),
                    "SYSTEM",
                    "SYSTEM"
            ));
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessageDto message) {
        switch (message.getType()) {
            case CHAT:
                broadcast(message);
                break;
            case PING:
                logger.info("Received PING from user: {}", sessions.get(session));
                break;
            default:
                logger.warn("Unhandled message type: {}", message.getType());
        }
    }

    private void broadcast(WebSocketMessageDto message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
        }
        
        sessions.keySet().forEach(session -> {
            if (session.isOpen()) {
                try {
                    String json = objectMapper.writeValueAsString(message);
                    session.sendMessage(new TextMessage(json));
                } catch (Exception e) {
                    logger.error("Failed to send message to session: {}", session.getId(), e);
                }
            }
        });
    }
}
