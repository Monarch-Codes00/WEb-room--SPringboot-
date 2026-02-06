package com.stringcode.websocket_app.dto;

import com.stringcode.websocket_app.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private MessageType type;
    private String content; // For display messages
    private String sender;
    private String roomId;
    private LocalDateTime timestamp;
    
    // For Presence/Lists
    private List<String> userList;
    private int onlineCount;
}
