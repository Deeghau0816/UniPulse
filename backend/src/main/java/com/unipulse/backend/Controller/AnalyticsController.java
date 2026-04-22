package com.unipulse.backend.Controller;

import com.unipulse.backend.dto.AnalyticsDTO;
import com.unipulse.backend.dto.ResourceAnalyticsDTO;
import com.unipulse.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:8081"})
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    
    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }
    
    /**
     * Get overall analytics for all tickets
     */
    @GetMapping("/overall")
    public ResponseEntity<AnalyticsDTO> getOverallAnalytics() {
        AnalyticsDTO analytics = analyticsService.getOverallAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get analytics for today
     */
    @GetMapping("/today")
    public ResponseEntity<AnalyticsDTO> getTodayAnalytics() {
        AnalyticsDTO analytics = analyticsService.getTodayAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get analytics for this week
     */
    @GetMapping("/week")
    public ResponseEntity<AnalyticsDTO> getWeekAnalytics() {
        AnalyticsDTO analytics = analyticsService.getWeekAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get analytics for this month
     */
    @GetMapping("/month")
    public ResponseEntity<AnalyticsDTO> getMonthAnalytics() {
        AnalyticsDTO analytics = analyticsService.getMonthAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get analytics for this year
     */
    @GetMapping("/year")
    public ResponseEntity<AnalyticsDTO> getYearAnalytics() {
        AnalyticsDTO analytics = analyticsService.getYearAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get analytics for a custom date range
     */
    @GetMapping("/custom")
    public ResponseEntity<AnalyticsDTO> getCustomAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().build();
        }
        
        AnalyticsDTO analytics = analyticsService.getAnalyticsByPeriod(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get KPI summary (key metrics)
     */
    @GetMapping("/kpi")
    public ResponseEntity<AnalyticsDTO> getKPISummary() {
        AnalyticsDTO analytics = analyticsService.getOverallAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    // ─── Resource Analytics Endpoints ───────────────────────────────────────────
    
    /**
     * Get comprehensive resource utilization analytics
     */
    @GetMapping("/resources")
    public ResponseEntity<ResourceAnalyticsDTO> getResourceAnalytics() {
        ResourceAnalyticsDTO analytics = analyticsService.getResourceAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get resource analytics for today
     */
    @GetMapping("/resources/today")
    public ResponseEntity<ResourceAnalyticsDTO> getResourceAnalyticsToday() {
        ResourceAnalyticsDTO analytics = analyticsService.getResourceAnalyticsToday();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get resource analytics for this week
     */
    @GetMapping("/resources/week")
    public ResponseEntity<ResourceAnalyticsDTO> getResourceAnalyticsWeek() {
        ResourceAnalyticsDTO analytics = analyticsService.getResourceAnalyticsWeek();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get resource analytics for this month
     */
    @GetMapping("/resources/month")
    public ResponseEntity<ResourceAnalyticsDTO> getResourceAnalyticsMonth() {
        ResourceAnalyticsDTO analytics = analyticsService.getResourceAnalyticsMonth();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get resource analytics for this year
     */
    @GetMapping("/resources/year")
    public ResponseEntity<ResourceAnalyticsDTO> getResourceAnalyticsYear() {
        ResourceAnalyticsDTO analytics = analyticsService.getResourceAnalyticsYear();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get resource analytics for a custom date range
     */
    @GetMapping("/resources/custom")
    public ResponseEntity<ResourceAnalyticsDTO> getResourceAnalyticsCustom(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().build();
        }
        
        ResourceAnalyticsDTO analytics = analyticsService.getResourceAnalyticsByPeriod(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }
}
