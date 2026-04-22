package com.unipulse.backend.dto;

import com.unipulse.backend.enums.TechnicianType;
import com.unipulse.backend.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TicketRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 200, message = "Location must be between 3 and 200 characters")
    private String location;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 1000, message = "Description must be between 20 and 1000 characters")
    private String description;

    @NotBlank(message = "Preferred contact is required")
    @Pattern(
        regexp = "^(?:[0-9\\s\\-\\+\\(\\)]{10,20}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$",
        message = "Please enter a valid phone number or email address"
    )
    private String preferredContact;

    @NotBlank(message = "Created by is required")
    private String createdBy;

    private String assignedTechnician;

    private TechnicianType technicianType;

    private Long createdByUserId;
}
//git