import { seedDemoDataset } from './demo_dataset.js';

async function main() {
  console.log('🌱 Seeding Neon cloud PostgreSQL database with PeakPulse demonstration records...\n');
  const tStart = Date.now();
  try {
    const res = await seedDemoDataset('dinner_crisis');
    console.log(`✅ Seeded successfully in ${Date.now() - tStart}ms:`);
    console.log(`   - Deliveries: ${res.insertedDeliveries}`);
    console.log(`   - Restaurants: ${res.insertedRestaurants}`);
    console.log(`   - Couriers/Riders: ${res.insertedRiders}`);
    console.log(`   - Customer Complaints: ${res.insertedComplaints}`);
    console.log(`   - Processed Refunds: ${res.insertedRefunds}`);
    console.log(`   - Active Trigger Alerts: ${res.activeAlerts}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

main();
