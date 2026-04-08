package com.unipulse.backend.dto;

import com.unipulse.backend.entity.TicketMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
    
    @NotBlank(message = "Sender name is required")
    @Size(max = 100, message = "Sender name must be less than 100 characters")
    private String senderName;
    
    @NotNull(message = "Sender role is required")
    private TicketMessage.SenderRole senderRole;
    
    @NotBlank(message = "Message content is required")
    @Size(max = 1000, message = "Message content must be less than 1000 characters")
    private String messageContent;
}
