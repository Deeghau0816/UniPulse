package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.CommentRequest;
import com.unipulse.backend.dto.CommentResponse;
import com.unipulse.backend.exception.ResourceNotFoundException;
import com.unipulse.backend.model.Ticket;
import com.unipulse.backend.model.TicketComment;
import com.unipulse.backend.Repository.TicketCommentRepository;
import com.unipulse.backend.Repository.TicketRepository;
import com.unipulse.backend.service.TicketCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketCommentServiceImpl implements TicketCommentService {

    private final TicketCommentRepository ticketCommentRepository;
    private final TicketRepository ticketRepository;

    @Override
    public List<CommentResponse> getCommentsByTicketId(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }

        return ticketCommentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CommentResponse addComment(Long ticketId, CommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        TicketComment comment = TicketComment.builder()
                .authorName(request.getAuthorName())
                .authorRole(request.getAuthorRole())
                .message(request.getMessage())
                .ticket(ticket)
                .build();

        TicketComment savedComment = ticketCommentRepository.save(comment);
        return mapToResponse(savedComment);
    }

    @Override
    public CommentResponse updateComment(Long commentId, CommentRequest request) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        comment.setAuthorName(request.getAuthorName());
        comment.setAuthorRole(request.getAuthorRole());
        comment.setMessage(request.getMessage());

        TicketComment updatedComment = ticketCommentRepository.save(comment);
        return mapToResponse(updatedComment);
    }

    @Override
    public void deleteComment(Long commentId) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        ticketCommentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(TicketComment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .authorName(comment.getAuthorName())
                .authorRole(comment.getAuthorRole())
                .message(comment.getMessage())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}