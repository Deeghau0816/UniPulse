package com.unipulse.backend.service.impl;

import com.unipulse.backend.Repository.TicketAttachmentRepository;
import com.unipulse.backend.Repository.TicketMessageRepository;
import com.unipulse.backend.Repository.TicketRepository;
import com.unipulse.backend.service.NotificationService;
import com.unipulse.backend.dto.NotificationRequest;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketMessageRepository messageRepository;
    private final NotificationService notificationService;

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
        
        // Handle attachments if provided
        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                uploadAttachment(savedTicket.getId(), file);
            }
        }
        
        return mapToResponse(savedTicket);
    }

    @Override
    public TicketResponse updateTicket(Long id, TicketRequest request, List<MultipartFile> attachments) {
        Ticket ticket = getTicketEntityById(id);

        // Check if ticket can be updated (no technician assigned yet)
        if (ticket.getAssignedTechnician() != null && !ticket.getAssignedTechnician().trim().isEmpty()) {
            throw new IllegalStateException("Ticket cannot be updated after a technician has been assigned. Contact the technician for any changes.");
        }

        ticket.setCategory(request.getCategory());
        ticket.setLocation(request.getLocation());
        ticket.setPriority(request.getPriority());
        ticket.setDescription(request.getDescription());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setCreatedBy(request.getCreatedBy());
        ticket.setAssignedTechnician(request.getAssignedTechnician());
        ticket.setTechnicianType(request.getTechnicianType());

        Ticket updatedTicket = ticketRepository.save(ticket);
        
        // Handle attachments if provided
        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                uploadAttachment(updatedTicket.getId(), file);
            }
        }
        
        return mapToResponse(updatedTicket);
    }
//gggg
    @Override
    public void deleteTicket(Long id) {
        Ticket ticket = getTicketEntityById(id);
        ticketRepository.delete(ticket);
    }

    @Override
    public TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request) {
        Ticket ticket = getTicketEntityById(id);
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(request.getStatus());

        Ticket updatedTicket = ticketRepository.save(ticket);
        
        // Create notification for ticket status change
        createStatusChangeNotification(ticket, oldStatus, request.getStatus());
        
        return mapToResponse(updatedTicket);
    }

    @Override
    public TicketResponse assignTechnician(Long id, AssignTechnicianRequest request) {
        Ticket ticket = getTicketEntityById(id);
        ticket.setAssignedTechnician(request.getAssignedTechnician());
        ticket.setTechnicianType(request.getTechnicianType());

        Ticket updatedTicket = ticketRepository.save(ticket);
        
        // Create notification for technician assignment
        createAssignmentNotification(ticket, request.getAssignedTechnician());
        return mapToResponse(updatedTicket);
    }

    @Override
    public TicketResponse updateResolution(Long id, ResolutionUpdateRequest request) {
        Ticket ticket = getTicketEntityById(id);
        ticket.setResolutionNotes(request.getResolutionNotes());
        ticket.setRejectionReason(request.getRejectionReason());

        Ticket updatedTicket = ticketRepository.save(ticket);
        
        // Create notification for resolution update
        createResolutionNotification(ticket, request.getResolutionNotes());
        
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
        
        // Create notification for new comment (only notify ticket creator, not the commenter)
        if (!request.getSenderName().equals(ticket.getCreatedBy())) {
            createCommentNotification(ticket, request.getSenderName());
        }
        
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

    private void createStatusChangeNotification(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus) {
        if (ticket.getCreatedBy() != null && !oldStatus.equals(newStatus)) {
            String title = "Ticket #" + ticket.getTicketCode() + " Status Updated";
            String message = String.format("Your ticket #%s status was changed from %s to %s", 
                ticket.getTicketCode(), oldStatus, newStatus);
            
            try {
                NotificationRequest notificationRequest = new NotificationRequest();
                // Use a default user ID (1) for "Current User" since we don't have user mapping
                Long userId = getUserIdFromCreatedBy(ticket.getCreatedBy());
                notificationRequest.setUserId(userId);
                notificationRequest.setTitle(title);
                notificationRequest.setMessage(message);
                
                notificationService.createNotification(notificationRequest);
            } catch (Exception e) {
                // Log error but don't fail the ticket update
                System.err.println("Failed to create notification: " + e.getMessage());
            }
        }
    }

    private void createAssignmentNotification(Ticket ticket, String assignedTechnician) {
        if (ticket.getCreatedBy() != null && assignedTechnician != null) {
            String title = "Ticket #" + ticket.getTicketCode() + " Assigned";
            String message = String.format("Your ticket #%s has been assigned to %s", 
                ticket.getTicketCode(), assignedTechnician);
            
            try {
                NotificationRequest notificationRequest = new NotificationRequest();
                Long userId = getUserIdFromCreatedBy(ticket.getCreatedBy());
                notificationRequest.setUserId(userId);
                notificationRequest.setTitle(title);
                notificationRequest.setMessage(message);
                
                notificationService.createNotification(notificationRequest);
            } catch (Exception e) {
                System.err.println("Failed to create assignment notification: " + e.getMessage());
            }
        }
    }

    private void createCommentNotification(Ticket ticket, String commenterName) {
        if (ticket.getCreatedBy() != null) {
            String title = "New Comment on Ticket #" + ticket.getTicketCode();
            String message = String.format("A new comment was added to your ticket #%s by %s", 
                ticket.getTicketCode(), commenterName);
            
            try {
                NotificationRequest notificationRequest = new NotificationRequest();
                Long userId = getUserIdFromCreatedBy(ticket.getCreatedBy());
                notificationRequest.setUserId(userId);
                notificationRequest.setTitle(title);
                notificationRequest.setMessage(message);
                
                notificationService.createNotification(notificationRequest);
            } catch (Exception e) {
                System.err.println("Failed to create comment notification: " + e.getMessage());
            }
        }
    }

    private void createResolutionNotification(Ticket ticket, String resolutionNotes) {
        if (ticket.getCreatedBy() != null && resolutionNotes != null && !resolutionNotes.trim().isEmpty()) {
            String title = "Ticket #" + ticket.getTicketCode() + " Resolved";
            String message = String.format("Your ticket #%s has been resolved: %s", 
                ticket.getTicketCode(), resolutionNotes);
            
            try {
                NotificationRequest notificationRequest = new NotificationRequest();
                Long userId = getUserIdFromCreatedBy(ticket.getCreatedBy());
                notificationRequest.setUserId(userId);
                notificationRequest.setTitle(title);
                notificationRequest.setMessage(message);
                
                notificationService.createNotification(notificationRequest);
            } catch (Exception e) {
                System.err.println("Failed to create resolution notification: " + e.getMessage());
            }
        }
    }

    private Long getUserIdFromCreatedBy(String createdBy) {
        // For demo purposes, return a default user ID
        // In production, this would map user names to actual user IDs
        if ("Current User".equals(createdBy)) {
            return 1L; // Default user ID for demo
        }
        try {
            return Long.parseLong(createdBy);
        } catch (NumberFormatException e) {
            return 1L; // Default fallback
        }
    }
}
