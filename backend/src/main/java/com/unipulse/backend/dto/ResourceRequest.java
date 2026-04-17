package com.unipulse.backend.dto;

import com.unipulse.backend.enums.ResourceStatus;
import com.unipulse.backend.enums.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Description is required")
    private String description;

    private String availabilityWindows;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private String imageUrl;
}
