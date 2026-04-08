package com.unipulse.backend.dto;

import com.unipulse.backend.enums.TechnicianType;
import com.unipulse.backend.enums.TicketPriority;
import com.unipulse.backend.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {

    private Long id;
    private String ticketCode;
    private String category;
    private String location;
    private TicketPriority priority;
    private TicketStatus status;
    private String description;
    private String preferredContact;
    private String createdBy;
    private String assignedTechnician;
    private TechnicianType technicianType;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketAttachmentResponse> attachments;
}