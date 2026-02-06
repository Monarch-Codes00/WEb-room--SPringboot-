package com.example.websocket.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class RoomService {

    private final ConcurrentHashMap<String, CopyOnWriteArraySet<String>> roomUserMap = new ConcurrentHashMap<>();

    public void addUserToRoom(String username, String room) {
        roomUserMap.computeIfAbsent(room, k -> new CopyOnWriteArraySet<>()).add(username);
    }

    public void removeUserFromRoom(String username, String room) {
        if (roomUserMap.containsKey(room)) {
            roomUserMap.get(room).remove(username);
            if (roomUserMap.get(room).isEmpty()) {
                roomUserMap.remove(room);
            }
        }
    }
}