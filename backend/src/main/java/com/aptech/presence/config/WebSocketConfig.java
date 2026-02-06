package com.aptech.presence.config;

import com.aptech.presence.handler.PresenceWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final PresenceWebSocketHandler presenceWebSocketHandler;

    public WebSocketConfig(PresenceWebSocketHandler presenceWebSocketHandler) {
        this.presenceWebSocketHandler = presenceWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(presenceWebSocketHandler, "/ws")
                .setAllowedOrigins("*"); 
    }
}
