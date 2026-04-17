package com.unipulse.backend.dto;

import com.unipulse.backend.enums.ResourceStatus;
import com.unipulse.backend.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceResponse {

    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private String availabilityWindows;
    private ResourceStatus status;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
