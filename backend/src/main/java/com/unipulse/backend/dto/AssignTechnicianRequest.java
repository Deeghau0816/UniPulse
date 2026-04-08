package com.unipulse.backend.dto;

import com.unipulse.backend.enums.TechnicianType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignTechnicianRequest {

    @NotBlank(message = "Assigned technician is required")
    private String assignedTechnician;

    private TechnicianType technicianType;
}