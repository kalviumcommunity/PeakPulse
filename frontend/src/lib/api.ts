// API client for backend analytics endpoints
const API_BASE = 'http://localhost:5000/api';

// Get token from localStorage (set during signin)
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}

// Analytics API
export interface OverviewStats {
  totalDeliveries: number;
  deliveredDeliveries: number;
  slaBreaches: number;
  slaBreachPercentage: number;
  averageDeliveryTime: number;
  averageDelay: number;
  complaintCount: number;
  complaintRate: number;
  refundCount: number;
  refundRate: number;
}

export interface SLAStats {
  totalDeliveries: number;
  breachedDeliveries: number;
  breachPercentage: number;
  averageDelay: number;
  onTimePercentage: number;
}

export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface PeakHourFilter extends DateFilter {
  zone?: string;
  restaurantId?: string;
  riderId?: string;
  peakOnly?: boolean;
}

export interface HourlyAnalytics {
  hour: number;
  peakHour: boolean;
  totalDeliveries: number;
  slaBreaches: number;
  slaBreachRate: number;
  averageDeliveryTime: number;
  averageDelay: number;
}

export interface PeakComparison {
  peak: {
    totalDeliveries: number;
    slaBreaches: number;
    slaBreachRate: number;
    averageDelay: number;
  };
  nonPeak: {
    totalDeliveries: number;
    slaBreaches: number;
    slaBreachRate: number;
    averageDelay: number;
  };
  breachRateDifference: number;
}

export interface RiskPattern {
  pattern: string;
  totalDeliveries: number;
  slaBreaches: number;
  slaBreachRate: number;
}

export const analyticsAPI = {
  getOverview: (filter: DateFilter = {}) => 
    fetchAPI<OverviewStats>('/analytics/overview', { params: filter as Record<string, string> }),
  
  getSLA: (filter: DateFilter = {}) => 
    fetchAPI<SLAStats>('/analytics/sla', { params: filter as Record<string, string> }),
  
  getHourlyAnalytics: (filter: PeakHourFilter = {}) => 
    fetchAPI<HourlyAnalytics[]>('/analytics/peak-hours', { params: filter as Record<string, string> }),
  
  getPeakComparison: (filter: PeakHourFilter = {}) => 
    fetchAPI<PeakComparison>('/analytics/peak-hours/comparison', { params: filter as Record<string, string> }),
  
  getRiskPatterns: (filter: PeakHourFilter = {}) => 
    fetchAPI<RiskPattern[]>('/analytics/risk-patterns', { params: filter as Record<string, string> }),
};
