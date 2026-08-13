import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/analytics';

async function testPeakHoursAPI() {
  console.log('Testing Peak Hours Analytics API\n');

  try {
    // Test 1: Hourly Analytics
    console.log('1. Testing GET /peak-hours');
    const hourlyResponse = await axios.get(`${BASE_URL}/peak-hours`, {
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✓ Hourly Analytics:', hourlyResponse.data.data.length, 'hours');
    console.log('  Sample hour 19:', JSON.stringify(hourlyResponse.data.data[19], null, 2));

    // Test 2: Peak Comparison
    console.log('\n2. Testing GET /peak-hours/comparison');
    const comparisonResponse = await axios.get(`${BASE_URL}/peak-hours/comparison`, {
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✓ Peak Comparison:', JSON.stringify(comparisonResponse.data.data, null, 2));

    // Test 3: Risk Patterns
    console.log('\n3. Testing GET /risk-patterns');
    const patternsResponse = await axios.get(`${BASE_URL}/risk-patterns`, {
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✓ Risk Patterns:', patternsResponse.data.data.length, 'patterns found');
    console.log('  Top 3 patterns:');
    patternsResponse.data.data.slice(0, 3).forEach((p: any, i: number) => {
      console.log(`  ${i + 1}. ${p.pattern}: ${p.slaBreachRate}% (${p.totalDeliveries} deliveries)`);
    });

    // Test 4: Zone Filter
    console.log('\n4. Testing with zone filter');
    const zoneResponse = await axios.get(`${BASE_URL}/peak-hours`, {
      params: {
        zone: 'Zone A'
      }
    });
    console.log('✓ Zone filtered data received');

    // Test 5: Restaurant Filter
    console.log('\n5. Testing with restaurant filter');
    const restaurantResponse = await axios.get(`${BASE_URL}/peak-hours/comparison`, {
      params: {
        restaurantId: 'some-restaurant-id'
      }
    });
    console.log('✓ Restaurant filtered data received');

    console.log('\n✅ All tests passed!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testPeakHoursAPI();
