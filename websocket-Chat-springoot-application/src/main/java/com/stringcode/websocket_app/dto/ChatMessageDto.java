package com.stringcode.websocket_app.dto;

import com.stringcode.websocket_app.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {

    private MessageType type;   // JOIN, CHAT, LEAVE
    private String sender;      // username
    private String content;     // actual message
}
