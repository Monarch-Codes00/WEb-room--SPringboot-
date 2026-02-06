package com.aptech.presence.service;

import com.aptech.presence.model.Message;
import com.aptech.presence.model.MessageType;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.stream.Collectors;

@Service
public class RoomService {

    // Session ID -> WebSocketSession
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    
    // Session ID -> Username
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();
    
    // Room Name -> Set of Usernames
    private final Map<String, Set<String>> roomUsersMap = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Register a connection
    public void addSession(WebSocketSession session) {
        sessions.put(session.getId(), session);
    }

    public void removeSession(WebSocketSession session) {
        String sessionId = session.getId();
        String username = sessionUserMap.get(sessionId);
        
        sessions.remove(sessionId);
        sessionUserMap.remove(sessionId);

        if (username != null) {
            // Remove user from all rooms
            removeUserFromAllRooms(username);
            System.out.println("User disconnected: " + username);
        }
    }

    public void registerUser(String sessionId, String username) {
        sessionUserMap.put(sessionId, username);
    }

    public void joinRoom(String username, String roomName) {
        roomUsersMap.computeIfAbsent(roomName, k -> new CopyOnWriteArraySet<>()).add(username);
        
        // Broadcast to room that user joined
        broadcastToRoom(roomName, Message.builder()
                .type(MessageType.SYSTEM)
                .room(roomName)
                .data(username + " joined the room")
                .timestamp(System.currentTimeMillis())
                .build());
    }

    public void leaveRoom(String username, String roomName) {
        Set<String> users = roomUsersMap.get(roomName);
        if (users != null) {
            users.remove(username);
            if (users.isEmpty()) {
                roomUsersMap.remove(roomName);
            } else {
                // Broadcast to room that user left
                broadcastToRoom(roomName, Message.builder()
                        .type(MessageType.SYSTEM)
                        .room(roomName)
                        .data(username + " left the room")
                        .timestamp(System.currentTimeMillis())
                        .build());
            }
        }
    }

    private void removeUserFromAllRooms(String username) {
        roomUsersMap.forEach((room, users) -> {
            if (users.remove(username)) {
                broadcastToRoom(room, Message.builder()
                        .type(MessageType.SYSTEM)
                        .room(room)
                        .data(username + " disconnected")
                        .timestamp(System.currentTimeMillis())
                        .build());
            }
        });
        // Remove empty rooms
        roomUsersMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }

    public Set<String> getUsersInRoom(String roomName) {
        return roomUsersMap.getOrDefault(roomName, Collections.emptySet());
    }

    public Set<String> getOnlineUsers() {
        return new HashSet<>(sessionUserMap.values());
    }

    public void broadcastToRoom(String roomName, Message message) {
        Set<String> users = roomUsersMap.get(roomName);
        if (users == null) return;

        // Find sessions for these users
        // Note: This iterates all sessions to find matches. 
        // Optimized: Maintain Username -> Set<SessionId> map if scaling is needed.
        // For this task, iterating or reverse lookup is acceptable but let's be efficient.
        // We will iterate sessions since we store SessionId -> Username.
        
        sessions.values().forEach(session -> {
            String user = sessionUserMap.get(session.getId());
            if (users.contains(user) && session.isOpen()) {
                sendMessage(session, message);
            }
        });
    }

    public void sendMessage(WebSocketSession session, Message message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            synchronized (session) { // WebSocketSession is not thread-safe for sending
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(json));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
