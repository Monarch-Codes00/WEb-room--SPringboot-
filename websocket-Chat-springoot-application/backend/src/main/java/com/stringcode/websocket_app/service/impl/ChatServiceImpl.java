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
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatServiceImpl.class);
    private final ObjectMapper objectMapper;

    // session → username mapping
    private final Map<WebSocketSession, String> sessions = new ConcurrentHashMap<>();
    
    // username -> room mapping
    private final Map<String, String> userToRoom = new ConcurrentHashMap<>();
    
    // roomId -> Set of usernames
    private final Map<String, Set<String>> roomToUsers = new ConcurrentHashMap<>();

    @Override
    public void register(WebSocketSession session, String username) {
        sessions.put(session, username);
        logger.info("User registered: {}", username);
        broadcastOnlineUsers();
    }

    @Override
    public void unregister(WebSocketSession session) {
        String username = sessions.remove(session);
        if (username != null) {
            String roomId = userToRoom.remove(username);
            if (roomId != null) {
                Set<String> users = roomToUsers.get(roomId);
                if (users != null) {
                    users.remove(username);
                }
                broadcastToRoom(roomId, new WebSocketMessageDto(
                        MessageType.LEAVE,
                        Map.of("username", username, "roomId", roomId),
                        LocalDateTime.now(),
                        "SYSTEM",
                        "SYSTEM"
                ));
                broadcastRoomPresence(roomId);
            }
            logger.info("User unregistered: {}", username);
            broadcastOnlineUsers();
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessageDto message) {
        String username = sessions.get(session);
        if (username == null) return;

        switch (message.getType()) {
            case LOGIN:
                broadcastOnlineUsers();
                break;
            case JOIN:
                handleJoin(session, message);
                break;
            case LEAVE:
                handleLeave(session, message);
                break;
            case CHAT:
                String roomId = userToRoom.get(username);
                if (roomId != null) {
                    broadcastToRoom(roomId, message);
                }
                break;
            case ONLINE_USERS:
                broadcastOnlineUsers(); 
                break;
            case ROOM_PRESENCE:
                if (message.getPayload() instanceof Map) {
                    Map<String, Object> payload = (Map<String, Object>) message.getPayload();
                    String rId = (String) payload.get("roomId");
                    if (rId != null) broadcastRoomPresence(rId);
                }
                break;
            case PING:
                
                break;
            default:
                logger.warn("Unhandled message type: {}", message.getType());
        }
    }

    private void handleJoin(WebSocketSession session, WebSocketMessageDto message) {
        if (!(message.getPayload() instanceof Map)) return;
        Map<String, Object> payload = (Map<String, Object>) message.getPayload();
        String username = (String) payload.get("username");
        String roomId = (String) payload.get("roomId");

   
        String oldRoom = userToRoom.get(username);
        if (oldRoom != null && !oldRoom.equals(roomId)) {
            Set<String> oldUsers = roomToUsers.get(oldRoom);
            if (oldUsers != null) {
                oldUsers.remove(username);
                broadcastToRoom(oldRoom, new WebSocketMessageDto(
                        MessageType.LEAVE,
                        Map.of("username", username, "roomId", oldRoom),
                        LocalDateTime.now(),
                        "SYSTEM",
                        "SYSTEM"
                ));
                broadcastRoomPresence(oldRoom);
            }
        }

        userToRoom.put(username, roomId);
        roomToUsers.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(username);

        WebSocketMessageDto response = new WebSocketMessageDto(
                MessageType.JOIN,
                Map.of("username", username, "roomId", roomId),
                LocalDateTime.now(),
                "SYSTEM",
                "SYSTEM"
        );
        broadcastToRoom(roomId, response);
        broadcastRoomPresence(roomId);
        broadcastOnlineUsers();
    }

    private void handleLeave(WebSocketSession session, WebSocketMessageDto message) {
        if (!(message.getPayload() instanceof Map)) return;
        Map<String, Object> payload = (Map<String, Object>) message.getPayload();
        String username = (String) payload.get("username");
        String roomId = (String) payload.get("roomId");

        userToRoom.remove(username);
        Set<String> users = roomToUsers.get(roomId);
        if (users != null) {
            users.remove(username);
        }

        broadcastToRoom(roomId, new WebSocketMessageDto(
                MessageType.LEAVE,
                Map.of("username", username, "roomId", roomId),
                LocalDateTime.now(),
                "SYSTEM",
                "SYSTEM"
        ));
        broadcastRoomPresence(roomId);
        broadcastOnlineUsers();
    }

    private void broadcastRoomPresence(String roomId) {
        Set<String> usernames = roomToUsers.getOrDefault(roomId, Collections.emptySet());
        List<Map<String, String>> users = usernames.stream()
                .map(u -> Map.of("username", u, "status", "online"))
                .collect(Collectors.toList());

        broadcastToRoom(roomId, new WebSocketMessageDto(
                MessageType.ROOM_PRESENCE,
                Map.of("roomId", roomId, "users", users),
                LocalDateTime.now(),
                "SYSTEM",
                "SYSTEM"
        ));
    }

    private void broadcastOnlineUsers() {
        WebSocketMessageDto message = new WebSocketMessageDto(
                MessageType.ONLINE_USERS,
                Map.of("users", getOnlineUsersList()),
                LocalDateTime.now(),
                "SYSTEM",
                "SYSTEM"
        );
        
        sessions.keySet().forEach(session -> {
            if (session.isOpen()) {
                sendToSession(session, message);
            }
        });
    }

    private List<Map<String, String>> getOnlineUsersList() {
       
        Map<String, Map<String, String>> uniqueUsers = new HashMap<>();
        
        sessions.values().forEach(u -> {
            String room = userToRoom.get(u);
            Map<String, String> userMap = new HashMap<>();
            userMap.put("username", u);
            userMap.put("status", "online");
            if (room != null) {
                userMap.put("currentRoom", room);
            }
            uniqueUsers.put(u, userMap);
        });
        
        return new ArrayList<>(uniqueUsers.values());
    }

    private void broadcastToRoom(String roomId, WebSocketMessageDto message) {
        Set<String> roomUsernames = roomToUsers.getOrDefault(roomId, Collections.emptySet());
        sessions.forEach((session, username) -> {
            if (roomUsernames.contains(username) && session.isOpen()) {
                sendToSession(session, message);
            }
        });
    }

    private void sendToSession(WebSocketSession session, WebSocketMessageDto message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
        }
        try {
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
        } catch (Exception e) {
            logger.error("Failed to send message to session: {}", session.getId(), e);
        }
    }
}
