package com.unipulse.backend.service;

import com.unipulse.backend.dto.AssignTechnicianRequest;
import com.unipulse.backend.dto.MessageRequest;
import com.unipulse.backend.dto.MessageResponse;
import com.unipulse.backend.dto.ResolutionUpdateRequest;
import com.unipulse.backend.dto.TicketAttachmentResponse;
import com.unipulse.backend.dto.TicketRequest;
import com.unipulse.backend.dto.TicketResponse;
import com.unipulse.backend.dto.TicketStatusUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TicketService {

    List<TicketResponse> getAllTickets();

    TicketResponse getTicketById(Long id);

    TicketResponse createTicket(TicketRequest request);

    TicketResponse createTicket(TicketRequest request, List<MultipartFile> attachments);

    TicketResponse updateTicket(Long id, TicketRequest request);

    TicketResponse updateTicket(Long id, TicketRequest request, List<MultipartFile> attachments);

    void deleteTicket(Long id);

    TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request);

    TicketResponse assignTechnician(Long id, AssignTechnicianRequest request);

    TicketResponse updateResolution(Long id, ResolutionUpdateRequest request);

    // Attachment operations
    TicketAttachmentResponse uploadAttachment(Long ticketId, MultipartFile file);

    List<TicketAttachmentResponse> getTicketAttachments(Long ticketId);

    void deleteAttachment(Long attachmentId);

    byte[] downloadAttachment(Long attachmentId);

    // Message operations
    MessageResponse sendMessage(Long ticketId, MessageRequest request);

    List<MessageResponse> getTicketMessages(Long ticketId);
}