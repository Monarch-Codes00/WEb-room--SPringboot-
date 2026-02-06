package com.stringcode.websocket_app.service;

import com.stringcode.websocket_app.dto.ChatMessageDto;
import org.springframework.web.socket.WebSocketSession;

public interface ChatService {

    void register(WebSocketSession session, String username);

    void unregister(WebSocketSession session);

    void handleMessage(WebSocketSession session, ChatMessageDto message);
}