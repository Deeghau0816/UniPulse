package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.AssignTechnicianRequest;
import com.unipulse.backend.dto.MessageRequest;
import com.unipulse.backend.dto.MessageResponse;
import com.unipulse.backend.dto.ResolutionUpdateRequest;
import com.unipulse.backend.dto.TicketAttachmentResponse;
import com.unipulse.backend.dto.TicketRequest;
import com.unipulse.backend.dto.TicketResponse;
import com.unipulse.backend.dto.TicketStatusUpdateRequest;
import com.unipulse.backend.entity.TicketMessage;
import com.unipulse.backend.enums.TicketStatus;
import com.unipulse.backend.exception.ResourceNotFoundException;
import com.unipulse.backend.model.Ticket;
import com.unipulse.backend.model.TicketAttachment;
import com.unipulse.backend.Repository.TicketRepository;
import com.unipulse.backend.Repository.TicketAttachmentRepository;
import com.unipulse.backend.Repository.TicketMessageRepository;
import com.unipulse.backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketMessageRepository messageRepository;

    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = getTicketEntityById(id);
        return mapToResponse(ticket);
    }

    @Override
    public TicketResponse createTicket(TicketRequest request, List<MultipartFile> attachments) {
        Ticket ticket = Ticket.builder()
                .ticketCode(generateTicketCode())
                .category(request.getCategory())
                .location(request.getLocation())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .description(request.getDescription())
                .preferredContact(request.getPreferredContact())
                .createdBy(request.getCreatedBy())
                .createdById(request.getCreatedByUserId())
                .assignedTechnician(request.getAssignedTechnician())
                .technicianType(request.getTechnicianType())
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        uploadAttachments(savedTicket.getId(), attachments);
        return mapToResponse(savedTicket);
    }

    @Override
    public TicketResponse updateTicket(Long id, TicketRequest request, List<MultipartFile> attachments) {
        Ticket ticket = getTicketEntityById(id);

        ticket.setCategory(request.getCategory());
        ticket.setLocation(request.getLocation());
        ticket.setPriority(request.getPriority());
        ticket.setDescription(request.getDescription());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setCreatedBy(request.getCreatedBy());
        ticket.setAssignedTechnician(request.getAssignedTechnician());
        ticket.setTechnicianType(request.getTechnicianType());

        Ticket updatedTicket = ticketRepository.save(ticket);
        uploadAttachments(updatedTicket.getId(), attachments);
        return mapToResponse(updatedTicket);
    }

    @Override
    public void deleteTicket(Long id) {
        Ticket ticket = getTicketEntityById(id);
        ticketRepository.delete(ticket);
    }

    @Override
    public TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request) {
        Ticket ticket = getTicketEntityById(id);
        ticket.setStatus(request.getStatus());

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
    }

    @Override
    public TicketResponse assignTechnician(Long id, AssignTechnicianRequest request) {
        Ticket ticket = getTicketEntityById(id);
        ticket.setAssignedTechnician(request.getAssignedTechnician());
        ticket.setTechnicianType(request.getTechnicianType());

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
    }

    @Override
    public TicketResponse updateResolution(Long id, ResolutionUpdateRequest request) {
        Ticket ticket = getTicketEntityById(id);
        ticket.setResolutionNotes(request.getResolutionNotes());
        ticket.setRejectionReason(request.getRejectionReason());

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
    }

    // Attachment operations
    @Override
    public TicketAttachmentResponse uploadAttachment(Long ticketId, MultipartFile file) {
        Ticket ticket = getTicketEntityById(ticketId);
        
        try {
            // Create upload directory if it doesn't exist
            String uploadDir = "uploads/tickets/" + ticketId;
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);

            // Create attachment record
            TicketAttachment attachment = TicketAttachment.builder()
                .fileName(uniqueFilename)
                .fileType(file.getContentType())
                .filePath(filePath.toString())
                .ticket(ticket)
                .build();

            TicketAttachment savedAttachment = attachmentRepository.save(attachment);
            
            return TicketAttachmentResponse.builder()
                .id(savedAttachment.getId())
                .fileName(savedAttachment.getFileName())
                .originalFileName(originalFilename)
                .contentType(savedAttachment.getFileType())
                .fileSize(file.getSize())
                .filePath(savedAttachment.getFilePath())
                .uploadedAt(savedAttachment.getUploadedAt())
                .build();

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload attachment", e);
        }
    }

    @Override
    public List<TicketAttachmentResponse> getTicketAttachments(Long ticketId) {
        getTicketEntityById(ticketId); // Verify ticket exists
        
        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticketId);
        
        return attachments.stream()
            .map(att -> TicketAttachmentResponse.builder()
                .id(att.getId())
                .fileName(att.getFileName())
                .originalFileName(att.getFileName())
                .contentType(att.getFileType())
                .fileSize(0L)
                .filePath(att.getFilePath())
                .uploadedAt(att.getUploadedAt())
                .build())
            .toList();
    }

    @Override
    public void deleteAttachment(Long attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));
        
        try {
            // Delete file from filesystem
            Path filePath = Paths.get(attachment.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
            
            // Delete from database
            attachmentRepository.delete(attachment);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete attachment file", e);
        }
    }

    @Override
    public byte[] downloadAttachment(Long attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));
        
        try {
            Path filePath = Paths.get(attachment.getFilePath());
            return Files.readAllBytes(filePath);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to read attachment file", e);
        }
    }

    @Override
    public MessageResponse sendMessage(Long ticketId, MessageRequest request) {
        Ticket ticket = getTicketEntityById(ticketId);
        
        TicketMessage message = TicketMessage.builder()
                .ticketId(ticketId)
                .senderName(request.getSenderName())
                .senderRole(request.getSenderRole())
                .messageContent(request.getMessageContent())
                .sentAt(LocalDateTime.now())
                .build();
        
        TicketMessage savedMessage = messageRepository.save(message);
        return MessageResponse.fromEntity(savedMessage);
    }

    @Override
    public List<MessageResponse> getTicketMessages(Long ticketId) {
        getTicketEntityById(ticketId); // Verify ticket exists
        
        return messageRepository.findByTicketIdOrderBySentAtAsc(ticketId)
                .stream()
                .map(MessageResponse::fromEntity)
                .toList();
    }

    private void uploadAttachments(Long ticketId, List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return;
        }

        attachments.stream()
                .filter(Objects::nonNull)
                .filter(file -> !file.isEmpty())
                .forEach(file -> uploadAttachment(ticketId, file));
    }

    private Ticket getTicketEntityById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private String generateTicketCode() {
        String ticketCode;
        do {
            ticketCode = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (ticketRepository.existsByTicketCode(ticketCode));

        return ticketCode;
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        List<TicketAttachmentResponse> attachments = attachmentRepository.findByTicketId(ticket.getId())
            .stream()
            .map(att -> TicketAttachmentResponse.builder()
                .id(att.getId())
                .fileName(att.getFileName())
                .originalFileName(att.getFileName())
                .contentType(att.getFileType())
                .fileSize(0L)
                .filePath(att.getFilePath())
                .uploadedAt(att.getUploadedAt())
                .build())
            .toList();
            
        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .category(ticket.getCategory())
                .location(ticket.getLocation())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .description(ticket.getDescription())
                .preferredContact(ticket.getPreferredContact())
                .createdBy(ticket.getCreatedBy())
                .assignedTechnician(ticket.getAssignedTechnician())
                .technicianType(ticket.getTechnicianType())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .attachments(attachments)
                .build();
    }
}
