export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  factor: string;
  category: 'ASSIGNMENT_DELAY' | 'SLA_HEADROOM' | 'PEAK_HOUR' | 'DISTANCE_VEHICLE' | 'HISTORICAL_ZONE_RESTAURANT';
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
  assignedAt: Date | string;
  promisedTime: Date | string;
  pickedAt?: Date | string | null;
  status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  estimatedBreachProbability: number; // 0.0 to 1.0
  estimatedMinutesToDelivery: number;
  projectedDeliveryTime: Date | string;
  slaHeadroomMinutes: number; // Positive = on-time margin, Negative = projected late
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskSimulationParams {
  distanceKm: number;
  customerZone?: string;
  vehicleType?: string;
  orderTimeHour?: number;
  assignmentDelayMinutes?: number;
  estimatedPrepTimeMinutes?: number;
  promisedDurationMinutes?: number;
  restaurantName?: string;
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
