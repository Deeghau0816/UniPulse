package com.unipulse.backend.service;

import com.unipulse.backend.entity.ResolutionNote;
import java.util.List;
import java.util.Optional;

public interface ResolutionNoteService {
    
    /**
     * Create a new resolution note
     */
    ResolutionNote createResolutionNote(Long ticketId, String notes, String createdBy);
    
    /**
     * Update an existing resolution note
     */
    ResolutionNote updateResolutionNote(Long id, String notes);
    
    /**
     * Get all resolution notes for a ticket
     */
    List<ResolutionNote> getResolutionNotesByTicketId(Long ticketId);
    
    /**
     * Get the latest resolution note for a ticket
     */
    Optional<ResolutionNote> getLatestResolutionNoteByTicketId(Long ticketId);
    
    /**
     * Delete a resolution note
     */
    void deleteResolutionNote(Long id);
    
    /**
     * Delete all resolution notes for a ticket
     */
    void deleteResolutionNotesByTicketId(Long ticketId);
}
