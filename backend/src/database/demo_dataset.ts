import { pool } from './connection.js';

export interface DemoDatasetSummary {
  insertedRestaurants: number;
  insertedRiders: number;
  insertedDeliveries: number;
  insertedComplaints: number;
  insertedRefunds: number;
  activeAlerts: number;
  scenario: string;
  timestamp: string;
}

export async function seedDemoDataset(scenario: string = 'dinner_crisis'): Promise<DemoDatasetSummary> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed/Ensure Standard Admin and Analyst Users
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES 
        ('admin@peakpulse.com', '$2a$10$abcdefghijklmnopqrstuv', 'Admin Lead', 'admin', true),
        ('analyst@peakpulse.com', '$2a$10$abcdefghijklmnopqrstuv', 'Jordan Kim', 'analyst', true)
      ON CONFLICT (email) DO UPDATE SET is_active = true;
    `);

    // 2. Clear previous demo delivery records if needed
    await client.query(`DELETE FROM refunds;`);
    await client.query(`DELETE FROM complaints;`);
    await client.query(`DELETE FROM rider_assignments;`);
    await client.query(`DELETE FROM deliveries;`);
    await client.query(`DELETE FROM riders;`);
    await client.query(`DELETE FROM restaurants;`);
    await client.query(`DELETE FROM customers;`);

    // 3. Seed 8 Diverse Restaurants
    const restaurantsData = [
      ['Taco Fiesta', '104 Uptown Ave', 'Uptown - Zone C', 40.7831, -73.9712, 23, 4.2],
      ['Indian Spice', '220 Curry Lane', 'Uptown - Zone C', 40.7850, -73.9680, 19, 4.4],
      ['Pizza Palace', '12 Broadway', 'Downtown - Zone A', 40.7128, -74.0060, 14, 4.7],
      ['Sushi Express', '45 Wall St', 'Downtown - Zone A', 40.7069, -74.0090, 13, 4.8],
      ['Burger Kingdom', '500 5th Ave', 'Midtown - Zone B', 40.7549, -73.9840, 15, 4.3],
      ['Pasta House', '312 Lexington Ave', 'Midtown - Zone B', 40.7510, -73.9780, 17, 4.6],
      ['Thai Delight', '88 Bridge St', 'East - Zone E', 40.7300, -73.9500, 18, 4.5],
      ['Mexican Grill', '900 Suburb Blvd', 'Suburb - Zone D', 40.7000, -73.9000, 12, 4.5]
    ];

    const restaurantIds: number[] = [];
    for (const r of restaurantsData) {
      const res = await client.query(
        `INSERT INTO restaurants (name, address, zone, latitude, longitude, average_prep_time, rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
        r
      );
      restaurantIds.push(res.rows[0].id);
    }

    // 4. Seed 12 Couriers with Diverse Vehicle Profiles
    const ridersData = [
      ['Rahul Kumar', '+1-555-0101', 'motorcycle', 'Downtown - Zone A', 4.9, 'active', 142],
      ['Priya Sharma', '+1-555-0102', 'motorcycle', 'Uptown - Zone C', 4.9, 'active', 128],
      ['Amit Singh', '+1-555-0103', 'scooter', 'Midtown - Zone B', 4.6, 'active', 115],
      ['Vikram Patel', '+1-555-0104', 'bicycle', 'Uptown - Zone C', 4.1, 'active', 84],
      ['Sneha Reddy', '+1-555-0105', 'car', 'East - Zone E', 4.7, 'active', 98],
      ['Carlos Mendez', '+1-555-0106', 'scooter', 'Downtown - Zone A', 4.8, 'active', 110],
      ['Aisha Khan', '+1-555-0107', 'motorcycle', 'Uptown - Zone C', 4.7, 'active', 95],
      ['David Miller', '+1-555-0108', 'bicycle', 'Midtown - Zone B', 4.2, 'active', 76],
      ['Elena Rossi', '+1-555-0109', 'scooter', 'East - Zone E', 4.5, 'active', 88],
      ['Marcus Brody', '+1-555-0110', 'motorcycle', 'West - Zone F', 4.8, 'active', 104],
      ['Zack Taylor', '+1-555-0111', 'car', 'Suburb - Zone D', 4.6, 'active', 92],
      ['Maya Lin', '+1-555-0112', 'scooter', 'Downtown - Zone A', 4.9, 'active', 120]
    ];

    const riderIds: number[] = [];
    for (const rd of ridersData) {
      const res = await client.query(
        `INSERT INTO riders (name, phone, vehicle_type, zone, rating, status, total_deliveries)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
        rd
      );
      riderIds.push(res.rows[0].id);
    }

    // 5. Seed 20 Customers
    const customerIds: number[] = [];
    for (let c = 1; c <= 20; c++) {
      const res = await client.query(
        `INSERT INTO customers (name, phone, email, address, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
        [
          `Customer ${c}`,
          `+1-555-02${String(c).padStart(2, '0')}`,
          `customer${c}@example.com`,
          `${100 + c * 10} Main St`,
          40.7128 + (c * 0.005),
          -74.0060 + (c * 0.005)
        ]
      );
      customerIds.push(res.rows[0].id);
    }

    // 6. Generate 500+ Realistic Delivery Records across 24h timeline
    let insertedDeliveries = 0;
    let insertedComplaints = 0;
    let insertedRefunds = 0;

    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const zones = [
      { name: 'Downtown - Zone A', mult: 0.082, rests: [2, 3] },
      { name: 'Midtown - Zone B', mult: 0.124, rests: [4, 5] },
      { name: 'Uptown - Zone C', mult: 0.341, rests: [0, 1] },
      { name: 'Suburb - Zone D', mult: 0.063, rests: [7] },
      { name: 'East - Zone E', mult: 0.185, rests: [6] },
      { name: 'West - Zone F', mult: 0.098, rests: [2, 4] }
    ];

    for (let i = 1; i <= 520; i++) {
      const zoneIdx = i % zones.length;
      const zoneObj = zones[zoneIdx];
      const restIndex = zoneObj.rests[i % zoneObj.rests.length];
      const restId = restaurantIds[restIndex];
      const riderId = riderIds[i % riderIds.length];
      const custId = customerIds[i % customerIds.length];

      // Distribute hours across morning (8-9), lunch (12-14), and dinner rush (19-22)
      let hour = (i * 7) % 24;
      if (i % 3 === 0) hour = 19 + (i % 3); // Dinner peak
      if (i % 5 === 0) hour = 12 + (i % 2); // Lunch peak

      const orderTime = new Date(baseDate.getTime() + (hour * 3600000) + ((i * 13) % 60) * 60000);
      const promisedTime = new Date(orderTime.getTime() + 30 * 60000); // 30 min SLA

      // Zone C and Taco Fiesta have elevated breach probability
      const isZoneC = zoneObj.name.includes('Zone C');
      const isTaco = restIndex === 0;
      const isDinner = hour >= 19 && hour <= 22;

      let isBreached = false;
      let durationMinutes = 22 + (i % 8);

      if ((isZoneC || isTaco) && isDinner) {
        isBreached = (i % 10) < 6; // 60% breach rate for dinner Taco Fiesta
        durationMinutes = isBreached ? 38 + (i % 18) : 26;
      } else if (isDinner) {
        isBreached = (i % 10) < 2; // 20% breach rate for dinner elsewhere
        durationMinutes = isBreached ? 34 + (i % 10) : 24;
      } else {
        isBreached = (i % 20) === 0; // 5% baseline
        durationMinutes = isBreached ? 33 : 21;
      }

      const actualDeliveryTime = new Date(orderTime.getTime() + durationMinutes * 60000);
      const delayMinutes = isBreached ? Math.max(1, durationMinutes - 30) : 0;
      const distanceKm = 2.0 + ((i * 3) % 80) / 10;
      const orderValue = 18.5 + (i % 45);

      const delRes = await client.query(
        `INSERT INTO deliveries (
          order_id, customer_id, restaurant_id, rider_id, order_time,
          promised_delivery_time, actual_delivery_time, order_value,
          delivery_distance, status, is_sla_violated, delay_minutes, zone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id;`,
        [
          `ORD-${10000 + i}`,
          custId,
          restId,
          riderId,
          orderTime,
          promisedTime,
          actualDeliveryTime,
          orderValue,
          distanceKm,
          'delivered',
          isBreached,
          delayMinutes,
          zoneObj.name
        ]
      );

      const delId = delRes.rows[0].id;
      insertedDeliveries++;

      // Create Assignment record
      const assignedAt = new Date(orderTime.getTime() + 3 * 60000);
      const pickedAt = new Date(assignedAt.getTime() + (isTaco ? 22 : 14) * 60000);
      await client.query(
        `INSERT INTO rider_assignments (delivery_id, rider_id, assigned_at, picked_up_at, assignment_delay_minutes)
         VALUES ($1, $2, $3, $4, $5);`,
        [delId, riderId, assignedAt, pickedAt, isBreached ? 8 : 2]
      );

      // Create Complaint for severe breaches
      if (isBreached && delayMinutes > 12 && (i % 3 === 0)) {
        await client.query(
          `INSERT INTO complaints (delivery_id, customer_id, complaint_type, complaint_text, severity, status)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [
            delId,
            custId,
            'LATE_DELIVERY',
            `Delivery delayed by ${delayMinutes} minutes beyond 30m SLA window.`,
            delayMinutes > 20 ? 'CRITICAL' : 'HIGH',
            'resolved'
          ]
        );
        insertedComplaints++;

        // Refund for critical complaints
        if (delayMinutes > 18) {
          await client.query(
            `INSERT INTO refunds (delivery_id, customer_id, refund_amount, refund_reason, approved)
             VALUES ($1, $2, $3, $4, $5);`,
            [delId, custId, Math.round(orderValue * 0.5 * 100) / 100, 'SLA Breach Delay Guarantee', true]
          );
          insertedRefunds++;
        }
      }
    }

    await client.query('COMMIT');

    return {
      insertedRestaurants: restaurantsData.length,
      insertedRiders: ridersData.length,
      insertedDeliveries,
      insertedComplaints,
      insertedRefunds,
      activeAlerts: 3,
      scenario,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
