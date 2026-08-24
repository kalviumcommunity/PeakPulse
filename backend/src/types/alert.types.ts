export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

export type AlertCategory =
  | 'ZONE_BREACH_SURGE'
  | 'RESTAURANT_PREP_DELAY'
  | 'HIGH_RISK_SURGE'
  | 'FLEET_SHORTAGE'
  | 'WEATHER_HAZARD';

export type RootCauseCategory =
  | 'KITCHEN_BOTTLENECK'
  | 'TRAFFIC_GRIDLOCK'
  | 'COURIER_SHORTAGE'
  | 'WEATHER_DISRUPTION'
  | 'ORDER_SPIKE'
  | 'SYSTEM_LATENCY'
  | 'OTHER';

export interface AlertMetricSnapshot {
  currentValue: number;
  thresholdValue: number;
  unit: string;
  comparison: '>' | '>=' | '<' | '<=';
  deltaPercentage?: number;
}

export interface OperationalAlert {
  id: string; // e.g. "ALT-1001"
  ruleId: string; // e.g. "RULE_ZONE_BREACH"
  category: AlertCategory;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  zone?: string;
  restaurantId?: string;
  restaurantName?: string;
  metrics: AlertMetricSnapshot;
  affectedCount: number; // Count of affected deliveries/riders
  recommendedActions: string[];
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  rootCause?: RootCauseCategory | string;
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
  meanTimeToAcknowledgeMinutes: number; // MTTA
  meanTimeToResolveMinutes: number; // MTTR
  categoryBreakdown: {
    category: AlertCategory;
    count: number;
    severity: AlertSeverity;
  }[];
}

export interface AlertFilter {
  status?: AlertStatus;
  severity?: AlertSeverity;
  category?: AlertCategory;
  zone?: string;
  restaurantId?: string;
  limit?: number;
  page?: number;
}

export interface AcknowledgeAlertDTO {
  acknowledgedBy: string;
}

export interface ResolveAlertDTO {
  resolvedBy: string;
  resolutionNotes: string;
  rootCause?: RootCauseCategory | string;
}

export interface SimulateAlertDTO {
  category: AlertCategory;
  severity?: AlertSeverity;
  zone?: string;
  restaurantName?: string;
  currentValue?: number;
  thresholdValue?: number;
  affectedCount?: number;
}
