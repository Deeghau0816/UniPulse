package com.unipulse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private Long id;
    private String authorName;
    private String authorRole;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}