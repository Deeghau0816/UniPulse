package com.unipulse.backend.Repository;

import com.unipulse.backend.entity.ResolutionNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResolutionNoteRepository extends JpaRepository<ResolutionNote, Long> {
    
    /**
     * Find resolution notes by ticket ID
     */
    List<ResolutionNote> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
    
    /**
     * Find the most recent resolution note for a ticket
     */
    @Query("SELECT rn FROM ResolutionNote rn WHERE rn.ticketId = :ticketId ORDER BY rn.createdAt DESC LIMIT 1")
    Optional<ResolutionNote> findLatestByTicketId(@Param("ticketId") Long ticketId);
    
    /**
     * Find resolution notes by ticket ID and created by
     */
    List<ResolutionNote> findByTicketIdAndCreatedByOrderByCreatedAtDesc(Long ticketId, String createdBy);
    
    /**
     * Delete all resolution notes for a ticket
     */
    void deleteByTicketId(Long ticketId);
    
    /**
     * Check if resolution notes exist for a ticket
     */
    boolean existsByTicketId(Long ticketId);
}
