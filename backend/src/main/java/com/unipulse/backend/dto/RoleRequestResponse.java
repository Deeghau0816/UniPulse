package com.unipulse.backend.dto;

import com.unipulse.backend.model.RoleRequest;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RoleRequestResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String currentRole;
    private String requestedRole;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private boolean userDeleted;

    public static RoleRequestResponse fromEntity(RoleRequest roleRequest) {
        Long userId = roleRequest.getUser() != null ? roleRequest.getUser().getId() : null;

        return new RoleRequestResponse(
                roleRequest.getId(),
                userId,
                roleRequest.getRequesterName(),
                roleRequest.getRequesterEmail(),
                roleRequest.getCurrentRole().name(),
                roleRequest.getRequestedRole().name(),
                roleRequest.getReason(),
                roleRequest.getStatus().name(),
                roleRequest.getCreatedAt(),
                roleRequest.getReviewedAt(),
                roleRequest.isUserDeleted()
        );
    }
}