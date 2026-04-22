package com.unipulse.backend.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ResourceAnalyticsDTO {
    
    // Period info
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String period;
    
    // Overall metrics
    private Long totalReservations;
    private Long totalResourcesUsed;
    private Long uniqueUsers;
    private Double averageReservationDuration;
    private Double averageAttendeesPerReservation;
    
    // Status breakdown
    private Long pendingCount;
    private Long approvedCount;
    private Long rejectedCount;
    private Long cancelledCount;
    
    // Resource utilization
    private Map<String, Long> reservationsByResourceType;
    private Map<String, Long> reservationsByResourceName;
    private Map<String, Long> usageByLocation;
    
    // User analytics
    private Map<String, Long> reservationsByUser;
    private Long usersWithMultipleReservations;
    
    // Time-based analytics
    private Map<String, Long> reservationsByDayOfWeek;
    private Map<String, Long> reservationsByHour;
    
    // Peak usage
    private String peakUsageDay;
    private String peakUsageHour;
    private String mostPopularResource;
    
    // Constructors
    public ResourceAnalyticsDTO() {}
    
    public ResourceAnalyticsDTO(String period) {
        this.period = period;
    }
    
    // Getters and Setters
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
    
    public Long getTotalReservations() {
        return totalReservations;
    }
    
    public void setTotalReservations(Long totalReservations) {
        this.totalReservations = totalReservations;
    }
    
    public Long getTotalResourcesUsed() {
        return totalResourcesUsed;
    }
    
    public void setTotalResourcesUsed(Long totalResourcesUsed) {
        this.totalResourcesUsed = totalResourcesUsed;
    }
    
    public Long getUniqueUsers() {
        return uniqueUsers;
    }
    
    public void setUniqueUsers(Long uniqueUsers) {
        this.uniqueUsers = uniqueUsers;
    }
    
    public Double getAverageReservationDuration() {
        return averageReservationDuration;
    }
    
    public void setAverageReservationDuration(Double averageReservationDuration) {
        this.averageReservationDuration = averageReservationDuration;
    }
    
    public Double getAverageAttendeesPerReservation() {
        return averageAttendeesPerReservation;
    }
    
    public void setAverageAttendeesPerReservation(Double averageAttendeesPerReservation) {
        this.averageAttendeesPerReservation = averageAttendeesPerReservation;
    }
    
    public Long getPendingCount() {
        return pendingCount;
    }
    
    public void setPendingCount(Long pendingCount) {
        this.pendingCount = pendingCount;
    }
    
    public Long getApprovedCount() {
        return approvedCount;
    }
    
    public void setApprovedCount(Long approvedCount) {
        this.approvedCount = approvedCount;
    }
    
    public Long getRejectedCount() {
        return rejectedCount;
    }
    
    public void setRejectedCount(Long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }
    
    public Long getCancelledCount() {
        return cancelledCount;
    }
    
    public void setCancelledCount(Long cancelledCount) {
        this.cancelledCount = cancelledCount;
    }
    
    public Map<String, Long> getReservationsByResourceType() {
        return reservationsByResourceType;
    }
    
    public void setReservationsByResourceType(Map<String, Long> reservationsByResourceType) {
        this.reservationsByResourceType = reservationsByResourceType;
    }
    
    public Map<String, Long> getReservationsByResourceName() {
        return reservationsByResourceName;
    }
    
    public void setReservationsByResourceName(Map<String, Long> reservationsByResourceName) {
        this.reservationsByResourceName = reservationsByResourceName;
    }
    
    public Map<String, Long> getUsageByLocation() {
        return usageByLocation;
    }
    
    public void setUsageByLocation(Map<String, Long> usageByLocation) {
        this.usageByLocation = usageByLocation;
    }
    
    public Map<String, Long> getReservationsByUser() {
        return reservationsByUser;
    }
    
    public void setReservationsByUser(Map<String, Long> reservationsByUser) {
        this.reservationsByUser = reservationsByUser;
    }
    
    public Long getUsersWithMultipleReservations() {
        return usersWithMultipleReservations;
    }
    
    public void setUsersWithMultipleReservations(Long usersWithMultipleReservations) {
        this.usersWithMultipleReservations = usersWithMultipleReservations;
    }
    
    public Map<String, Long> getReservationsByDayOfWeek() {
        return reservationsByDayOfWeek;
    }
    
    public void setReservationsByDayOfWeek(Map<String, Long> reservationsByDayOfWeek) {
        this.reservationsByDayOfWeek = reservationsByDayOfWeek;
    }
    
    public Map<String, Long> getReservationsByHour() {
        return reservationsByHour;
    }
    
    public void setReservationsByHour(Map<String, Long> reservationsByHour) {
        this.reservationsByHour = reservationsByHour;
    }
    
    public String getPeakUsageDay() {
        return peakUsageDay;
    }
    
    public void setPeakUsageDay(String peakUsageDay) {
        this.peakUsageDay = peakUsageDay;
    }
    
    public String getPeakUsageHour() {
        return peakUsageHour;
    }
    
    public void setPeakUsageHour(String peakUsageHour) {
        this.peakUsageHour = peakUsageHour;
    }
    
    public String getMostPopularResource() {
        return mostPopularResource;
    }
    
    public void setMostPopularResource(String mostPopularResource) {
        this.mostPopularResource = mostPopularResource;
    }
}
