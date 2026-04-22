interface AnalyticsData {
  totalOpenTickets: number;
  totalInProgressTickets: number;
  totalResolvedTickets: number;
  totalOverdueTickets: number;
  averageResolutionTime: number;
  totalTickets: number;
  totalClosedTickets: number;
  totalRejectedTickets: number;
  resolutionRate: number;
  overdueRate: number;
  period: string;
  startDate?: string;
  endDate?: string;
}

interface TicketCategoryData {
  categoryCounts: Record<string, number>;
  period: string;
}

class AnalyticsService {
  private readonly baseUrl = 'http://localhost:8081/api/analytics';

  async getOverallAnalytics(): Promise<AnalyticsData> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/overall`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch overall analytics');
    }
    return response.json();
  }

  async getTodayAnalytics(): Promise<AnalyticsData> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/today`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch today analytics');
    }
    return response.json();
  }

  async getWeekAnalytics(): Promise<AnalyticsData> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/week`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch week analytics');
    }
    return response.json();
  }

  async getMonthAnalytics(): Promise<AnalyticsData> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/month`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch month analytics');
    }
    return response.json();
  }

  async getYearAnalytics(): Promise<AnalyticsData> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/year`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch year analytics');
    }
    return response.json();
  }

  async getCustomAnalytics(startDate: string, endDate: string): Promise<AnalyticsData> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${this.baseUrl}/custom?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch custom analytics');
    }
    return response.json();
  }

  async getKPISummary(): Promise<AnalyticsData> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/kpi`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch KPI summary');
    }
    return response.json();
  }

  // Helper method to format average resolution time
  formatResolutionTime(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10} hours`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round((hours % 24) * 10) / 10;
      return `${days}d ${remainingHours}h`;
    }
  }

  // Helper method to format percentage
  formatPercentage(value: number): string {
    return `${Math.round(value * 10) / 10}%`;
  }

  // Helper method to format large numbers
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  async getTicketCategoriesAnalytics(): Promise<TicketCategoryData> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/ticket-categories`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch ticket categories analytics');
    }
    return response.json();
  }
}

export const analyticsService = new AnalyticsService();
export type { AnalyticsData, TicketCategoryData };
