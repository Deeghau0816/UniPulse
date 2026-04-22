package com.unipulse.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String sliitId;

    @NotBlank
    private String role;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}