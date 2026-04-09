package com.unipulse.backend.dto;

import com.unipulse.backend.entity.TicketMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    
    private Long id;
    private Long ticketId;
    private String senderName;
    private TicketMessage.SenderRole senderRole;
    private String messageContent;
    private LocalDateTime sentAt;
    
    public static MessageResponse fromEntity(TicketMessage message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setTicketId(message.getTicketId());
        response.setSenderName(message.getSenderName());
        response.setSenderRole(message.getSenderRole());
        response.setMessageContent(message.getMessageContent());
        response.setSentAt(message.getSentAt());
        return response;
    }
}
