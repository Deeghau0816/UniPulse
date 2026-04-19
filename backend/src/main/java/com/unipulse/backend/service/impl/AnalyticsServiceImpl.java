package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.AnalyticsDTO;
import com.unipulse.backend.model.Ticket;
import com.unipulse.backend.enums.TicketStatus;
import com.unipulse.backend.Repository.TicketRepository;
import com.unipulse.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {
    
    private final TicketRepository ticketRepository;
    
    @Autowired
    public AnalyticsServiceImpl(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    
    @Override
    public AnalyticsDTO getOverallAnalytics() {
        List<Ticket> allTickets = ticketRepository.findAll();
        return buildAnalyticsDTO(allTickets, "All Time");
    }
    
    @Override
    public AnalyticsDTO getAnalyticsByPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        List<Ticket> periodTickets = ticketRepository.findByCreatedAtBetween(startDate, endDate);
        AnalyticsDTO analytics = buildAnalyticsDTO(periodTickets, "Custom Period");
        analytics.setStartDate(startDate);
        analytics.setEndDate(endDate);
        return analytics;
    }
    
    @Override
    public AnalyticsDTO getTodayAnalytics() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        
        List<Ticket> todayTickets = ticketRepository.findByCreatedAtBetween(startOfDay, endOfDay);
        return buildAnalyticsDTO(todayTickets, "Today");
    }
    
    @Override
    public AnalyticsDTO getWeekAnalytics() {
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
        List<Ticket> weekTickets = ticketRepository.findByCreatedAtBetween(startOfWeek, LocalDateTime.now());
        return buildAnalyticsDTO(weekTickets, "Last 7 Days");
    }
    
    @Override
    public AnalyticsDTO getMonthAnalytics() {
        LocalDateTime startOfMonth = LocalDateTime.now().minusMonths(1);
        List<Ticket> monthTickets = ticketRepository.findByCreatedAtBetween(startOfMonth, LocalDateTime.now());
        return buildAnalyticsDTO(monthTickets, "Last 30 Days");
    }
    
    @Override
    public AnalyticsDTO getYearAnalytics() {
        LocalDateTime startOfYear = LocalDateTime.now().minusYears(1);
        List<Ticket> yearTickets = ticketRepository.findByCreatedAtBetween(startOfYear, LocalDateTime.now());
        return buildAnalyticsDTO(yearTickets, "Last 365 Days");
    }
    
    @Override
    public Double calculateAverageResolutionTime(List<Ticket> tickets) {
        if (tickets == null || tickets.isEmpty()) {
            return 0.0;
        }
        
        List<Ticket> resolvedTickets = tickets.stream()
                .filter(ticket -> ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED)
                .filter(ticket -> ticket.getUpdatedAt() != null)
                .toList();
        
        if (resolvedTickets.isEmpty()) {
            return 0.0;
        }
        
        double totalResolutionTime = resolvedTickets.stream()
                .mapToDouble(ticket -> ChronoUnit.HOURS.between(ticket.getCreatedAt(), ticket.getUpdatedAt()))
                .sum();
        
        return totalResolutionTime / resolvedTickets.size();
    }
    
    @Override
    public Long countTicketsByStatus(List<Ticket> tickets, TicketStatus status) {
        if (tickets == null || tickets.isEmpty()) {
            return 0L;
        }
        
        return tickets.stream()
                .filter(ticket -> ticket.getStatus() == status)
                .count();
    }
    
    @Override
    public Long countOverdueTickets(List<Ticket> tickets) {
        if (tickets == null || tickets.isEmpty()) {
            return 0L;
        }
        
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
        
        return tickets.stream()
                .filter(ticket -> ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.IN_PROGRESS)
                .filter(ticket -> ticket.getCreatedAt().isBefore(threeDaysAgo))
                .count();
    }
    
    private AnalyticsDTO buildAnalyticsDTO(List<Ticket> tickets, String period) {
        AnalyticsDTO analytics = new AnalyticsDTO(period);
        
        // Total tickets
        analytics.setTotalTickets((long) tickets.size());
        
        // Status-based counts
        analytics.setTotalOpenTickets(countTicketsByStatus(tickets, TicketStatus.OPEN));
        analytics.setTotalInProgressTickets(countTicketsByStatus(tickets, TicketStatus.IN_PROGRESS));
        analytics.setTotalResolvedTickets(countTicketsByStatus(tickets, TicketStatus.RESOLVED));
        analytics.setTotalClosedTickets(countTicketsByStatus(tickets, TicketStatus.CLOSED));
        analytics.setTotalRejectedTickets(countTicketsByStatus(tickets, TicketStatus.REJECTED));
        
        // Overdue tickets
        analytics.setTotalOverdueTickets(countOverdueTickets(tickets));
        
        // Average resolution time
        analytics.setAverageResolutionTime(calculateAverageResolutionTime(tickets));
        
        // Calculate rates
        long totalTickets = analytics.getTotalTickets();
        if (totalTickets > 0) {
            long resolvedClosed = analytics.getTotalResolvedTickets() + analytics.getTotalClosedTickets();
            analytics.setResolutionRate((double) resolvedClosed / totalTickets * 100);
            analytics.setOverdueRate((double) analytics.getTotalOverdueTickets() / totalTickets * 100);
        } else {
            analytics.setResolutionRate(0.0);
            analytics.setOverdueRate(0.0);
        }
        
        return analytics;
    }
}
