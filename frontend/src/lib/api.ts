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

// ============================================
// Phase 5: Machine Learning SLA Breach Predictor
// ============================================

export type ModelAlgorithm = 'random_forest' | 'logistic_regression' | 'gradient_boost';
export type MLRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MLFeatureContribution {
  featureName: string;
  label: string;
  rawValue: number | string;
  impactScore: number;
  direction: 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL';
  description: string;
}

export interface MLPrescriptiveAction {
  id: string;
  title: string;
  description: string;
  estimatedRiskReduction: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  actionType: 'RIDER_REASSIGNMENT' | 'KITCHEN_EXPEDITE' | 'ROUTE_OPTIMIZATION' | 'CUSTOMER_ALERT';
}

export interface MLDeliveryFeatures {
  distanceKm: number;
  assignmentDelayMinutes: number;
  prepDelayMinutes?: number;
  orderHour?: number;
  dayOfWeek?: number;
  isPeakHour?: boolean;
  promisedDurationMinutes?: number;
  customerZone?: string;
  zoneBreachRate?: number;
  restaurantName?: string;
  restaurantBreachRate?: number;
  riderName?: string;
  riderRating?: number;
  riderExperienceDeliveries?: number;
  vehicleType?: 'BIKE' | 'SCOOTER' | 'MOTORCYCLE' | 'CAR' | 'BICYCLE' | string;
  weatherCondition?: 'CLEAR' | 'RAIN' | 'STORM' | 'HEAVY_TRAFFIC' | 'FOG' | string;
  orderValue?: number;
}

export interface MLPredictionResult {
  breachProbability: number;
  breachPercentage: number;
  predictedLabel: 0 | 1;
  riskLevel: MLRiskLevel;
  confidence: number;
  decisionThreshold: number;
  modelUsed: ModelAlgorithm;
  modelVersion: string;
  featureContributions: MLFeatureContribution[];
  prescriptiveActions: MLPrescriptiveAction[];
  inputFeatures: MLDeliveryFeatures;
  timestamp: string;
}

export interface MLConfusionMatrix {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  totalSamples: number;
}

export interface MLROCCurvePoint {
  threshold: number;
  fpr: number;
  tpr: number;
  precision: number;
}

export interface MLPRCurvePoint {
  threshold: number;
  recall: number;
  precision: number;
}

export interface MLFeatureImportanceItem {
  feature: string;
  label: string;
  importance: number;
  coefficientSign: '+' | '-';
  rank: number;
  category: 'OPERATIONAL' | 'SPATIAL' | 'TEMPORAL' | 'FLEET' | 'ENVIRONMENTAL';
}

export interface MLEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1Score: number;
  rocAuc: number;
  logLoss: number;
  confusionMatrix: MLConfusionMatrix;
  optimalThreshold: number;
  trainSamples: number;
  testSamples: number;
  breachPrevalence: number;
}

export interface MLModelComparisonResult {
  algorithm: ModelAlgorithm;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  trainingTimeMs: number;
  inferenceLatencyMs: number;
  isCurrentActive: boolean;
}

export interface MLTrainingConfig {
  algorithm?: ModelAlgorithm;
  testSplitRatio?: number;
  nEstimators?: number;
  maxDepth?: number;
  regularizationC?: number;
  learningRate?: number;
  randomSeed?: number;
}

export interface MLBatchResponse {
  totalProcessed: number;
  averageBreachProbability: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  predictions: (MLPredictionResult & { id?: string; orderId?: string })[];
}

export const mlAPI = {
  predict: (features: MLDeliveryFeatures) =>
    fetchAPI<MLPredictionResult>('/ml/predict', {
      method: 'POST',
      body: JSON.stringify(features)
    }),

  batchPredict: (items: { id?: string; orderId?: string; features: MLDeliveryFeatures }[]) =>
    fetchAPI<MLBatchResponse>('/ml/batch-predict', {
      method: 'POST',
      body: JSON.stringify({ items })
    }),

  train: (config: MLTrainingConfig = {}) =>
    fetchAPI<{ metrics: MLEvaluationMetrics; modelInfo: any }>('/ml/train', {
      method: 'POST',
      body: JSON.stringify(config)
    }),

  getMetrics: () =>
    fetchAPI<{ metrics: MLEvaluationMetrics; modelInfo: any }>('/ml/metrics'),

  getROCCurve: () =>
    fetchAPI<{ roc: MLROCCurvePoint[]; pr: MLPRCurvePoint[]; rocAuc: number }>('/ml/roc-curve'),

  getFeatureImportance: () =>
    fetchAPI<MLFeatureImportanceItem[]>('/ml/feature-importance'),

  getModelComparison: () =>
    fetchAPI<MLModelComparisonResult[]>('/ml/models'),

  getModelInfo: () =>
    fetchAPI<{ activeAlgorithm: ModelAlgorithm; modelVersion: string; metrics: MLEvaluationMetrics }>('/ml/model-info')
};

