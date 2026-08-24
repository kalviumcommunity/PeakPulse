import { execSync } from 'child_process';

console.log('🚀 =========================================================================');
console.log('🚀 PeakPulse Master Test Harness: Running All Unit & Integration Suites');
console.log('🚀 =========================================================================\n');

const testSuites = [
  { name: 'Phase 5: ML SLA Breach Predictor Unit Tests', file: 'src/tests/test-ml-predictor.ts' },
  { name: 'Phase 6: Operational Alerts System Unit Tests', file: 'src/tests/test-alerts.ts' },
  { name: 'Phase 7: NLP / Conversational Analytics Unit Tests', file: 'src/tests/test-nlp.ts' },
  { name: 'Phase 8: End-to-End Integration & API Test Suite', file: 'src/tests/integration-api.test.ts' }
];

let totalPassedSuites = 0;
let totalFailedSuites = 0;
const tAllStart = Date.now();

for (const suite of testSuites) {
  console.log(`\n▶️ Executing: ${suite.name}...`);
  const tStart = Date.now();
  try {
    const output = execSync(`npx tsx ${suite.file}`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(output);
    console.log(`  ⏱️ Suite finished in ${Date.now() - tStart}ms`);
    totalPassedSuites++;
  } catch (err: any) {
    console.error(`❌ Suite Failed: ${suite.name}`);
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    totalFailedSuites++;
  }
}

const totalDuration = Date.now() - tAllStart;
console.log('\n=========================================================================');
console.log(`🏁 MASTER TEST HARNESS SUMMARY: ${totalPassedSuites}/${testSuites.length} Suites Passed (${totalFailedSuites} Failed) in ${totalDuration}ms`);
console.log('=========================================================================\n');

if (totalFailedSuites > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
