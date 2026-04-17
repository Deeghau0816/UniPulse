package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.ResourceRequest;
import com.unipulse.backend.dto.ResourceResponse;
import com.unipulse.backend.dto.ResourceStatusUpdateRequest;
import com.unipulse.backend.enums.ResourceStatus;
import com.unipulse.backend.enums.ResourceType;
import com.unipulse.backend.exception.ResourceNotFoundException;
import com.unipulse.backend.model.Resource;
import com.unipulse.backend.repository.ResourceRepository;
import com.unipulse.backend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ResourceResponse getResourceById(Long id) {
        Resource resource = getResourceEntityById(id);
        return mapToResponse(resource);
    }

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .availabilityWindows(request.getAvailabilityWindows())
                .status(request.getStatus())
                .imageUrl(request.getImageUrl())
                .build();

        Resource savedResource = resourceRepository.save(resource);
        return mapToResponse(savedResource);
    }

    @Override
    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        Resource resource = getResourceEntityById(id);

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setStatus(request.getStatus());
        resource.setImageUrl(request.getImageUrl());

        Resource updatedResource = resourceRepository.save(resource);
        return mapToResponse(updatedResource);
    }

    @Override
    public void deleteResource(Long id) {
        Resource resource = getResourceEntityById(id);
        resourceRepository.delete(resource);
    }

    @Override
    public ResourceResponse updateResourceStatus(Long id, ResourceStatusUpdateRequest request) {
        Resource resource = getResourceEntityById(id);
        resource.setStatus(request.getStatus());
        Resource updatedResource = resourceRepository.save(resource);
        return mapToResponse(updatedResource);
    }

    @Override
    public List<ResourceResponse> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ResourceResponse> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ResourceResponse> searchResources(ResourceType type, ResourceStatus status, String location, Integer minCapacity) {
        return resourceRepository.searchResources(type, status, location, minCapacity)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Resource getResourceEntityById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    private ResourceResponse mapToResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .description(resource.getDescription())
                .availabilityWindows(resource.getAvailabilityWindows())
                .status(resource.getStatus())
                .imageUrl(resource.getImageUrl())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
