package com.unipulse.backend.service;

import com.unipulse.backend.dto.ResourceRequest;
import com.unipulse.backend.dto.ResourceResponse;
import com.unipulse.backend.dto.ResourceStatusUpdateRequest;
import com.unipulse.backend.enums.ResourceStatus;
import com.unipulse.backend.enums.ResourceType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResourceService {

    List<ResourceResponse> getAllResources();

    ResourceResponse getResourceById(Long id);

    ResourceResponse createResource(ResourceRequest request);

    ResourceResponse createResource(ResourceRequest request, MultipartFile image);

    ResourceResponse updateResource(Long id, ResourceRequest request);

    ResourceResponse updateResource(Long id, ResourceRequest request, MultipartFile image);

    void deleteResource(Long id);

    ResourceResponse updateResourceStatus(Long id, ResourceStatusUpdateRequest request);

    List<ResourceResponse> getResourcesByType(ResourceType type);

    List<ResourceResponse> getResourcesByStatus(ResourceStatus status);

    List<ResourceResponse> searchResources(ResourceType type, ResourceStatus status, String location, Integer minCapacity);
}
