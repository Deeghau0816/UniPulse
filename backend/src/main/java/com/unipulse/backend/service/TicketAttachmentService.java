package com.unipulse.backend.service;

import com.unipulse.backend.dto.AttachmentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TicketAttachmentService {

    AttachmentResponse uploadAttachment(Long ticketId, MultipartFile file);

    List<AttachmentResponse> getAttachmentsByTicketId(Long ticketId);

    void deleteAttachment(Long attachmentId);
}
