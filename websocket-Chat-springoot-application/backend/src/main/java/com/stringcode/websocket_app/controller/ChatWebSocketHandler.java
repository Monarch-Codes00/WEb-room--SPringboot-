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
    
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        WebSocketMessageDto wsMessage =
                objectMapper.readValue(message.getPayload(), WebSocketMessageDto.class);

        if (wsMessage.getType() == MessageType.JOIN || wsMessage.getType() == MessageType.LOGIN) {
            String username = null;
            if (wsMessage.getPayload() instanceof Map) {
                Map<String, Object> payload = (Map<String, Object>) wsMessage.getPayload();
                username = (String) payload.get("username");
            }
            if (username == null) {
                username = wsMessage.getSenderName();
            }
            if (username != null) {
                chatService.register(session, username);
            }
        }
        
        chatService.handleMessage(session, wsMessage);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        chatService.unregister(session);
    }
}
