import fs from 'fs';
import path from 'path';

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

  const data = await response.json();
  
  if (data.accessToken) {
    accessToken = data.accessToken;
    console.log('✅ Login successful\n');
    return true;
  }
  
  console.log('❌ Login failed\n');
  return false;
}

async function testImport(filePath: string, description: string) {
  console.log(`📊 Testing: ${description}`);
  console.log(`   File: ${path.basename(filePath)}`);

  if (!fs.existsSync(filePath)) {
    console.log('   ❌ File not found\n');
    return;
  }

  const formData = new FormData();
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'text/csv' });
  formData.append('file', blob, path.basename(filePath));

  try {
    const response = await fetch(`${API_URL}/api/import/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    const result = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    
    if (result.report) {
      const stats = result.report.stats;
      console.log(`   📈 Stats:`);
      console.log(`      Total rows: ${stats.totalRows}`);
      console.log(`      Imported: ${stats.importedRows}`);
      console.log(`      Skipped: ${stats.skippedRows}`);
      console.log(`      Duplicates: ${stats.duplicateRows}`);
      console.log(`      Corrupted: ${stats.corruptedRows}`);
      console.log(`      Duration: ${stats.duration}ms`);
      
      if (result.report.errors.length > 0) {
        console.log(`   ⚠️  Errors (first 3):`);
        result.report.errors.slice(0, 3).forEach((err: string) => {
          console.log(`      - ${err}`);
        });
      }
    }
    
    console.log('');
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function runTests() {
  console.log('🧪 ETL Pipeline Test Suite\n');
  console.log('='.repeat(60) + '\n');

  const loggedIn = await login();
  if (!loggedIn) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  const testsDir = path.join(process.cwd(), 'tests', 'csv');

  await testImport(
    path.join(testsDir, 'valid_delivery_logs.csv'),
    'Import valid delivery logs'
  );

  await testImport(
    path.join(testsDir, 'invalid_delivery_logs.csv'),
    'Import delivery logs with errors (partial import)'
  );

  await testImport(
    path.join(testsDir, 'valid_complaints.csv'),
    'Import valid complaints'
  );

  console.log('='.repeat(60));
  console.log('✅ Test suite completed');
}

runTests().catch(console.error);
