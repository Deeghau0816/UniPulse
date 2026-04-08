package com.unipulse.backend.controller;

import com.unipulse.backend.dto.CommentRequest;
import com.unipulse.backend.dto.CommentResponse;
import com.unipulse.backend.service.TicketCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class TicketCommentController {

    private final TicketCommentService ticketCommentService;

    @GetMapping("/api/tickets/{ticketId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByTicketId(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketCommentService.getCommentsByTicketId(ticketId));
    }

    @PostMapping("/api/tickets/{ticketId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequest request
    ) {
        return new ResponseEntity<>(
                ticketCommentService.addComment(ticketId, request),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request
    ) {
        return ResponseEntity.ok(ticketCommentService.updateComment(commentId, request));
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        ticketCommentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
