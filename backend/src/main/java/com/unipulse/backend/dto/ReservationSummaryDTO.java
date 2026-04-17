package com.unipulse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Summary statistics DTO returned as part of the user/admin dashboards.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationSummaryDTO {
    private long totalRequests;
    private long pendingCount;
    private long approvedCount;
    private long rejectedCount;
    private long cancelledCount;
}
