package com.unipulse.backend.dto;

import com.unipulse.backend.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ResourceStatus status;
}
