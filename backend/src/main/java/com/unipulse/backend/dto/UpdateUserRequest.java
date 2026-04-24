package com.unipulse.backend.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String sliitId;

    @Email
    private String email;

    private String password;
    private String profileImage;
}