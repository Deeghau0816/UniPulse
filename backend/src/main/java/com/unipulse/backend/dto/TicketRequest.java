package com.unipulse.backend.dto;

import com.unipulse.backend.enums.TechnicianType;
import com.unipulse.backend.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Preferred contact is required")
    private String preferredContact;

    @NotBlank(message = "Created by is required")
    private String createdBy;

    private String assignedTechnician;

    private TechnicianType technicianType;
}
