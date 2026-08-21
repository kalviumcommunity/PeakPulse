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

// ============================================
// Phase 4: SLA Risk Scoring Types & API Client
// ============================================
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  factor: string;
  category: string;
  score: number;
  maxScore: number;
  detail: string;
  severity: RiskLevel;
}

export interface DeliveryRiskAssessment {
  deliveryId?: string;
  orderId?: string;
  restaurantId?: string;
  restaurantName?: string;
  riderId?: string;
  riderName?: string;
  riderCode?: string;
  vehicleType?: string;
  customerZone: string;
  distanceKm: number;
  assignedAt: string;
  promisedTime: string;
  pickedAt?: string | null;
  status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  riskScore: number;
  riskLevel: RiskLevel;
  estimatedBreachProbability: number;
  estimatedMinutesToDelivery: number;
  projectedDeliveryTime: string;
  slaHeadroomMinutes: number;
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskSummary {
  totalActive: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  averageRiskScore: number;
  criticalPercentage: number;
  highRiskPercentage: number;
  topContributingFactors: {
    factor: string;
    occurrences: number;
    averageScore: number;
  }[];
}

export interface RiskSimulationParams {
  distanceKm: number;
  customerZone?: string;
  vehicleType?: string;
  orderTimeHour?: number;
  assignmentDelayMinutes?: number;
  promisedDurationMinutes?: number;
  restaurantName?: string;
}

export const riskAPI = {
  getActive: (filter: { riskLevel?: RiskLevel; zone?: string; limit?: number; page?: number } = {}) =>
    fetchAPI<DeliveryRiskAssessment[]>('/risk/active', {
      params: filter as Record<string, string>
    }),

  getSummary: () =>
    fetchAPI<RiskSummary>('/risk/summary'),

  getById: (id: string) =>
    fetchAPI<DeliveryRiskAssessment>(`/risk/delivery/${id}`),

  evaluate: (params: RiskSimulationParams) =>
    fetchAPI<DeliveryRiskAssessment>('/risk/evaluate', {
      method: 'POST',
      body: JSON.stringify(params)
    })
};

