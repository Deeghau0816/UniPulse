package com.unipulse.backend.repository;

import com.unipulse.backend.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    
    List<TicketMessage> findByTicketIdOrderBySentAtAsc(Long ticketId);
    
    @Query("SELECT tm FROM TicketMessage tm WHERE tm.ticketId = :ticketId ORDER BY tm.sentAt ASC")
    List<TicketMessage> findMessagesByTicketId(@Param("ticketId") Long ticketId);
    
    @Query("SELECT COUNT(tm) FROM TicketMessage tm WHERE tm.ticketId = :ticketId")
    Long countMessagesByTicketId(@Param("ticketId") Long ticketId);
    
    @Query("SELECT tm FROM TicketMessage tm WHERE tm.ticketId = :ticketId AND tm.senderRole = :senderRole ORDER BY tm.sentAt ASC")
    List<TicketMessage> findMessagesByTicketIdAndSenderRole(@Param("ticketId") Long ticketId, @Param("senderRole") TicketMessage.SenderRole senderRole);
}
