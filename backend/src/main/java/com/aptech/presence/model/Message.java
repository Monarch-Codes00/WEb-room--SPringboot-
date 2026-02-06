package com.aptech.presence.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private MessageType type;
    private String sender; // username
    private String room;
    private Object data; // Can hold user lists or system messages
    private long timestamp;
}
