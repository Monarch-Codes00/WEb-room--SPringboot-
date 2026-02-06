package com.stringcode.websocket_app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringcode.websocket_app.dto.ChatMessageDto;

import com.stringcode.websocket_app.enums.MessageType;
import com.stringcode.websocket_app.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

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

        ChatMessageDto chatMessage =
                objectMapper.readValue(message.getPayload(), ChatMessageDto.class);

        if (chatMessage.getType() == MessageType.JOIN) {
            chatService.register(session, chatMessage.getSender());
        } else {
            chatService.handleMessage(session, chatMessage);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        chatService.unregister(session);
    }
}
