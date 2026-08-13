import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';
let accessToken = '';

async function login() {
  console.log('🔐 Logging in...');
  
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@peakpulse.com',
      password: 'admin123'
    })
  });

  const data: any = await response.json();
  
  if (data.accessToken) {
    accessToken = data.accessToken;
    console.log('✅ Login successful\n');
    return true;
  }
  
  console.log('❌ Login failed\n');
  return false;
}

async function testEndpoint(endpoint: string, description: string) {
  console.log(`📊 Testing: ${description}`);
  console.log(`   Endpoint: GET ${endpoint}`);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const result: any = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${result.success}`);
    
    if (result.data) {
      console.log(`   Data keys: ${Object.keys(result.data).join(', ')}`);
      
      // Show sample data
      const sampleKeys = Object.keys(result.data).slice(0, 3);
      sampleKeys.forEach(key => {
        const value = result.data[key];
        if (typeof value === 'object' && !Array.isArray(value)) {
          console.log(`   ${key}: [object]`);
        } else if (Array.isArray(value)) {
          console.log(`   ${key}: [${value.length} items]`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      });
    }
    
    console.log('');
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function testWithDateFilter(endpoint: string, description: string) {
  console.log(`📊 Testing: ${description} (with date filter)`);
  console.log(`   Endpoint: GET ${endpoint}`);

  try {
    const startDate = '2024-01-01T00:00:00Z';
    const endDate = '2024-12-31T23:59:59Z';
    const url = `${API_URL}${endpoint}?startDate=${startDate}&endDate=${endDate}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const result: any = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Date range: ${startDate} to ${endDate}`);
    
    if (result.data) {
      console.log(`   Data keys: ${Object.keys(result.data).join(', ')}`);
    }
    
    console.log('');
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function runTests() {
  console.log('🧪 Analytics API Test Suite\n');
  console.log('='.repeat(60) + '\n');

  const loggedIn = await login();
  if (!loggedIn) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Test all endpoints
  await testEndpoint('/api/analytics/overview', 'Overview Statistics');
  await testEndpoint('/api/analytics/sla', 'SLA Analytics');
  await testEndpoint('/api/analytics/deliveries', 'Delivery Analytics');
  await testEndpoint('/api/analytics/complaints', 'Complaint Analytics');
  await testEndpoint('/api/analytics/refunds', 'Refund Analytics');

  console.log('='.repeat(60));
  console.log('\n📅 Testing with Date Filters\n');
  console.log('='.repeat(60) + '\n');

  // Test with date filters
  await testWithDateFilter('/api/analytics/overview', 'Overview');
  await testWithDateFilter('/api/analytics/sla', 'SLA');
  await testWithDateFilter('/api/analytics/deliveries', 'Deliveries');

  console.log('='.repeat(60));
  console.log('✅ Test suite completed');
}

runTests().catch(console.error);
