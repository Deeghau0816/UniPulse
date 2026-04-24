package com.unipulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompleteProfileRequest {

    @NotBlank
    private String sliitId;

    @NotBlank
    private String role;
}