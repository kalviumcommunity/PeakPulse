import { Request, Response } from 'express';
import { pool } from '../database/connection.js';

export async function getOverallStats(req: Request, res: Response) {
  const { startDate, endDate } = req.query;

  try {
    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE d.order_time BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        COUNT(d.id) as total_orders,
        COUNT(CASE WHEN d.is_sla_violated = false THEN 1 END) as on_time_deliveries,
        ROUND(AVG(CASE WHEN d.actual_delivery_time IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (d.actual_delivery_time - d.order_time))/60 END), 2) as avg_delivery_time,
        ROUND(AVG(ra.assignment_delay_minutes), 2) as avg_assignment_time,
        COUNT(CASE WHEN d.is_sla_violated = true THEN 1 END) * 100.0 / NULLIF(COUNT(d.id), 0) as sla_violation_rate,
        COUNT(DISTINCT co.id) * 100.0 / NULLIF(COUNT(d.id), 0) as complaint_rate,
        COUNT(DISTINCT rf.id) * 100.0 / NULLIF(COUNT(d.id), 0) as refund_rate
      FROM deliveries d
      LEFT JOIN rider_assignments ra ON d.id = ra.delivery_id
      LEFT JOIN complaints co ON d.id = co.delivery_id
      LEFT JOIN refunds rf ON d.id = rf.delivery_id
      ${dateFilter}
    `;

    const result = await pool.query(query, params);

    res.json({
      stats: {
        totalOrders: parseInt(result.rows[0].total_orders),
        onTimeDeliveries: parseInt(result.rows[0].on_time_deliveries),
        slaViolationRate: parseFloat(result.rows[0].sla_violation_rate || '0').toFixed(2),
        averageDeliveryTime: parseFloat(result.rows[0].avg_delivery_time || '0'),
        averageAssignmentTime: parseFloat(result.rows[0].avg_assignment_time || '0'),
        complaintRate: parseFloat(result.rows[0].complaint_rate || '0').toFixed(2),
        refundRate: parseFloat(result.rows[0].refund_rate || '0').toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
}

export async function getSLAViolations(req: Request, res: Response) {
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
        d.zone,
        COUNT(*) as total_violations,
        ROUND(AVG(d.delay_minutes), 2) as avg_delay_minutes,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM deliveries WHERE is_sla_violated = true ${dateFilter}) as percentage
      FROM deliveries d
      WHERE d.is_sla_violated = true ${dateFilter}
      GROUP BY d.zone
      ORDER BY total_violations DESC
    `;

    const result = await pool.query(query, params);

    res.json({ violations: result.rows });
  } catch (error) {
    console.error('Get SLA violations error:', error);
    res.status(500).json({ message: 'Failed to fetch SLA violations' });
  }
}

export async function getPeakHourAnalysis(req: Request, res: Response) {
  const { startDate, endDate } = req.query;

  try {
    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE order_time BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        EXTRACT(HOUR FROM order_time) as hour,
        COUNT(*) as total_orders,
        COUNT(CASE WHEN is_sla_violated = true THEN 1 END) as violations,
        ROUND(AVG(CASE WHEN actual_delivery_time IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (actual_delivery_time - order_time))/60 END), 2) as avg_delivery_time
      FROM deliveries
      ${dateFilter}
      GROUP BY hour
      ORDER BY hour
    `;

    const result = await pool.query(query, params);

    res.json({ peakHours: result.rows });
  } catch (error) {
    console.error('Get peak hours error:', error);
    res.status(500).json({ message: 'Failed to fetch peak hour analysis' });
  }
}

export async function getComplaintAnalysis(req: Request, res: Response) {
  const { startDate, endDate } = req.query;

  try {
    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE c.filed_at BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        c.complaint_type,
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints ${dateFilter}) as percentage
      FROM complaints c
      ${dateFilter}
      GROUP BY c.complaint_type
      ORDER BY count DESC
    `;

    const result = await pool.query(query, params);

    res.json({ complaints: result.rows });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Failed to fetch complaint analysis' });
  }
}

export async function getRefundAnalysis(req: Request, res: Response) {
  const { startDate, endDate } = req.query;

  try {
    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE r.processed_at BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        r.refund_reason,
        COUNT(*) as count,
        ROUND(SUM(r.refund_amount), 2) as total_amount,
        ROUND(AVG(r.refund_amount), 2) as avg_amount
      FROM refunds r
      ${dateFilter}
      GROUP BY r.refund_reason
      ORDER BY total_amount DESC
    `;

    const result = await pool.query(query, params);

    res.json({ refunds: result.rows });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({ message: 'Failed to fetch refund analysis' });
  }
}
