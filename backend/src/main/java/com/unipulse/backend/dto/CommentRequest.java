package com.unipulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Author name is required")
    private String authorName;

    @NotBlank(message = "Author role is required")
    private String authorRole;

    @NotBlank(message = "Message is required")
    private String message;
}