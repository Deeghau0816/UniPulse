package com.unipulse.backend.dto;

import lombok.Data;

@Data
public class ResolutionUpdateRequest {

    private String resolutionNotes;

    private String rejectionReason;
}