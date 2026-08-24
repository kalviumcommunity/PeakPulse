export type NLPIntent =
  | 'RANKING_QUERY'
  | 'METRIC_AGGREGATION'
  | 'COMPARISON_QUERY'
  | 'TIME_SERIES_TREND'
  | 'ROOT_CAUSE_DIAGNOSIS'
  | 'ANOMALY_LOOKUP'
  | 'FILTERED_BREAKDOWN'
  | 'GENERAL_HELP';

export type TargetMetric =
  | 'SLA_BREACHES'
  | 'BREACH_RATE'
  | 'AVG_DELIVERY_TIME'
  | 'PREP_DELAY'
  | 'ASSIGNMENT_DELAY'
  | 'ORDER_COUNT'
  | 'REFUND_AMOUNT'
  | 'COMPLAINTS'
  | 'RIDER_RATING';

export type ChartType = 'bar' | 'kpi' | 'pie' | 'line' | 'table';

export interface NLPEntities {
  zone?: string;
  normalizedZone?: string;
  restaurant?: string;
  normalizedRestaurant?: string;
  rider?: string;
  normalizedRider?: string;
  vehicleType?: string;
  mealWindow?: 'LUNCH' | 'DINNER' | 'OFF_PEAK' | 'ALL';
  hourRange?: { start: number; end: number };
  dateRange?: { start?: string; end?: string; label?: string };
  targetMetric?: TargetMetric;
  aggregation?: 'COUNT' | 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'RATE';
  limit?: number;
  sortDirection?: 'DESC' | 'ASC';
  groupBy?: 'restaurant' | 'zone' | 'rider' | 'hour' | 'vehicle' | 'none';
}

export interface AnalyticalQueryPlan {
  intent: NLPIntent;
  entities: NLPEntities;
  filters: Record<string, any>;
  groupBy: string[];
  aggregations: { field: string; op: string; alias: string }[];
  orderBy: { field: string; direction: 'ASC' | 'DESC' };
  limit: number;
  generatedSQL: string;
  explanation: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  unit?: string;
  category?: string;
  color?: string;
}

export interface NLPQueryResult {
  query: string;
  intent: NLPIntent;
  answer: string;
  queryPlan: AnalyticalQueryPlan;
  generatedSQL: string;
  chartType: ChartType;
  chartTitle?: string;
  chartData: ChartDataPoint[];
  tableData?: Record<string, any>[];
  keyTakeaways: string[];
  suggestedFollowUps: string[];
  confidenceScore: number;
  executionTimeMs: number;
  timestamp: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  result?: NLPQueryResult;
  timestamp: string;
}

export interface PromptSuggestion {
  category: string;
  icon: string;
  prompts: string[];
}
