import { pool } from '../connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPerformanceIndexing() {
  const tStart = Date.now();
  console.log('⚡ PeakPulse Phase 8: Applying PostgreSQL Performance Indexes...\n');

  try {
    const sqlPath = path.join(__dirname, 'performance_indexes.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Strip comments and split SQL into individual statements
    const cleanSql = sqlContent.replace(/--.*$/gm, '');
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let count = 0;
    for (const stmt of statements) {
      const match = stmt.match(/CREATE INDEX IF NOT EXISTS (\w+)/i);
      const indexName = match ? match[1] : `Index #${count + 1}`;
      const sStart = Date.now();
      
      try {
        await pool.query(stmt);
        console.log(`  ✅ Created/Verified Index: ${indexName} (${Date.now() - sStart}ms)`);
        count++;
      } catch (err: any) {
        console.warn(`  ⚠️ Warning on ${indexName}: ${err.message}`);
      }
    }

    const duration = Date.now() - tStart;
    console.log(`\n🎉 Performance indexing completed successfully: ${count} indexes verified in ${duration}ms.\n`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed to run performance indexing migration:', error);
    process.exit(1);
  }
}

runPerformanceIndexing();
