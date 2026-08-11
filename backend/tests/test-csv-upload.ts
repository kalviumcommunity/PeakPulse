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

async function testUpload(filePath: string, description: string) {
  console.log(`📤 Testing: ${description}`);
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
    const response = await fetch(`${API_URL}/api/import/upload`, {
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
    
    if (result.validation) {
      console.log(`   Rows: ${result.validation.rowCount}`);
      console.log(`   Errors: ${result.validation.errors.length}`);
      console.log(`   Warnings: ${result.validation.warnings.length}`);
      
      if (result.validation.errors.length > 0) {
        console.log('   First 3 errors:');
        result.validation.errors.slice(0, 3).forEach((err: string) => {
          console.log(`     - ${err}`);
        });
      }
    }
    
    console.log('');
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function getUploadInfo() {
  console.log('📋 Getting upload info...');
  
  try {
    const response = await fetch(`${API_URL}/api/import/info`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const info = await response.json();
    console.log('   Max file size:', info.maxFileSize);
    console.log('   Required files:', info.requiredFiles.length);
    console.log('   ✅ Info retrieved\n');
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function runTests() {
  console.log('🧪 CSV Upload Test Suite\n');
  console.log('='.repeat(50) + '\n');

  const loggedIn = await login();
  if (!loggedIn) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  await getUploadInfo();

  const testsDir = path.join(process.cwd(), 'tests', 'csv');

  await testUpload(
    path.join(testsDir, 'valid_delivery_logs.csv'),
    'Valid delivery logs'
  );

  await testUpload(
    path.join(testsDir, 'invalid_delivery_logs.csv'),
    'Invalid delivery logs (should fail)'
  );

  await testUpload(
    path.join(testsDir, 'missing_headers.csv'),
    'Missing headers (should fail)'
  );

  await testUpload(
    path.join(testsDir, 'valid_complaints.csv'),
    'Valid complaints'
  );

  await testUpload(
    path.join(testsDir, 'empty.csv'),
    'Empty CSV (should warn)'
  );

  console.log('='.repeat(50));
  console.log('✅ Test suite completed');
}

runTests().catch(console.error);
