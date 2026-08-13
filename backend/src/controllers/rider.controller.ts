import { RequestHandler } from 'express';
import { pool } from '../database/connection.js';

export const getRiders: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, vehicle_type, zone, rating, status, total_deliveries
       FROM riders
       ORDER BY name`
    );

    res.json({ riders: result.rows });
  } catch (error) {
    console.error('Get riders error:', error);
    res.status(500).json({ message: 'Failed to fetch riders' });
  }
};

export const getRiderPerformance: RequestHandler = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = 'AND d.order_time BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        r.id as rider_id,
        r.name as rider_name,
        COUNT(d.id) as total_deliveries,
        COUNT(CASE WHEN d.is_sla_violated = false THEN 1 END) as on_time_deliveries,
        COUNT(CASE WHEN d.is_sla_violated = true THEN 1 END) as late_deliveries,
        ROUND(AVG(CASE WHEN d.actual_delivery_time IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (d.actual_delivery_time - d.order_time))/60 END), 2) as avg_delivery_time,
        r.rating
      FROM riders r
      LEFT JOIN deliveries d ON r.id = d.rider_id ${dateFilter}
      WHERE d.id IS NOT NULL
      GROUP BY r.id, r.name, r.rating
      ORDER BY total_deliveries DESC
    `;

    const result = await pool.query(query, params);

    res.json({ performance: result.rows });
  } catch (error) {
    console.error('Get rider performance error:', error);
    res.status(500).json({ message: 'Failed to fetch rider performance' });
  }
};

export const getTopRiders: RequestHandler = async (req, res) => {
  const { startDate, endDate, limit = 10 } = req.query;

  try {
    let dateFilter = '';
    const params: any[] = [limit];

    if (startDate && endDate) {
      dateFilter = 'AND d.order_time BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        r.id,
        r.name,
        r.zone,
        COUNT(d.id) as total_deliveries,
        COUNT(CASE WHEN d.is_sla_violated = false THEN 1 END) as on_time_deliveries,
        ROUND(COUNT(CASE WHEN d.is_sla_violated = false THEN 1 END) * 100.0 / NULLIF(COUNT(d.id), 0), 2) as on_time_rate,
        r.rating
      FROM riders r
      LEFT JOIN deliveries d ON r.id = d.rider_id ${dateFilter}
      WHERE d.id IS NOT NULL
      GROUP BY r.id, r.name, r.zone, r.rating
      ORDER BY on_time_rate DESC, total_deliveries DESC
      LIMIT $1
    `;

    const result = await pool.query(query, params);

    res.json({ topRiders: result.rows });
  } catch (error) {
    console.error('Get top riders error:', error);
    res.status(500).json({ message: 'Failed to fetch top riders' });
  }
};
