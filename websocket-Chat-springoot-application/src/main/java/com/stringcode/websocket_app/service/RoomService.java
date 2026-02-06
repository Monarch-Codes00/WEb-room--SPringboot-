package com.stringcode.websocket_app.service;

import com.stringcode.websocket_app.dto.MessageDto;
import com.stringcode.websocket_app.enums.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoomService {

    private final SimpMessagingTemplate messagingTemplate;

    // Thread-safe collections
    // Map<SessionId, Username>
    private final Map<String, String> sessionIdToUser = new ConcurrentHashMap<>();
    
    // Map<Username, RoomId>
    private final Map<String, String> userToRoom = new ConcurrentHashMap<>();
    
    // Map<RoomId, Set<Username>>
    private final Map<String, Set<String>> roomToUsers = new ConcurrentHashMap<>();
    
    // Set<Username>
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    public void joinRoom(String sessionId, MessageDto message) {
        String username = message.getSender();
        String roomId = message.getRoomId();

        // 1. Remove from previous room if any
        if (userToRoom.containsKey(username)) {
            leaveRoom(sessionId, MessageDto.builder()
                    .sender(username)
                    .roomId(userToRoom.get(username))
                    .build());
        }

        // 2. Update state
        sessionIdToUser.put(sessionId, username);
        userToRoom.put(username, roomId);
        onlineUsers.add(username);

        roomToUsers.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(username);

        // 3. Broadcast JOIN message to the room
        MessageDto joinMessage = MessageDto.builder()
                .type(MessageType.JOIN)
                .sender(username)
                .roomId(roomId)
                .content(username + " joined the room")
                .timestamp(LocalDateTime.now())
                .onlineCount(onlineUsers.size())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId, joinMessage);
        
        // 4. Send updated presence list to the room
        broadcastRoomPresence(roomId);
        
        // 5. Broadcast global online users update (optional, but requested req 5)
        broadcastOnlineUsers();
    }

    public void leaveRoom(String sessionId, MessageDto message) {
        String username = message.getSender();
        String roomId = message.getRoomId();

        if (username != null && roomId != null) {
             removeUserFromRoom(sessionId, username, roomId);
        }
    }

    public void handleDisconnect(String sessionId) {
        String username = sessionIdToUser.get(sessionId);
        if (username != null) {
            String roomId = userToRoom.get(username);
            if (roomId != null) {
                removeUserFromRoom(sessionId, username, roomId);
            }
            sessionIdToUser.remove(sessionId);
            onlineUsers.remove(username);
            broadcastOnlineUsers();
        }
    }

    private void removeUserFromRoom(String sessionId, String username, String roomId) {
        // Remove from room map
        Set<String> users = roomToUsers.get(roomId);
        if (users != null) {
            users.remove(username);
            if (users.isEmpty()) {
                roomToUsers.remove(roomId);
            }
        }
        
        userToRoom.remove(username);

        // Broadcast LEAVE
        MessageDto leaveMessage = MessageDto.builder()
                .type(MessageType.LEAVE)
                .sender(username)
                .roomId(roomId)
                .content(username + " left the room")
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveMessage);
        
        // Update presence
        broadcastRoomPresence(roomId);
    }

    public void updateHeartbeat(MessageDto message) {
        // In a real app, you might update a "lastSeen" timestamp map.
        // For this task, we assume simple presence.
        // potentially just echo back a PONG or ignore if just keeping connection alive
        // But we can ensure they are marked online.
        if (!onlineUsers.contains(message.getSender())) {
            onlineUsers.add(message.getSender());
            broadcastOnlineUsers();
        }
    }

    public void broadcastRoomPresence(String roomId) {
        Set<String> users = roomToUsers.getOrDefault(roomId, Collections.emptySet());
        
        MessageDto presenceMessage = MessageDto.builder()
                .type(MessageType.ROOM_PRESENCE)
                .roomId(roomId)
                .userList(new ArrayList<>(users))
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/room/" + roomId, presenceMessage);
    }

    public void broadcastOnlineUsers() {
        MessageDto onlineMessage = MessageDto.builder()
                .type(MessageType.ONLINE_USERS)
                .userList(new ArrayList<>(onlineUsers))
                .onlineCount(onlineUsers.size())
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/public", onlineMessage);
    }
}
