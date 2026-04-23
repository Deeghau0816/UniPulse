package com.unipulse.backend.dto;

import com.unipulse.backend.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleRequestCreateRequest {

    @NotNull
    private Role requestedRole;

    private String reason;
}