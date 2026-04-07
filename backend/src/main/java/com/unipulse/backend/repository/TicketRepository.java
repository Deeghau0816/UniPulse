package com.unipulse.backend.repository;

import com.unipulse.backend.enums.TicketPriority;
import com.unipulse.backend.enums.TicketStatus;
import com.unipulse.backend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    boolean existsByTicketCode(String ticketCode);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByCategory(String category);

    List<Ticket> findByAssignedTechnician(String assignedTechnician);

    List<Ticket> findByCreatedBy(String createdBy);

    List<Ticket> findByStatusAndPriority(TicketStatus status, TicketPriority priority);
}