// ============================================
// Phase 6: Operational Alerts System
// ============================================

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
export type AlertCategory =
  | 'ZONE_BREACH_SURGE'
  | 'RESTAURANT_PREP_DELAY'
  | 'HIGH_RISK_SURGE'
  | 'FLEET_SHORTAGE'
  | 'WEATHER_HAZARD';

export interface AlertMetricSnapshot {
  currentValue: number;
  thresholdValue: number;
  unit: string;
  comparison: '>' | '>=' | '<' | '<=';
  deltaPercentage?: number;
}

export interface OperationalAlert {
  id: string;
  ruleId: string;
  category: AlertCategory;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  zone?: string;
  restaurantId?: string;
  restaurantName?: string;
  metrics: AlertMetricSnapshot;
  affectedCount: number;
  recommendedActions: string[];
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  rootCause?: string;
  cooldownUntil?: string;
}

export interface AlertRuleConfig {
  id: string;
  name: string;
  category: AlertCategory;
  description: string;
  severity: AlertSeverity;
  thresholdValue: number;
  unit: string;
  comparison: '>' | '>=' | '<' | '<=';
  cooldownMinutes: number;
  enabled: boolean;
  recommendedActionTemplate: string;
}

export interface AlertSummaryKPI {
  totalActive: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  acknowledgedCount: number;
  resolvedTodayCount: number;
  meanTimeToAcknowledgeMinutes: number;
  meanTimeToResolveMinutes: number;
  categoryBreakdown: {
    category: AlertCategory;
    count: number;
    severity: AlertSeverity;
  }[];
}

export const alertsAPI = {
  getAlerts: (filter: { status?: AlertStatus; severity?: AlertSeverity; category?: AlertCategory; zone?: string; limit?: number; page?: number } = {}) =>
    fetchAPI<OperationalAlert[]>('/alerts', {
      params: filter as Record<string, string>
    }),

  getActive: () =>
    fetchAPI<OperationalAlert[]>('/alerts/active'),

  getSummary: () =>
    fetchAPI<AlertSummaryKPI>('/alerts/summary'),

  getById: (id: string) =>
    fetchAPI<OperationalAlert>(`/alerts/${id}`),

  evaluate: () =>
    fetchAPI<{ newAlertsCount: number; updatedAlertsCount: number; evaluatedRules: number }>('/alerts/evaluate', {
      method: 'POST'
    }),

  acknowledge: (id: string, acknowledgedBy: string = 'Analyst') =>
    fetchAPI<OperationalAlert>(`/alerts/${id}/acknowledge`, {
      method: 'PATCH',
      body: JSON.stringify({ acknowledgedBy })
    }),

  resolve: (id: string, resolutionNotes: string, resolvedBy: string = 'Analyst', rootCause: string = 'OTHER') =>
    fetchAPI<OperationalAlert>(`/alerts/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolvedBy, resolutionNotes, rootCause })
    }),

  dismiss: (id: string, reason?: string) =>
    fetchAPI<OperationalAlert>(`/alerts/${id}/dismiss`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    }),

  getRules: () =>
    fetchAPI<AlertRuleConfig[]>('/alerts/rules'),

  updateRule: (id: string, updates: Partial<AlertRuleConfig>) =>
    fetchAPI<AlertRuleConfig>(`/alerts/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  simulate: (dto: { category: AlertCategory; severity?: AlertSeverity; zone?: string; restaurantName?: string; currentValue?: number; thresholdValue?: number; affectedCount?: number }) =>
    fetchAPI<OperationalAlert>('/alerts/simulate', {
      method: 'POST',
      body: JSON.stringify(dto)
    })
};



