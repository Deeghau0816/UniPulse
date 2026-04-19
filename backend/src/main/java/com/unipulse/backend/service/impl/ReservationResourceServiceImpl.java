package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.ReservationResourceDTO;
import com.unipulse.backend.exception.ResourceNotFoundException;
import com.unipulse.backend.model.ReservationResource;
import com.unipulse.backend.Repository.ReservationResourceRepository;
import com.unipulse.backend.service.ReservationResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationResourceServiceImpl implements ReservationResourceService {

    private final ReservationResourceRepository resourceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResourceDTO> getActiveResources() {
        return resourceRepository.findByStatus(ReservationResource.ResourceStatus.ACTIVE)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResourceDTO> searchResources(ReservationResource.ResourceType type, String location) {
        return resourceRepository.searchActiveResources(type, location)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResourceDTO getResourceById(Long id) {
        return toDTO(findById(id));
    }

    @Override
    public ReservationResourceDTO createResource(ReservationResourceDTO dto) {
        ReservationResource resource = ReservationResource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .availabilityWindows(dto.getAvailabilityWindows())
                .status(dto.getStatus() != null ? dto.getStatus() : ReservationResource.ResourceStatus.ACTIVE)
                .build();
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    public ReservationResourceDTO updateResource(Long id, ReservationResourceDTO dto) {
        ReservationResource resource = findById(id);
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityWindows(dto.getAvailabilityWindows());
        if (dto.getStatus() != null) resource.setStatus(dto.getStatus());
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    public void deleteResource(Long id) {
        findById(id);
        resourceRepository.deleteById(id);
    }

    private ReservationResource findById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    private ReservationResourceDTO toDTO(ReservationResource r) {
        return ReservationResourceDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .availabilityWindows(r.getAvailabilityWindows())
                .status(r.getStatus())
                .build();
    }
}
