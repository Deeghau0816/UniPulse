package com.unipulse.backend.Controller;

import com.unipulse.backend.dto.ApiResponse;
import com.unipulse.backend.dto.ReservationResourceDTO;
import com.unipulse.backend.model.ReservationResource;
import com.unipulse.backend.service.ReservationResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservation-resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReservationResourceController {

    private final ReservationResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationResourceDTO>>> getAllResources(
            @RequestParam(required = false) ReservationResource.ResourceType type,
            @RequestParam(required = false) String location) {
        List<ReservationResourceDTO> resources;
        if (type != null || (location != null && !location.isBlank())) {
            resources = resourceService.searchResources(type, location);
        } else {
            resources = resourceService.getActiveResources();
        }
        return ResponseEntity.ok(ApiResponse.success("Resources retrieved successfully", resources));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResourceDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Resource found", resourceService.getResourceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResourceDTO>> create(@Valid @RequestBody ReservationResourceDTO dto) {
        ReservationResourceDTO created = resourceService.createResource(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResourceDTO>> update(
            @PathVariable Long id, @Valid @RequestBody ReservationResourceDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Resource updated", resourceService.updateResource(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully", null));
    }
}
