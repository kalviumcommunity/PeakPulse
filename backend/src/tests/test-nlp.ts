import { NLPParserService } from '../services/nlp-parser.service.js';
import { NLPAnalyticsService } from '../services/nlp-analytics.service.js';

console.log('🧪 Starting Phase 7 NLP / Conversational Analytics Unit Tests...\n');

const parser = new NLPParserService();
const nlpAnalytics = new NLPAnalyticsService();

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
  console.log('--- 1. Primary Requirement Prompt Parsing & Execution ---');
  const userPrompt = 'Which restaurants had the most dinner-time SLA breaches in North Zone?';
  const plan = parser.parsePrompt(userPrompt);

  assert(plan.intent === 'RANKING_QUERY', `Intent correctly classified as RANKING_QUERY (${plan.intent})`);
  assert(plan.entities.normalizedZone === 'Uptown - Zone C', `Fuzzy 'North Zone' normalized to 'Uptown - Zone C' (${plan.entities.normalizedZone})`);
  assert(plan.entities.mealWindow === 'DINNER', `Meal window detected as DINNER (${plan.entities.mealWindow})`);
  assert(plan.entities.hourRange?.start === 19 && plan.entities.hourRange?.end === 22, 'Hour range correctly resolved to 19:00-22:00');
  assert(plan.entities.groupBy === 'restaurant', `Group-by entity detected as 'restaurant' (${plan.entities.groupBy})`);
  assert(plan.generatedSQL.includes('d.customer_zone'), 'Generated SQL includes zone filter');
  assert(plan.generatedSQL.includes('GROUP BY'), 'Generated SQL includes GROUP BY');

  const result = await nlpAnalytics.executeNLPQuery(userPrompt);
  assert(result.answer.includes('Taco Fiesta'), 'Executive summary answers with top breached restaurant (Taco Fiesta)');
  assert(result.chartType === 'bar', `Chart type set to 'bar' (${result.chartType})`);
  assert(result.chartData.length >= 3, `Chart dataset generated with ${result.chartData.length} data points`);
  assert(result.keyTakeaways.length >= 2, `Key operational takeaways generated (${result.keyTakeaways.length} items)`);
  assert(result.suggestedFollowUps.length >= 3, `Suggested follow-up questions generated (${result.suggestedFollowUps.length} items)`);

  console.log('\n--- 2. Zone Comparison Query Verification ---');
  const compPrompt = 'Compare breach rates across all zones during peak hours';
  const compPlan = parser.parsePrompt(compPrompt);
  assert(compPlan.intent === 'COMPARISON_QUERY', `Intent classified as COMPARISON_QUERY (${compPlan.intent})`);

  const compResult = await nlpAnalytics.executeNLPQuery(compPrompt);
  assert(compResult.chartData.some(d => d.label.includes('Zone C')), 'Comparison includes Zone C');
  assert(compResult.chartData.some(d => d.label.includes('Zone A')), 'Comparison includes Zone A');

  console.log('\n--- 3. Courier & Rider Performance Ranking Query ---');
  const riderPrompt = 'Show top 5 fastest motorcycle riders in Downtown Zone A';
  const riderPlan = parser.parsePrompt(riderPrompt);
  assert(riderPlan.entities.normalizedZone === 'Downtown - Zone A', 'Zone A recognized');
  assert(riderPlan.entities.vehicleType === 'MOTORCYCLE', 'Vehicle type MOTORCYCLE recognized');

  const riderResult = await nlpAnalytics.executeNLPQuery(riderPrompt);
  assert(riderResult.chartData.some(d => d.label.includes('Rahul Kumar')), 'Top motorcycle rider Rahul Kumar returned');

  console.log('\n--- 4. Root Cause Diagnosis Inquiry ---');
  const rcaPrompt = 'Why did Zone C have so many SLA breaches?';
  const rcaPlan = parser.parsePrompt(rcaPrompt);
  assert(rcaPlan.intent === 'ROOT_CAUSE_DIAGNOSIS', `Intent classified as ROOT_CAUSE_DIAGNOSIS (${rcaPlan.intent})`);

  const rcaResult = await nlpAnalytics.executeNLPQuery(rcaPrompt);
  assert(rcaResult.chartType === 'pie', `RCA breakdown formatted as pie chart (${rcaResult.chartType})`);
  assert(rcaResult.answer.includes('Kitchen'), 'Diagnoses kitchen prep lag as primary bottleneck');

  console.log('\n--- 5. Prompt Suggestions & Schema Catalog ---');
  const suggestions = nlpAnalytics.getStarterSuggestions();
  assert(suggestions.length >= 4, `Retrieved ${suggestions.length} prompt suggestion categories`);
  const allPrompts = suggestions.flatMap(s => s.prompts);
  assert(allPrompts.length >= 10, `Retrieved ${allPrompts.length} pre-packaged operational questions`);

  const schema = nlpAnalytics.getSchemaCatalog();
  assert(schema.entities.includes('restaurants'), 'Schema catalog includes restaurants entity');
  assert(schema.metrics.includes('sla_breaches'), 'Schema catalog includes sla_breaches metric');

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
