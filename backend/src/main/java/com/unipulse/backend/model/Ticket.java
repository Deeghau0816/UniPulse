package com.unipulse.backend.model;

import com.unipulse.backend.enums.TechnicianType;
import com.unipulse.backend.enums.TicketPriority;
import com.unipulse.backend.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", nullable = false, unique = true, length = 50)
    private String ticketCode;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TicketStatus status;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "preferred_contact", nullable = false, length = 255)
    private String preferredContact;

    @Column(name = "created_by", nullable = false, length = 150)
    private String createdBy;

    @Column(name = "created_by_user_id", nullable = true)
    private Long createdById;

    @Column(name = "assigned_technician", length = 150)
    private String assignedTechnician;

    @Enumerated(EnumType.STRING)
    @Column(name = "technician_type", length = 100)
    private TechnicianType technicianType;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
        
        // Set default values for nullable fields
        if (this.createdBy == null) {
            this.createdBy = "Unknown"; // Default created by value
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
