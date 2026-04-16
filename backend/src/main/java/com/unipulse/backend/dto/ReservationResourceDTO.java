package com.unipulse.backend.dto;

import com.unipulse.backend.model.ReservationResource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResourceDTO {
    private Long id;
    private String name;
    private ReservationResource.ResourceType type;
    private Integer capacity;
    private String location;
    private String availabilityWindows;
    private ReservationResource.ResourceStatus status;
}
