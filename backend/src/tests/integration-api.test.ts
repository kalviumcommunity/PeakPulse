import { MLPredictorService } from '../services/ml-predictor.service.js';
import { AlertsService } from '../services/alerts.service.js';
import { NLPAnalyticsService } from '../services/nlp-analytics.service.js';
import { RiskScoringService } from '../services/risk-scoring.service.js';

console.log('🧪 =========================================================================');
console.log('🧪 PeakPulse Phase 8: Comprehensive End-to-End Integration & API Test Suite');
console.log('🧪 =========================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

async function runComprehensiveIntegrationSuite() {
  const tSuiteStart = Date.now();

  // -------------------------------------------------------------------------
  // MODULE 1: Risk Scoring & Real-Time Telemetry Engine
  // -------------------------------------------------------------------------
  console.log('--- 1. Risk Scoring & SLA Breach Mitigation Engine ---');
  const riskService = new RiskScoringService();
  const sampleDelivery = {
    orderId: 'ORD-INT-9901',
    restaurantId: 'rest-taco-01',
    riderId: 'rider-rahul-01',
    customerZone: 'Uptown - Zone C',
    distanceKm: 6.2,
    assignedAt: new Date(Date.now() - 25 * 60000),
    promisedTime: new Date(Date.now() + 5 * 60000),
    restaurant: { name: 'Taco Fiesta' },
    rider: { name: 'Rahul Kumar', riderCode: 'R-01', vehicleType: 'BIKE' }
  };

  const riskResult = riskService.calculateRisk(sampleDelivery as any, { zoneBreachRate: 34.1, restaurantBreachRate: 41.2 });
  assert(riskResult.riskScore >= 50, `Risk score calculated for congested delivery (${riskResult.riskScore}/100)`);
  assert(riskResult.riskLevel === 'HIGH' || riskResult.riskLevel === 'CRITICAL', `Risk tier elevated appropriately (${riskResult.riskLevel})`);
  assert(riskResult.factors.length >= 2, `Identified multiple risk factors (${riskResult.factors.length} factors)`);
  assert(riskResult.recommendations.length >= 1, `Generated actionable recommendations (${riskResult.recommendations.length} recommendations)`);

  // -------------------------------------------------------------------------
  // MODULE 2: Machine Learning SLA Breach Predictor (Phase 5)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Machine Learning SLA Breach Classification Engine ---');
  const mlService = new MLPredictorService();
  const mlMetrics = mlService.getMetrics();
  assert(mlMetrics.rocAuc >= 0.85, `ML Classifier ROC-AUC validates at enterprise accuracy (${mlMetrics.rocAuc})`);
  assert(mlMetrics.f1Score >= 0.75, `ML Classifier F1-Score validates (${mlMetrics.f1Score})`);

  const mlPrediction = mlService.predict({
    distanceKm: 8.5,
    assignmentDelayMinutes: 18,
    prepDelayMinutes: 24,
    promisedDurationMinutes: 30,
    customerZone: 'Uptown - Zone C',
    vehicleType: 'BICYCLE',
    weatherCondition: 'STORM',
    orderHour: 20
  });

  assert(mlPrediction.breachProbability >= 0.70, `High danger order predicts high P(Breach) (${(mlPrediction.breachProbability * 100).toFixed(1)}%)`);
  assert(mlPrediction.predictedLabel === 1, 'Predicted binary label is 1 (SLA Breach)');
  assert(mlPrediction.featureContributions.length >= 4, 'Extracted top SHAP-style feature contributions');

  // -------------------------------------------------------------------------
  // MODULE 3: Operational Alerts System & Incident State Machine (Phase 6)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Operational Alerts & Incident Lifecycle Engine ---');
  const alertsService = new AlertsService();
  const activeAlerts = alertsService.getActiveAlerts();
  assert(activeAlerts.length >= 2, `Active alert queue loaded (${activeAlerts.length} active alerts)`);

  const evalResult = alertsService.evaluateOperationalRules();
  assert(evalResult.evaluatedRules === 5, 'Evaluated all 5 core operational trigger rules');

  const alertToTriage = alertsService.getActiveAlerts()[0];
  const acked = alertsService.acknowledgeAlert(alertToTriage.id, { acknowledgedBy: 'Lead Ops Controller' });
  assert(acked?.status === 'ACKNOWLEDGED', `Alert ${alertToTriage.id} transitioned to ACKNOWLEDGED`);

  const resolved = alertsService.resolveAlert(alertToTriage.id, {
    resolvedBy: 'Lead Ops Controller',
    resolutionNotes: 'Reallocated 5 motorized couriers to clear backlog in Zone C.',
    rootCause: 'COURIER_SHORTAGE'
  });
  assert(resolved?.status === 'RESOLVED', `Alert ${alertToTriage.id} transitioned to RESOLVED`);
  assert(resolved?.rootCause === 'COURIER_SHORTAGE', 'Root cause correctly recorded in incident audit log');

  const kpis = alertsService.getSummaryKPI();
  assert(kpis.meanTimeToAcknowledgeMinutes > 0, `Computed MTTA KPI (${kpis.meanTimeToAcknowledgeMinutes} mins)`);
  assert(kpis.meanTimeToResolveMinutes > 0, `Computed MTTR KPI (${kpis.meanTimeToResolveMinutes} mins)`);

  // -------------------------------------------------------------------------
  // MODULE 4: NLP / Conversational Analytics Engine (Phase 7)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. NLP Semantic Parsing & Conversational Query Engine ---');
  const nlpService = new NLPAnalyticsService();
  const targetPrompt = 'Which restaurants had the most dinner-time SLA breaches in North Zone?';
  const nlpResult = await nlpService.executeNLPQuery(targetPrompt);

  assert(nlpResult.intent === 'RANKING_QUERY', `Intent correctly classified as RANKING_QUERY (${nlpResult.intent})`);
  assert(nlpResult.queryPlan.entities.normalizedZone === 'Uptown - Zone C', `Fuzzy entity 'North Zone' mapped to 'Uptown - Zone C'`);
  assert(nlpResult.queryPlan.entities.mealWindow === 'DINNER', `Meal window identified as DINNER`);
  assert(nlpResult.answer.includes('Taco Fiesta'), 'Answer text correctly highlights top breached merchant (Taco Fiesta)');
  assert(nlpResult.chartType === 'bar', `Formatted visual chart schema as bar chart (${nlpResult.chartType})`);
  assert(nlpResult.generatedSQL.includes('d.customer_zone'), 'Generated transparent SQL query plan');
  assert(nlpResult.keyTakeaways.length >= 3, 'Generated prescriptive takeaways');
  assert(nlpResult.suggestedFollowUps.length >= 4, 'Provided smart follow-up suggestions');

  // -------------------------------------------------------------------------
  // MODULE 5: Query Execution & Analytical Latency Benchmark
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Analytical Execution & Database Latency Benchmark ---');
  const tQueryStart = Date.now();
  await nlpService.executeNLPQuery('Compare breach rates across all zones during peak hours');
  const queryDuration = Date.now() - tQueryStart;
  assert(queryDuration < 50, `Complex multi-zone analytical query executed in sub-50ms (${queryDuration}ms)`);

  const totalDuration = Date.now() - tSuiteStart;
  console.log('\n=========================================================================');
  console.log(`🎉 Comprehensive Integration Test Suite: ${passed} Passed, ${failed} Failed (${totalDuration}ms)`);
  console.log('=========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runComprehensiveIntegrationSuite().catch(err => {
  console.error('Integration test suite failed:', err);
  process.exit(1);
});
