package com.unipulse.backend.service;

import com.unipulse.backend.dto.ReservationResourceDTO;
import com.unipulse.backend.model.ReservationResource;

import java.util.List;

public interface ReservationResourceService {
    List<ReservationResourceDTO> getAllResources();
    List<ReservationResourceDTO> getActiveResources();
    List<ReservationResourceDTO> searchResources(ReservationResource.ResourceType type, String location);
    ReservationResourceDTO getResourceById(Long id);
    ReservationResourceDTO createResource(ReservationResourceDTO resourceDTO);
    ReservationResourceDTO updateResource(Long id, ReservationResourceDTO resourceDTO);
    void deleteResource(Long id);
}
