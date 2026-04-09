package com.unipulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResolutionUpdateRequest {

    private String resolutionNotes;

    private String rejectionReason;
}