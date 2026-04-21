package com.unipulse.backend.Controller;

import com.unipulse.backend.dto.AssignTechnicianRequest;
import com.unipulse.backend.dto.MessageRequest;
import com.unipulse.backend.dto.MessageResponse;
import com.unipulse.backend.dto.ResolutionUpdateRequest;
import com.unipulse.backend.dto.TicketAttachmentResponse;
import com.unipulse.backend.dto.TicketRequest;
import com.unipulse.backend.dto.TicketResponse;
import com.unipulse.backend.dto.TicketStatusUpdateRequest;
import com.unipulse.backend.enums.TicketPriority;
import com.unipulse.backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketRequest request
    ) {
        TicketResponse createdTicket = ticketService.createTicket(request);
        return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
    }

    @PostMapping(value = "/with-attachments", consumes = "multipart/form-data")
    public ResponseEntity<TicketResponse> createTicketWithAttachments(
            @RequestParam("category") String category,
            @RequestParam("location") String location,
            @RequestParam("priority") String priority,
            @RequestParam("description") String description,
            @RequestParam("preferredContact") String preferredContact,
            @RequestParam("createdBy") String createdBy,
            @RequestParam(value = "assignedTechnician", required = false) String assignedTechnician,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments
    ) {
        TicketRequest request = new TicketRequest();
        request.setCategory(category);
        request.setLocation(location);
        request.setPriority(TicketPriority.valueOf(priority));
        request.setDescription(description);
        request.setPreferredContact(preferredContact);
        request.setCreatedBy(createdBy);
        request.setAssignedTechnician(assignedTechnician);
        
        TicketResponse createdTicket = ticketService.createTicket(request, attachments);
        return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    @PatchMapping("/{id}/assign-technician")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequest request
    ) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    @PatchMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> updateResolution(
            @PathVariable Long id,
            @Valid @RequestBody ResolutionUpdateRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateResolution(id, request));
    }

    // Attachment endpoints
    @PostMapping("/{ticketId}/attachments")
    public ResponseEntity<TicketAttachmentResponse> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) {
        TicketAttachmentResponse attachment = ticketService.uploadAttachment(ticketId, file);
        return new ResponseEntity<>(attachment, HttpStatus.CREATED);
    }

    @GetMapping("/{ticketId}/attachments")
    public ResponseEntity<List<TicketAttachmentResponse>> getTicketAttachments(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getTicketAttachments(ticketId));
    }

    // Message endpoints
    @PostMapping("/{ticketId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long ticketId,
            @Valid @RequestBody MessageRequest request) {
        MessageResponse message = ticketService.sendMessage(ticketId, request);
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    @GetMapping("/{ticketId}/messages")
    public ResponseEntity<List<MessageResponse>> getTicketMessages(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getTicketMessages(ticketId));
    }
}
