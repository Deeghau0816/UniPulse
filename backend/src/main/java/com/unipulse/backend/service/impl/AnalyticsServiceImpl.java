package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.AnalyticsDTO;
import com.unipulse.backend.dto.ResourceAnalyticsDTO;
import com.unipulse.backend.model.Reservation;
import com.unipulse.backend.model.Ticket;
import com.unipulse.backend.enums.TicketStatus;
import com.unipulse.backend.Repository.TicketRepository;
import com.unipulse.backend.Repository.ReservationRepository;
import com.unipulse.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {
    
    private final TicketRepository ticketRepository;
    private final ReservationRepository reservationRepository;
    
    @Autowired
    public AnalyticsServiceImpl(TicketRepository ticketRepository, ReservationRepository reservationRepository) {
        this.ticketRepository = ticketRepository;
        this.reservationRepository = reservationRepository;
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
    
    // ─── Resource Analytics Implementation ────────────────────────────────────
    
    @Override
    public ResourceAnalyticsDTO getResourceAnalytics() {
        List<Reservation> allReservations = reservationRepository.findAll();
        return buildResourceAnalyticsDTO(allReservations, "All Time", null, null);
    }
    
    @Override
    public ResourceAnalyticsDTO getResourceAnalyticsByPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        List<Reservation> periodReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null 
                        && !r.getCreatedAt().isBefore(startDate) 
                        && !r.getCreatedAt().isAfter(endDate))
                .collect(Collectors.toList());
        
        ResourceAnalyticsDTO analytics = buildResourceAnalyticsDTO(periodReservations, "Custom Period", startDate, endDate);
        analytics.setStartDate(startDate);
        analytics.setEndDate(endDate);
        return analytics;
    }
    
    @Override
    public ResourceAnalyticsDTO getResourceAnalyticsToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        
        List<Reservation> todayReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null 
                        && !r.getCreatedAt().isBefore(startOfDay) 
                        && !r.getCreatedAt().isAfter(endOfDay))
                .collect(Collectors.toList());
        
        return buildResourceAnalyticsDTO(todayReservations, "Today", startOfDay, endOfDay);
    }
    
    @Override
    public ResourceAnalyticsDTO getResourceAnalyticsWeek() {
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
        LocalDateTime endOfWeek = LocalDateTime.now();
        
        List<Reservation> weekReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null 
                        && !r.getCreatedAt().isBefore(startOfWeek) 
                        && !r.getCreatedAt().isAfter(endOfWeek))
                .collect(Collectors.toList());
        
        return buildResourceAnalyticsDTO(weekReservations, "Last 7 Days", startOfWeek, endOfWeek);
    }
    
    @Override
    public ResourceAnalyticsDTO getResourceAnalyticsMonth() {
        LocalDateTime startOfMonth = LocalDateTime.now().minusMonths(1);
        LocalDateTime endOfMonth = LocalDateTime.now();
        
        List<Reservation> monthReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null 
                        && !r.getCreatedAt().isBefore(startOfMonth) 
                        && !r.getCreatedAt().isAfter(endOfMonth))
                .collect(Collectors.toList());
        
        return buildResourceAnalyticsDTO(monthReservations, "Last 30 Days", startOfMonth, endOfMonth);
    }
    
    @Override
    public ResourceAnalyticsDTO getResourceAnalyticsYear() {
        LocalDateTime startOfYear = LocalDateTime.now().minusYears(1);
        LocalDateTime endOfYear = LocalDateTime.now();
        
        List<Reservation> yearReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null 
                        && !r.getCreatedAt().isBefore(startOfYear) 
                        && !r.getCreatedAt().isAfter(endOfYear))
                .collect(Collectors.toList());
        
        return buildResourceAnalyticsDTO(yearReservations, "Last 365 Days", startOfYear, endOfYear);
    }
    
    private ResourceAnalyticsDTO buildResourceAnalyticsDTO(List<Reservation> reservations, String period, 
                                                           LocalDateTime startDate, LocalDateTime endDate) {
        ResourceAnalyticsDTO analytics = new ResourceAnalyticsDTO(period);
        analytics.setStartDate(startDate);
        analytics.setEndDate(endDate);
        
        // Total metrics
        analytics.setTotalReservations((long) reservations.size());
        analytics.setUniqueUsers(reservations.stream()
                .map(Reservation::getUserId)
                .distinct()
                .count());
        analytics.setTotalResourcesUsed(reservations.stream()
                .map(r -> r.getResource() != null ? r.getResource().getId() : null)
                .distinct()
                .filter(id -> id != null)
                .count());
        
        // Status breakdown
        analytics.setPendingCount(reservations.stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.PENDING)
                .count());
        analytics.setApprovedCount(reservations.stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.APPROVED)
                .count());
        analytics.setRejectedCount(reservations.stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.REJECTED)
                .count());
        analytics.setCancelledCount(reservations.stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.CANCELLED)
                .count());
        
        // Average reservation duration (in hours)
        double avgDuration = reservations.stream()
                .filter(r -> r.getStartTime() != null && r.getEndTime() != null)
                .mapToLong(r -> ChronoUnit.MINUTES.between(r.getStartTime(), r.getEndTime()))
                .average()
                .orElse(0.0);
        analytics.setAverageReservationDuration(avgDuration / 60.0); // Convert to hours
        
        // Average attendees per reservation
        double avgAttendees = reservations.stream()
                .filter(r -> r.getExpectedAttendees() != null)
                .mapToLong(Reservation::getExpectedAttendees)
                .average()
                .orElse(0.0);
        analytics.setAverageAttendeesPerReservation(avgAttendees);
        
        // Reservations by resource type
        Map<String, Long> byResourceType = reservations.stream()
                .filter(r -> r.getResource() != null && r.getResource().getType() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getResource().getType().name(),
                        Collectors.counting()
                ));
        analytics.setReservationsByResourceType(byResourceType);
        
        // Reservations by resource name
        Map<String, Long> byResourceName = reservations.stream()
                .filter(r -> r.getResource() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getResource().getName(),
                        Collectors.counting()
                ));
        analytics.setReservationsByResourceName(byResourceName);
        
        // Usage by location
        Map<String, Long> byLocation = reservations.stream()
                .filter(r -> r.getResource() != null && r.getResource().getLocation() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getResource().getLocation(),
                        Collectors.counting()
                ));
        analytics.setUsageByLocation(byLocation);
        
        // Reservations by user (top users)
        Map<String, Long> byUser = reservations.stream()
                .collect(Collectors.groupingBy(
                        Reservation::getUserId,
                        Collectors.counting()
                ));
        analytics.setReservationsByUser(byUser);
        
        // Users with multiple reservations
        long usersWithMultiple = byUser.values().stream()
                .filter(count -> count > 1)
                .count();
        analytics.setUsersWithMultipleReservations(usersWithMultiple);
        
        // Reservations by day of week
        Map<String, Long> byDayOfWeek = reservations.stream()
                .filter(r -> r.getReservationDate() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getReservationDate().getDayOfWeek().name(),
                        Collectors.counting()
                ));
        analytics.setReservationsByDayOfWeek(byDayOfWeek);
        
        // Reservations by hour (grouped)
        Map<String, Long> byHour = reservations.stream()
                .filter(r -> r.getStartTime() != null)
                .collect(Collectors.groupingBy(
                        r -> String.format("%02d:00", r.getStartTime().getHour()),
                        Collectors.counting()
                ));
        analytics.setReservationsByHour(byHour);
        
        // Peak usage calculations
        analytics.setPeakUsageDay(byDayOfWeek.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A"));
        
        analytics.setPeakUsageHour(byHour.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A"));
        
        analytics.setMostPopularResource(byResourceName.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A"));
        
        return analytics;
    }
}
