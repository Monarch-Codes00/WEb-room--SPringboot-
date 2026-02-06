package com.stringcode.websocket_app.service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final Map<String, String> userRoomMap = new ConcurrentHashMap<>();
    private final Map<String, Long> userLastSeenMap = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> roomUsersMap = new ConcurrentHashMap<>();

    public synchronized void addUserToRoom(String user, String room) {
        userRoomMap.put(user, room);
        roomUsersMap.computeIfAbsent(room, k -> ConcurrentHashMap.newKeySet()).add(user);
    }

    public synchronized void removeUserFromRoom(String user, String room) {
        userRoomMap.remove(user);
        Set<String> users = roomUsersMap.getOrDefault(room, Collections.emptySet());
        users.remove(user);
        if (users.isEmpty()) {
            roomUsersMap.remove(room);
        }
    }

    public void updateLastSeen(String user) {
        userLastSeenMap.put(user, System.currentTimeMillis());
    }

    public Set<String> getUsersInRoom(String room) {
        return roomUsersMap.getOrDefault(room, Collections.emptySet());
    }

    public Set<String> getOnlineUsers() {
        return userRoomMap.keySet();
    }

    public String getUserRoom(String user) {
        return userRoomMap.get(user);
    }

    public void broadcastSystemMessage(String room, String message) {
        // Logic to broadcast system messages to all users in the room
    }
}