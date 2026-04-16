package com.unipulse.backend.dto;

import java.time.LocalDateTime;

public class AnalyticsDTO {
    
    // KPI Metrics
    private Long totalOpenTickets;
    private Long totalInProgressTickets;
    private Long totalResolvedTickets;
    private Long totalOverdueTickets;
    private Double averageResolutionTime;
    
    // Additional metrics
    private Long totalTickets;
    private Long totalClosedTickets;
    private Long totalRejectedTickets;
    private Double resolutionRate;
    private Double overdueRate;
    
    // Time period
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String period;
    
    // Constructors
    public AnalyticsDTO() {}
    
    public AnalyticsDTO(String period) {
        this.period = period;
    }
    
    // Getters and Setters
    public Long getTotalOpenTickets() {
        return totalOpenTickets;
    }
    
    public void setTotalOpenTickets(Long totalOpenTickets) {
        this.totalOpenTickets = totalOpenTickets;
    }
    
    public Long getTotalInProgressTickets() {
        return totalInProgressTickets;
    }
    
    public void setTotalInProgressTickets(Long totalInProgressTickets) {
        this.totalInProgressTickets = totalInProgressTickets;
    }
    
    public Long getTotalResolvedTickets() {
        return totalResolvedTickets;
    }
    
    public void setTotalResolvedTickets(Long totalResolvedTickets) {
        this.totalResolvedTickets = totalResolvedTickets;
    }
    
    public Long getTotalOverdueTickets() {
        return totalOverdueTickets;
    }
    
    public void setTotalOverdueTickets(Long totalOverdueTickets) {
        this.totalOverdueTickets = totalOverdueTickets;
    }
    
    public Double getAverageResolutionTime() {
        return averageResolutionTime;
    }
    
    public void setAverageResolutionTime(Double averageResolutionTime) {
        this.averageResolutionTime = averageResolutionTime;
    }
    
    public Long getTotalTickets() {
        return totalTickets;
    }
    
    public void setTotalTickets(Long totalTickets) {
        this.totalTickets = totalTickets;
    }
    
    public Long getTotalClosedTickets() {
        return totalClosedTickets;
    }
    
    public void setTotalClosedTickets(Long totalClosedTickets) {
        this.totalClosedTickets = totalClosedTickets;
    }
    
    public Long getTotalRejectedTickets() {
        return totalRejectedTickets;
    }
    
    public void setTotalRejectedTickets(Long totalRejectedTickets) {
        this.totalRejectedTickets = totalRejectedTickets;
    }
    
    public Double getResolutionRate() {
        return resolutionRate;
    }
    
    public void setResolutionRate(Double resolutionRate) {
        this.resolutionRate = resolutionRate;
    }
    
    public Double getOverdueRate() {
        return overdueRate;
    }
    
    public void setOverdueRate(Double overdueRate) {
        this.overdueRate = overdueRate;
    }
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
}
