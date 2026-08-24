export type ModelAlgorithm = 'random_forest' | 'logistic_regression' | 'gradient_boost';

export type MLRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WeatherCondition = 'CLEAR' | 'RAIN' | 'STORM' | 'HEAVY_TRAFFIC' | 'FOG';

export interface DeliveryFeatures {
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
  weatherCondition?: WeatherCondition | string;
  orderValue?: number;
}

export interface FeatureContribution {
  featureName: string;
  label: string;
  rawValue: number | string;
  impactScore: number; // Positive = pushes risk higher, Negative = lowers risk
  direction: 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL';
  description: string;
}

export interface PrescriptiveAction {
  id: string;
  title: string;
  description: string;
  estimatedRiskReduction: number; // e.g., 0.35 = drops breach probability by 35%
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  actionType: 'RIDER_REASSIGNMENT' | 'KITCHEN_EXPEDITE' | 'ROUTE_OPTIMIZATION' | 'CUSTOMER_ALERT';
}

export interface MLPredictionResult {
  breachProbability: number; // 0.0 to 1.0 (P(Breach))
  breachPercentage: number; // 0 to 100
  predictedLabel: 0 | 1; // 0 = On Time, 1 = SLA Breach
  riskLevel: MLRiskLevel;
  confidence: number; // 0.0 to 1.0
  decisionThreshold: number; // e.g. 0.50
  modelUsed: ModelAlgorithm;
  modelVersion: string;
  featureContributions: FeatureContribution[];
  prescriptiveActions: PrescriptiveAction[];
  inputFeatures: DeliveryFeatures;
  timestamp: string;
}

export interface ConfusionMatrix {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  totalSamples: number;
}

export interface ROCCurvePoint {
  threshold: number;
  fpr: number; // False Positive Rate (1 - Specificity)
  tpr: number; // True Positive Rate (Sensitivity / Recall)
  precision: number;
}

export interface PRCurvePoint {
  threshold: number;
  recall: number;
  precision: number;
}

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number; // 0.0 to 1.0 (normalized)
  coefficientSign: '+' | '-';
  rank: number;
  category: 'OPERATIONAL' | 'SPATIAL' | 'TEMPORAL' | 'FLEET' | 'ENVIRONMENTAL';
}

export interface MLEvaluationMetrics {
  accuracy: number; // (TP + TN) / Total
  precision: number; // TP / (TP + FP)
  recall: number; // TP / (TP + FN) - Sensitivity
  specificity: number; // TN / (TN + FP)
  f1Score: number; // 2 * (P * R) / (P + R)
  rocAuc: number; // Area under ROC curve
  logLoss: number; // Binary cross-entropy
  confusionMatrix: ConfusionMatrix;
  optimalThreshold: number; // Threshold that maximizes F1
  trainSamples: number;
  testSamples: number;
  breachPrevalence: number; // Baseline breach rate in dataset
}

export interface ModelComparisonResult {
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

export interface ModelTrainingConfig {
  algorithm?: ModelAlgorithm;
  testSplitRatio?: number; // e.g. 0.2 (20% test, 80% train)
  nEstimators?: number; // For Random Forest
  maxDepth?: number; // For trees
  regularizationC?: number; // For Logistic Regression (inverse reg strength)
  learningRate?: number; // For Gradient Boost / SGD
  randomSeed?: number;
  syntheticAugmentationSize?: number;
}

export interface BatchPredictionItem {
  id?: string;
  orderId?: string;
  features: DeliveryFeatures;
}

export interface BatchPredictionResponse {
  totalProcessed: number;
  averageBreachProbability: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  predictions: (MLPredictionResult & { id?: string; orderId?: string })[];
}
