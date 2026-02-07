package com.stringcode.websocket_app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringcode.websocket_app.dto.WebSocketMessageDto;
import com.stringcode.websocket_app.enums.MessageType;
import com.stringcode.websocket_app.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // username will be sent as first JOIN message
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

        WebSocketMessageDto wsMessage =
                objectMapper.readValue(message.getPayload(), WebSocketMessageDto.class);

        if (wsMessage.getType() == MessageType.JOIN) {
            // In the frontend, JOIN payload contains { username, roomId }
            if (wsMessage.getPayload() instanceof Map) {
                Map<String, Object> payload = (Map<String, Object>) wsMessage.getPayload();
                String username = (String) payload.get("username");
                chatService.register(session, username);
            } else {
                chatService.register(session, wsMessage.getSenderName());
            }
        } else {
            // Need to adjust ChatService.handleMessage to take WebSocketMessageDto or convert
            // For now, let's keep it simple or update ChatService too
            chatService.handleMessage(session, wsMessage);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        chatService.unregister(session);
    }
}
