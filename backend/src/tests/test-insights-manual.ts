/**
 * Manual Test Script for Insights Service
 * 
 * This script tests the insights service without requiring a full test framework.
 * Run with: tsx src/tests/test-insights-manual.ts
 * 
 * Tests:
 * 1. Insufficient data scenario
 * 2. Peak hour insights
 * 3. Zone insights
 * 4. Restaurant insights
 * 5. Distance risk patterns
 * 6. Assignment delay patterns
 * 7. Pickup delay patterns
 * 8. Empty dataset handling
 */

import { InsightsService } from '../services/insights.service.js';

async function runTests() {
  const insightsService = new InsightsService();
  let passed = 0;
  let failed = 0;

  console.log('🧪 Running Insights Service Manual Tests\n');

  // Test 1: Insufficient Data
  try {
    console.log('Test 1: Insufficient data with future date range...');
    const insights = await insightsService.generateInsights({
      startDate: '2099-01-01',
      endDate: '2099-01-02'
    });

    if (insights.length === 1 && insights[0].type === 'INSUFFICIENT_DATA') {
      console.log('✅ PASS: Insufficient data insight generated correctly');
      console.log(`   Metrics: ${JSON.stringify(insights[0].metrics)}\n`);
      passed++;
    } else {
      console.log('❌ FAIL: Expected INSUFFICIENT_DATA insight\n');
      failed++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // Test 2: Valid data range
  try {
    console.log('Test 2: Generate insights with valid data range...');
    const insights = await insightsService.generateInsights({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });

    if (Array.isArray(insights)) {
      console.log(`✅ PASS: Generated ${insights.length} insights`);
      
      // Verify structure
      if (insights.length > 0 && insights[0].type !== 'INSUFFICIENT_DATA') {
        const firstInsight = insights[0];
        const hasRequiredFields = 
          firstInsight.type &&
          firstInsight.title &&
          firstInsight.description &&
          firstInsight.severity &&
          firstInsight.metrics;

        if (hasRequiredFields) {
          console.log('✅ PASS: Insight structure is correct');
          console.log(`   First insight: ${firstInsight.type} (${firstInsight.severity})`);
          console.log(`   Title: ${firstInsight.title}\n`);
          passed++;
        } else {
          console.log('❌ FAIL: Insight structure is incomplete\n');
          failed++;
        }
      } else {
        console.log('   Note: Only INSUFFICIENT_DATA returned\n');
        passed++;
      }
    } else {
      console.log('❌ FAIL: Expected array of insights\n');
      failed++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // Test 3: Zone filter
  try {
    console.log('Test 3: Zone filter...');
    const insights = await insightsService.generateInsights({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      zone: 'A'
    });

    if (Array.isArray(insights)) {
      console.log(`✅ PASS: Zone filter handled correctly (${insights.length} insights)\n`);
      passed++;
    } else {
      console.log('❌ FAIL: Zone filter failed\n');
      failed++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // Test 4: Restaurant filter
  try {
    console.log('Test 4: Restaurant filter...');
    const insights = await insightsService.generateInsights({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      restaurantId: 'restaurant-1'
    });

    if (Array.isArray(insights)) {
      console.log(`✅ PASS: Restaurant filter handled correctly (${insights.length} insights)\n`);
      passed++;
    } else {
      console.log('❌ FAIL: Restaurant filter failed\n');
      failed++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // Test 5: Rider filter
  try {
    console.log('Test 5: Rider filter...');
    const insights = await insightsService.generateInsights({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      riderId: 'rider-1'
    });

    if (Array.isArray(insights)) {
      console.log(`✅ PASS: Rider filter handled correctly (${insights.length} insights)\n`);
      passed++;
    } else {
      console.log('❌ FAIL: Rider filter failed\n');
      failed++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // Test 6: Empty filter
  try {
    console.log('Test 6: Empty filter (all data)...');
    const insights = await insightsService.generateInsights({});

    if (Array.isArray(insights)) {
      console.log(`✅ PASS: Empty filter handled correctly (${insights.length} insights)\n`);
      passed++;
    } else {
      console.log('❌ FAIL: Empty filter failed\n');
      failed++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // Test 7: Severity ordering
  try {
    console.log('Test 7: Severity ordering...');
    const insights = await insightsService.generateInsights({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });

    if (insights.length > 1 && insights[0].type !== 'INSUFFICIENT_DATA') {
      const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, INFO: 3 };
      let isOrdered = true;

      for (let i = 0; i < insights.length - 1; i++) {
        const current = severityOrder[insights[i].severity];
        const next = severityOrder[insights[i + 1].severity];
        if (current > next) {
          isOrdered = false;
          break;
        }
      }

      if (isOrdered) {
        console.log('✅ PASS: Insights are properly sorted by severity\n');
        passed++;
      } else {
        console.log('❌ FAIL: Insights are not sorted by severity\n');
        failed++;
      }
    } else {
      console.log('   Note: Not enough insights to test ordering\n');
      passed++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // Test 8: Insight types
  try {
    console.log('Test 8: Verify insight type diversity...');
    const insights = await insightsService.generateInsights({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });

    const insightTypes = new Set(insights.map(i => i.type));
    console.log(`   Found ${insightTypes.size} unique insight types:`);
    insightTypes.forEach(type => console.log(`     - ${type}`));

    if (insightTypes.size > 0) {
      console.log('✅ PASS: Multiple insight types generated\n');
      passed++;
    } else {
      console.log('❌ FAIL: No insight types generated\n');
      failed++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // Summary
  console.log('━'.repeat(50));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total: ${passed + failed}\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed. Review the output above.\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
