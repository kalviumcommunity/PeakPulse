import { pool } from './connection.js';
import { hashPassword } from '../utils/password.js';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create sample user
    const passwordHash = await hashPassword('admin123');
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      ['admin@peakpulse.com', passwordHash, 'Admin User', 'admin']
    );

    // Create sample restaurants
    const restaurants = [
      ['Pizza Palace', 'Zone A', 4.5],
      ['Burger Kingdom', 'Zone B', 4.2],
      ['Sushi Express', 'Zone A', 4.7],
      ['Taco Fiesta', 'Zone C', 4.3],
      ['Pasta House', 'Zone B', 4.6]
    ];

    for (const [name, zone, rating] of restaurants) {
      await pool.query(
        `INSERT INTO restaurants (name, zone, rating) 
         VALUES ($1, $2, $3) 
         ON CONFLICT DO NOTHING`,
        [name, zone, rating]
      );
    }

    // Create sample riders
    const riders = [
      ['Rahul Kumar', 'Zone A', 'bike', 4.8],
      ['Amit Singh', 'Zone B', 'scooter', 4.5],
      ['Priya Sharma', 'Zone A', 'bike', 4.9],
      ['Vikram Patel', 'Zone C', 'bike', 4.3],
      ['Sneha Reddy', 'Zone B', 'scooter', 4.7]
    ];

    for (const [name, zone, vehicle, rating] of riders) {
      await pool.query(
        `INSERT INTO riders (name, zone, vehicle_type, rating) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT DO NOTHING`,
        [name, zone, vehicle, rating]
      );
    }

    console.log('✅ Database seeded successfully');
    console.log('📧 Admin user: admin@peakpulse.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
