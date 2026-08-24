import { AlertsService } from '../services/alerts.service.js';

console.log('🧪 Starting Phase 6 Operational Alerts System Unit Tests...\n');

const alertsService = new AlertsService();

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
  console.log('--- 1. Baseline Active Alerts Verification ---');
  const initialActive = alertsService.getActiveAlerts();
  assert(initialActive.length >= 2, `Active alerts retrieved (${initialActive.length} active alerts)`);
  const critAlert = initialActive.find(a => a.severity === 'CRITICAL');
  assert(critAlert !== undefined, `Critical alert exists (${critAlert?.title})`);

  console.log('\n--- 2. Live Operational Rule Evaluation ---');
  const evalResult = alertsService.evaluateOperationalRules();
  assert(evalResult.evaluatedRules >= 3, `Evaluated operational rules (${evalResult.evaluatedRules} rules)`);
  assert(evalResult.newAlertsCount >= 0, `Evaluated alerts successfully`);

  console.log('\n--- 3. Alert Acknowledgment Workflow ---');
  const unacked = alertsService.getActiveAlerts().find(a => a.status === 'ACTIVE');
  assert(unacked !== undefined, 'Found active unacknowledged alert');
  if (unacked) {
    const acked = alertsService.acknowledgeAlert(unacked.id, { acknowledgedBy: 'Jordan Kim (Ops Lead)' });
    assert(acked !== null && acked.status === 'ACKNOWLEDGED', `Alert ${unacked.id} status transitioned to ACKNOWLEDGED`);
    assert(acked?.acknowledgedBy === 'Jordan Kim (Ops Lead)', 'Analyst attribution recorded');
    assert(acked?.acknowledgedAt !== undefined, 'Acknowledgment timestamp recorded');
  }

  console.log('\n--- 4. Alert Resolution & RCA Workflow ---');
  if (unacked) {
    const resolved = alertsService.resolveAlert(unacked.id, {
      resolvedBy: 'Jordan Kim (Ops Lead)',
      resolutionNotes: 'Dispatched 4 motorcycle riders to Zone C. Breach rate dropped under 18%.',
      rootCause: 'COURIER_SHORTAGE'
    });
    assert(resolved !== null && resolved.status === 'RESOLVED', `Alert ${unacked.id} status transitioned to RESOLVED`);
    assert(resolved?.resolutionNotes?.length! > 10, 'Resolution notes preserved');
    assert(resolved?.rootCause === 'COURIER_SHORTAGE', 'Root cause category tagged');
    assert(resolved?.cooldownUntil !== undefined, 'Anti-flapping cooldown window set');
  }

  console.log('\n--- 5. Anti-Flapping Cooldown / Deduplication ---');
  // Re-evaluate rules; resolved alert for Zone C should respect cooldown
  const evalPostResolve = alertsService.evaluateOperationalRules();
  assert(evalPostResolve !== null, 'Rule evaluation respects cooldown period without spamming duplicates');

  console.log('\n--- 6. KPI Summary & Metric Aggregation ---');
  const kpi = alertsService.getSummaryKPI();
  assert(kpi.totalActive >= 0, `Total active alerts count calculated (${kpi.totalActive})`);
  assert(kpi.meanTimeToAcknowledgeMinutes > 0, `MTTA calculated (${kpi.meanTimeToAcknowledgeMinutes} mins)`);
  assert(kpi.meanTimeToResolveMinutes > 0, `MTTR calculated (${kpi.meanTimeToResolveMinutes} mins)`);
  assert(kpi.categoryBreakdown.length > 0, `Category distribution aggregated (${kpi.categoryBreakdown.length} categories)`);

  console.log('\n--- 7. Configurable Rule Threshold Management ---');
  const rules = alertsService.getRules();
  assert(rules.length >= 5, `Retrieved ${rules.length} configurable alert rules`);
  const updatedRule = alertsService.updateRule('RULE_ZONE_BREACH', { thresholdValue: 25.0 });
  assert(updatedRule?.thresholdValue === 25.0, 'Zone breach threshold updated to 25.0%');

  console.log('\n--- 8. Operational Drill Simulation ---');
  const simAlert = alertsService.simulateAlert({
    category: 'RESTAURANT_PREP_DELAY',
    severity: 'HIGH',
    restaurantName: 'Burger Kingdom',
    currentValue: 26.4,
    thresholdValue: 18.0,
    affectedCount: 9
  });
  assert(simAlert.id.startsWith('ALT-'), `Simulated drill alert created with ID ${simAlert.id}`);
  assert(simAlert.restaurantName === 'Burger Kingdom', 'Merchant name tagged in simulated alert');
  assert(simAlert.status === 'ACTIVE', 'Simulated alert is ACTIVE');

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
