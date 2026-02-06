package com.aptech.presence.handler;

import com.aptech.presence.model.Message;
import com.aptech.presence.model.MessageType;
import com.aptech.presence.service.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Set;

@Component
public class PresenceWebSocketHandler extends TextWebSocketHandler {

    private final RoomService roomService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PresenceWebSocketHandler(RoomService roomService) {
        this.roomService = roomService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        roomService.addSession(session);
        System.out.println("New Connection: " + session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        roomService.removeSession(session);
        System.out.println("Closed Connection: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        try {
            Message message = objectMapper.readValue(textMessage.getPayload(), Message.class);
            
            // Basic validation
            if (message.getType() == null) return;
            
            // Set timestamp if missing
            if (message.getTimestamp() == 0) {
                message.setTimestamp(System.currentTimeMillis());
            }

            // Sync session with user if sender is provided
            if (message.getSender() != null && !message.getSender().trim().isEmpty()) {
                roomService.registerUser(session.getId(), message.getSender());
            }

            switch (message.getType()) {
                case JOIN:
                    if (message.getRoom() != null) {
                        roomService.joinRoom(message.getSender(), message.getRoom());
                        // Ack join? Usually system broadcast is enough, but personal ack is good.
                    }
                    break;
                case LEAVE:
                    if (message.getRoom() != null) {
                        roomService.leaveRoom(message.getSender(), message.getRoom());
                    }
                    break;
                case PING:
                    // Update heartbeat (handled by registerUser/interaction implicitly, or explicit method)
                    // roomService.updateHeartbeat(message.getSender()); 
                    // Echo back PONG?
                    // For now, just acknowledged.
                    break;
                case ROOM_PRESENCE:
                    if (message.getRoom() != null) {
                        Set<String> users = roomService.getUsersInRoom(message.getRoom());
                        Message response = Message.builder()
                                .type(MessageType.ROOM_PRESENCE)
                                .room(message.getRoom())
                                .data(users)
                                .timestamp(System.currentTimeMillis())
                                .build();
                        roomService.sendMessage(session, response);
                    }
                    break;
                case ONLINE_USERS:
                    Set<String> online = roomService.getOnlineUsers();
                    Message response = Message.builder()
                            .type(MessageType.ONLINE_USERS)
                            .data(online)
                            .timestamp(System.currentTimeMillis())
                            .build();
                    roomService.sendMessage(session, response);
                    break;
                default:
                    break;
            }

        } catch (Exception e) {
            e.printStackTrace();
            session.sendMessage(new TextMessage("Error processing message: " + e.getMessage()));
        }
    }
}
