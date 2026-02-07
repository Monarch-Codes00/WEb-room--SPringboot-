package com.stringcode.websocket_app.dto;

import com.stringcode.websocket_app.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessageDto {
    private MessageType type;
    private Object payload;
    private LocalDateTime timestamp;
    private String senderId;
    private String senderName;
}