package com.unipulse.backend.dto;

import com.unipulse.backend.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;
}