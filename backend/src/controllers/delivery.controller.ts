import { Request, Response } from 'express';
import { pool } from '../database/connection.js';

export async function getDeliveries(req: Request, res: Response) {
  const { startDate, endDate, status, zone, page = 1, limit = 50 } = req.query;

  try {
    let query = `
      SELECT d.*, r.name as restaurant_name, rd.name as rider_name, c.name as customer_name
      FROM deliveries d
      LEFT JOIN restaurants r ON d.restaurant_id = r.id
      LEFT JOIN riders rd ON d.rider_id = rd.id
      LEFT JOIN customers c ON d.customer_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND d.order_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND d.order_time <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (status) {
      query += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (zone) {
      query += ` AND d.zone = $${paramIndex}`;
      params.push(zone);
      paramIndex++;
    }

    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY d.order_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countQuery = query.split('ORDER BY')[0].replace('SELECT d.*, r.name as restaurant_name, rd.name as rider_name, c.name as customer_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      deliveries: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Failed to fetch deliveries' });
  }
}

export async function getDeliveryById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.*, 
              r.name as restaurant_name, r.address as restaurant_address,
              rd.name as rider_name, rd.phone as rider_phone,
              c.name as customer_name, c.phone as customer_phone,
              ra.assigned_at, ra.accepted_at, ra.reached_restaurant_at, ra.picked_up_at
       FROM deliveries d
       LEFT JOIN restaurants r ON d.restaurant_id = r.id
       LEFT JOIN riders rd ON d.rider_id = rd.id
       LEFT JOIN customers c ON d.customer_id = c.id
       LEFT JOIN rider_assignments ra ON d.id = ra.delivery_id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json({ delivery: result.rows[0] });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ message: 'Failed to fetch delivery' });
  }
}

export async function getDeliveriesByZone(req: Request, res: Response) {
  const { zone } = req.params;
  const { startDate, endDate } = req.query;

  try {
    let query = `
      SELECT d.*, COUNT(*) OVER() as total_count
      FROM deliveries d
      WHERE d.zone = $1
    `;
    const params: any[] = [zone];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND d.order_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND d.order_time <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY d.order_time DESC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      zone,
      deliveries: result.rows,
      total: result.rows.length > 0 ? result.rows[0].total_count : 0
    });
  } catch (error) {
    console.error('Get zone deliveries error:', error);
    res.status(500).json({ message: 'Failed to fetch zone deliveries' });
  }
}
