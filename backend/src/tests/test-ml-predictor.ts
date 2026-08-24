import { MLPredictorService } from '../services/ml-predictor.service.js';

console.log('🧪 Starting Phase 5 ML SLA Breach Predictor Unit Tests...\n');

const ml = new MLPredictorService();

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

async function runTests() {
  console.log('--- 1. Baseline Model Metrics Verification ---');
  const metrics = ml.getMetrics();
  assert(metrics !== undefined && metrics !== null, 'Model evaluation metrics object is defined');
  assert(metrics.rocAuc >= 0.85, `ROC-AUC score is high (${metrics.rocAuc} >= 0.85)`);
  assert(metrics.accuracy >= 0.85, `Model accuracy is high (${metrics.accuracy} >= 0.85)`);
  assert(metrics.precision >= 0.80, `Model precision is high (${metrics.precision} >= 0.80)`);
  assert(metrics.recall >= 0.75, `Model recall is high (${metrics.recall} >= 0.75)`);
  assert(metrics.f1Score >= 0.75, `Model F1-Score is high (${metrics.f1Score} >= 0.75)`);

  console.log('\n--- 2. ROC & PR Curve Coordinate Generation ---');
  const rocCurve = ml.getROCCurve();
  assert(rocCurve.roc.length > 20, `ROC curve points generated (${rocCurve.roc.length} points)`);
  assert(rocCurve.pr.length > 20, `PR curve points generated (${rocCurve.pr.length} points)`);
  assert(rocCurve.rocAuc >= 0.85, `Returned ROC-AUC matches validation (${rocCurve.rocAuc})`);

  console.log('\n--- 3. Multidimensional Feature Importance ---');
  const featImp = ml.getFeatureImportance();
  assert(featImp.length >= 10, `Feature importance list has ${featImp.length} features`);
  const topFeat = featImp[0];
  assert(topFeat.rank === 1 && topFeat.importance > 0.15, `Top feature ranked with weight > 15% (${topFeat.label} = ${topFeat.importance})`);

  console.log('\n--- 4. Multi-Model Benchmark Comparison ---');
  const comps = ml.getModelComparison();
  assert(comps.length === 3, 'Model comparison benchmark contains 3 algorithms');
  const algorithms = comps.map(c => c.algorithm);
  assert(algorithms.includes('random_forest'), 'Includes Random Forest');
  assert(algorithms.includes('logistic_regression'), 'Includes Logistic Regression');
  assert(algorithms.includes('gradient_boost'), 'Includes Gradient Boost');

  console.log('\n--- 5. Extreme High-Risk Inference Scenario ---');
  // High distance, high delay, bad weather, slow vehicle, high-breach zone
  const highRiskPrediction = ml.predict({
    distanceKm: 8.5,
    assignmentDelayMinutes: 18,
    prepDelayMinutes: 24,
    promisedDurationMinutes: 30,
    customerZone: 'Uptown - Zone C',
    vehicleType: 'BICYCLE',
    weatherCondition: 'STORM',
    orderHour: 20
  });

  assert(highRiskPrediction.breachProbability >= 0.70, `High risk delivery correctly predicts P(Breach) >= 70% (Got ${highRiskPrediction.breachPercentage}%)`);
  assert(highRiskPrediction.riskLevel === 'HIGH' || highRiskPrediction.riskLevel === 'CRITICAL', `Risk level flagged as HIGH/CRITICAL (${highRiskPrediction.riskLevel})`);
  assert(highRiskPrediction.predictedLabel === 1, 'Predicted label is 1 (SLA Breach)');
  assert(highRiskPrediction.featureContributions.length > 0, `Feature contributions extracted (${highRiskPrediction.featureContributions.length} items)`);
  assert(highRiskPrediction.prescriptiveActions.length > 0, `Prescriptive mitigations suggested (${highRiskPrediction.prescriptiveActions.length} actions)`);

  console.log('\n--- 6. Low-Risk Clean Scenario ---');
  // Low distance, no delay, motorcycle, zone A
  const lowRiskPrediction = ml.predict({
    distanceKm: 1.5,
    assignmentDelayMinutes: 1,
    prepDelayMinutes: 8,
    promisedDurationMinutes: 35,
    customerZone: 'Downtown - Zone A',
    vehicleType: 'MOTORCYCLE',
    weatherCondition: 'CLEAR',
    orderHour: 15
  });

  assert(lowRiskPrediction.breachProbability <= 0.25, `Low risk delivery correctly predicts P(Breach) <= 25% (Got ${lowRiskPrediction.breachPercentage}%)`);
  assert(lowRiskPrediction.riskLevel === 'LOW', `Risk level flagged as LOW (${lowRiskPrediction.riskLevel})`);
  assert(lowRiskPrediction.predictedLabel === 0, 'Predicted label is 0 (On-Time)');

  console.log('\n--- 7. Dynamic Model Retraining Verification ---');
  const lrMetrics = ml.trainModelInternal({
    algorithm: 'logistic_regression',
    regularizationC: 1.0,
    testSplitRatio: 0.2
  });
  assert(lrMetrics.rocAuc >= 0.80, `Logistic regression training succeeded (ROC-AUC: ${lrMetrics.rocAuc})`);

  const gbMetrics = ml.trainModelInternal({
    algorithm: 'gradient_boost',
    nEstimators: 20,
    learningRate: 0.1,
    testSplitRatio: 0.2
  });
  assert(gbMetrics.rocAuc >= 0.85, `Gradient boost training succeeded (ROC-AUC: ${gbMetrics.rocAuc})`);

  const rfMetrics = ml.trainModelInternal({
    algorithm: 'random_forest',
    nEstimators: 25,
    maxDepth: 6,
    testSplitRatio: 0.2
  });
  assert(rfMetrics.rocAuc >= 0.88, `Random Forest retraining succeeded (ROC-AUC: ${rfMetrics.rocAuc})`);

  console.log('\n--- 8. Vectorized Batch Prediction ---');
  const batchRes = ml.batchPredict([
    { id: '1', orderId: 'O1', features: { distanceKm: 2, assignmentDelayMinutes: 2 } },
    { id: '2', orderId: 'O2', features: { distanceKm: 8, assignmentDelayMinutes: 15 } }
  ]);
  assert(batchRes.totalProcessed === 2, 'Batch processor processed 2 orders');
  assert(batchRes.predictions.length === 2, 'Batch processor returned 2 predictions');

  console.log('\n==================================================');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
