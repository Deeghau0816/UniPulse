package com.unipulse.backend.Controller;

import com.unipulse.backend.entity.ResolutionNote;
import com.unipulse.backend.service.ResolutionNoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets/{ticketId}/resolution-notes")
public class ResolutionNoteController {
    
    private final ResolutionNoteService resolutionNoteService;
    
    @Autowired
    public ResolutionNoteController(ResolutionNoteService resolutionNoteService) {
        this.resolutionNoteService = resolutionNoteService;
    }
    
    /**
     * Get all resolution notes for a ticket
     */
    @GetMapping
    public ResponseEntity<List<ResolutionNote>> getResolutionNotes(@PathVariable Long ticketId) {
        List<ResolutionNote> notes = resolutionNoteService.getResolutionNotesByTicketId(ticketId);
        return ResponseEntity.ok(notes);
    }
    
    /**
     * Get the latest resolution note for a ticket
     */
    @GetMapping("/latest")
    public ResponseEntity<ResolutionNote> getLatestResolutionNote(@PathVariable Long ticketId) {
        Optional<ResolutionNote> note = resolutionNoteService.getLatestResolutionNoteByTicketId(ticketId);
        return note.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.noContent().build());
    }
    
    /**
     * Create a new resolution note
     */
    @PostMapping
    public ResponseEntity<ResolutionNote> createResolutionNote(
            @PathVariable Long ticketId,
            @RequestBody CreateResolutionNoteRequest request) {
        
        ResolutionNote resolutionNote = resolutionNoteService.createResolutionNote(
            ticketId, 
            request.getNotes(), 
            request.getCreatedBy()
        );
        
        return ResponseEntity.ok(resolutionNote);
    }
    
    /**
     * Update an existing resolution note
     */
    @PutMapping("/{noteId}")
    public ResponseEntity<ResolutionNote> updateResolutionNote(
            @PathVariable Long ticketId,
            @PathVariable Long noteId,
            @RequestBody UpdateResolutionNoteRequest request) {
        
        ResolutionNote resolutionNote = resolutionNoteService.updateResolutionNote(
            noteId, 
            request.getNotes()
        );
        
        return ResponseEntity.ok(resolutionNote);
    }
    
    /**
     * Delete a resolution note
     */
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteResolutionNote(
            @PathVariable Long ticketId,
            @PathVariable Long noteId) {
        
        resolutionNoteService.deleteResolutionNote(noteId);
        return ResponseEntity.noContent().build();
    }
    
    // Request DTOs
    public static class CreateResolutionNoteRequest {
        private String notes;
        private String createdBy;
        
        // Getters and Setters
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    }
    
    public static class UpdateResolutionNoteRequest {
        private String notes;
        
        // Getters and Setters
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
