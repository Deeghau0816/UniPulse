package com.unipulse.backend.dto;

import java.util.Map;

public class TicketCategoryAnalyticsDTO {
    
    private Map<String, Integer> categoryCounts;
    private String period;
    
    public TicketCategoryAnalyticsDTO() {}
    
    public TicketCategoryAnalyticsDTO(Map<String, Integer> categoryCounts, String period) {
        this.categoryCounts = categoryCounts;
        this.period = period;
    }
    
    public Map<String, Integer> getCategoryCounts() {
        return categoryCounts;
    }
    
    public void setCategoryCounts(Map<String, Integer> categoryCounts) {
        this.categoryCounts = categoryCounts;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
}
