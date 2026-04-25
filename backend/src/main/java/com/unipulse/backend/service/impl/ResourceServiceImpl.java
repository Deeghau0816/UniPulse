package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.ResourceRequest;
import com.unipulse.backend.dto.ResourceResponse;
import com.unipulse.backend.dto.ResourceStatusUpdateRequest;
import com.unipulse.backend.enums.ResourceStatus;
import com.unipulse.backend.enums.ResourceType;
import com.unipulse.backend.exception.ResourceNotFoundException;
import com.unipulse.backend.model.Resource;
import com.unipulse.backend.Repository.ResourceRepository;
import com.unipulse.backend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private static final String UPLOAD_DIR = "uploads/resources";

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
    public ResourceResponse createResource(ResourceRequest request, MultipartFile image) {
        String imageUrl = request.getImageUrl();
        
        if (image != null && !image.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                    System.out.println("Created upload directory: " + uploadPath.toAbsolutePath());
                }
                
                String originalFilename = image.getOriginalFilename();
                String fileExtension = originalFilename != null ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
                String newFilename = UUID.randomUUID().toString() + fileExtension;
                
                Path filePath = uploadPath.resolve(newFilename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                imageUrl = "/uploads/resources/" + newFilename;
                System.out.println("Image saved to: " + filePath.toAbsolutePath());
                System.out.println("Image URL: " + imageUrl);
            } catch (IOException e) {
                System.err.println("Failed to store image file: " + e.getMessage());
                throw new RuntimeException("Failed to store image file", e);
            }
        }
        
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .availabilityWindows(request.getAvailabilityWindows())
                .status(request.getStatus())
                .imageUrl(imageUrl)
                .build();

        Resource savedResource = resourceRepository.save(resource);
        System.out.println("Resource saved with imageUrl: " + savedResource.getImageUrl());
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
    public ResourceResponse updateResource(Long id, ResourceRequest request, MultipartFile image) {
        Resource resource = getResourceEntityById(id);

        String imageUrl = request.getImageUrl();
        
        if (image != null && !image.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                    System.out.println("Created upload directory: " + uploadPath.toAbsolutePath());
                }
                
                String originalFilename = image.getOriginalFilename();
                String fileExtension = originalFilename != null ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
                String newFilename = UUID.randomUUID().toString() + fileExtension;
                
                Path filePath = uploadPath.resolve(newFilename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                imageUrl = "/uploads/resources/" + newFilename;
                System.out.println("Image saved to: " + filePath.toAbsolutePath());
                System.out.println("Image URL: " + imageUrl);
            } catch (IOException e) {
                System.err.println("Failed to store image file: " + e.getMessage());
                throw new RuntimeException("Failed to store image file", e);
            }
        }

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setStatus(request.getStatus());
        resource.setImageUrl(imageUrl);

        Resource updatedResource = resourceRepository.save(resource);
        System.out.println("Resource updated with imageUrl: " + updatedResource.getImageUrl());
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
