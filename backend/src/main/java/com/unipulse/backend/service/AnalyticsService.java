package com.unipulse.backend.service;

import com.unipulse.backend.dto.AnalyticsDTO;
import com.unipulse.backend.model.Ticket;
import com.unipulse.backend.enums.TicketStatus;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

public interface AnalyticsService {
    
    /**
     * Get comprehensive analytics for all tickets
     */
    AnalyticsDTO getOverallAnalytics();
    
    /**
     * Get analytics for a specific time period
     */
    AnalyticsDTO getAnalyticsByPeriod(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Get analytics for today
     */
    AnalyticsDTO getTodayAnalytics();
    
    /**
     * Get analytics for this week
     */
    AnalyticsDTO getWeekAnalytics();
    
    /**
     * Get analytics for this month
     */
    AnalyticsDTO getMonthAnalytics();
    
    /**
     * Get analytics for this year
     */
    AnalyticsDTO getYearAnalytics();
    
    /**
     * Calculate average resolution time for a list of tickets
     */
    Double calculateAverageResolutionTime(List<Ticket> tickets);
    
    /**
     * Count tickets by status
     */
    Long countTicketsByStatus(List<Ticket> tickets, TicketStatus status);
    
    /**
     * Count overdue tickets (tickets older than 3 days that are not resolved/closed)
     */
    Long countOverdueTickets(List<Ticket> tickets);
}
