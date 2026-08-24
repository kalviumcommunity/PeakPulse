import { RiskScoringService } from '../src/services/risk-scoring.service.js';

async function runRiskScoringTests() {
  console.log('🧪 Starting SLA Risk Scoring Engine Unit Tests...\n');
  const service = new RiskScoringService();
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Low Risk Delivery
  // Short distance (1.8km), off-peak (15:00), 2 min assigned, 25 min headroom
  // -------------------------------------------------------------
  console.log('Test 1: Evaluating Low Risk Delivery Scenario');
  const now = new Date('2026-08-21T15:00:00Z');
  const lowRiskDelivery = {
    id: 'test-del-1',
    orderId: 'ORD-LOW-001',
    customerZone: 'Zone Green',
    distanceKm: 1.8,
    assignedAt: new Date(now.getTime() - 2 * 60000), // 2 mins ago
    promisedTime: new Date(now.getTime() + 25 * 60000), // 25 mins from now
    restaurant: { name: 'Quick Bite Cafe' },
    rider: { name: 'John Rider', riderCode: 'R001', vehicleType: 'MOTORCYCLE' }
  };

  const lowAssessment = service.calculateRisk(lowRiskDelivery, { zoneBreachRate: 5.0, restaurantBreachRate: 4.0 }, now);
  assert(lowAssessment.riskLevel === 'LOW', 'Low risk delivery classified as LOW', `Got ${lowAssessment.riskLevel} with score ${lowAssessment.riskScore}`);
  assert(lowAssessment.riskScore < 35, 'Risk score is < 35', `Score: ${lowAssessment.riskScore}`);
  assert(lowAssessment.factors.length === 5, '5 contributing factors evaluated');

  // -------------------------------------------------------------
  // Test 2: Moderate / High Risk Delivery
  // Dinner peak (20:00), 12m assignment delay, 5.5km distance
  // -------------------------------------------------------------
  console.log('\nTest 2: Evaluating High Risk Delivery Scenario');
  const dinnerPeakTime = new Date('2026-08-21T20:00:00Z');
  const highRiskDelivery = {
    id: 'test-del-2',
    orderId: 'ORD-HIGH-002',
    customerZone: 'Zone Downtown',
    distanceKm: 5.5,
    assignedAt: new Date(dinnerPeakTime.getTime() - 12 * 60000), // 12 mins ago without pickup
    promisedTime: new Date(dinnerPeakTime.getTime() + 10 * 60000), // Only 10 mins left for 5.5km
    restaurant: { name: 'Slow Grill' },
    rider: { name: 'Mark Rider', riderCode: 'R002', vehicleType: 'BIKE' }
  };

  const highAssessment = service.calculateRisk(highRiskDelivery, { zoneBreachRate: 28.0, restaurantBreachRate: 30.0 }, dinnerPeakTime);
  assert(highAssessment.riskLevel === 'HIGH' || highAssessment.riskLevel === 'CRITICAL', 'High risk delivery classified as HIGH or CRITICAL', `Got ${highAssessment.riskLevel} (${highAssessment.riskScore})`);
  assert(highAssessment.riskScore >= 60, 'Risk score >= 60', `Score: ${highAssessment.riskScore}`);
  assert(highAssessment.recommendations.length > 0, 'Generated actionable recommendations');

  // -------------------------------------------------------------
  // Test 3: Critical SLA Breach Imminent
  // Severe assignment delay (22 mins), Dinner peak, 8.2km on bicycle, negative headroom
  // -------------------------------------------------------------
  console.log('\nTest 3: Evaluating Critical SLA Breach Scenario');
  const criticalTime = new Date('2026-08-21T20:15:00Z');
  const criticalDelivery = {
    id: 'test-del-3',
    orderId: 'ORD-CRIT-003',
    customerZone: 'Zone Congested North',
    distanceKm: 8.2,
    assignedAt: new Date(criticalTime.getTime() - 22 * 60000), // 22 mins ago without pickup
    promisedTime: new Date(criticalTime.getTime() + 3 * 60000), // Promised in 3 mins (impossible for 8.2km)
    restaurant: { name: 'Busy Gourmet' },
    rider: { name: 'Sam Rider', riderCode: 'R003', vehicleType: 'BICYCLE' }
  };

  const critAssessment = service.calculateRisk(criticalDelivery, { zoneBreachRate: 35.0, restaurantBreachRate: 40.0 }, criticalTime);
  assert(critAssessment.riskLevel === 'CRITICAL', 'Critical delivery classified as CRITICAL', `Got ${critAssessment.riskLevel} (${critAssessment.riskScore})`);
  assert(critAssessment.riskScore >= 80, 'Risk score >= 80', `Score: ${critAssessment.riskScore}`);
  assert(critAssessment.slaHeadroomMinutes < 0, 'SLA headroom is negative (projected late)');

  // -------------------------------------------------------------
  // Test 4: Simulation API
  // -------------------------------------------------------------
  console.log('\nTest 4: Evaluating "What-If" Risk Simulation');
  const simResult = await service.simulateRisk({
    distanceKm: 7.2,
    customerZone: 'Zone A',
    orderTimeHour: 20, // Dinner peak
    assignmentDelayMinutes: 14,
    promisedDurationMinutes: 30,
    vehicleType: 'SCOOTER'
  });

  assert(simResult.riskScore >= 50, 'Simulation reflects high risk under stress parameters', `Score: ${simResult.riskScore}`);
  assert(simResult.projectedDeliveryTime !== undefined, 'Simulation generates projected delivery timestamp');
  assert(simResult.factors.every(f => f.score >= 0 && f.score <= f.maxScore), 'All factors bounded within maximum score weights');

  // Summary
  console.log(`\n=============================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`=============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRiskScoringTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
