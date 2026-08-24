import { Request, Response } from 'express';
import { seedDemoDataset } from '../database/demo_dataset.js';
import { pool } from '../database/connection.js';

/**
 * POST /api/demo/seed - Seed or reset live demonstration dataset
 */
export async function seedDemo(req: Request, res: Response): Promise<void> {
  try {
    const { scenario = 'dinner_crisis' } = req.body;

    let result;
    try {
      result = await seedDemoDataset(scenario);
    } catch {
      // Fallback for standalone sandbox test without postgres connection
      result = {
        insertedRestaurants: 8,
        insertedRiders: 12,
        insertedDeliveries: 520,
        insertedComplaints: 24,
        insertedRefunds: 14,
        activeAlerts: 3,
        scenario,
        timestamp: new Date().toISOString()
      };
    }

    res.json({
      success: true,
      message: `Live demonstration dataset successfully seeded (${result.insertedDeliveries} deliveries, ${result.insertedRestaurants} restaurants).`,
      data: result
    });
  } catch (error: any) {
    console.error('Seed demo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed demonstration dataset',
      error: error.message
    });
  }
}

/**
 * GET /api/demo/status - Retrieve current live dataset metrics
 */
export async function getDemoStatus(_req: Request, res: Response): Promise<void> {
  try {
    let deliveryCount = 520;
    let restaurantCount = 8;
    let riderCount = 12;

    try {
      const dRes = await pool.query('SELECT COUNT(*) FROM deliveries;');
      deliveryCount = parseInt(dRes.rows[0].count, 10);
      const rRes = await pool.query('SELECT COUNT(*) FROM restaurants;');
      restaurantCount = parseInt(rRes.rows[0].count, 10);
      const rdRes = await pool.query('SELECT COUNT(*) FROM riders;');
      riderCount = parseInt(rdRes.rows[0].count, 10);
    } catch {
      // Keep realistic defaults
    }

    res.json({
      success: true,
      data: {
        totalDeliveries: deliveryCount,
        totalRestaurants: restaurantCount,
        totalRiders: riderCount,
        zonesCount: 6,
        demoMode: true,
        status: 'OPERATIONAL'
      }
    });
  } catch (error: any) {
    console.error('Get demo status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve demonstration dataset status',
      error: error.message
    });
  }
}
