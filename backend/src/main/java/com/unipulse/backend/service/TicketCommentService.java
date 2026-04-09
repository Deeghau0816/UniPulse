package com.unipulse.backend.service;

import com.unipulse.backend.dto.CommentRequest;
import com.unipulse.backend.dto.CommentResponse;

import java.util.List;

public interface TicketCommentService {

    List<CommentResponse> getCommentsByTicketId(Long ticketId);

    CommentResponse addComment(Long ticketId, CommentRequest request);

    CommentResponse updateComment(Long commentId, CommentRequest request);

    void deleteComment(Long commentId);
}
