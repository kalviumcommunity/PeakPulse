import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';

const analyticsService = new AnalyticsService();

export async function getOverview(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const stats = await analyticsService.getOverview({
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics'
    });
  }
}

export async function getSLA(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const stats = await analyticsService.getSLAAnalytics({
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get SLA analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SLA analytics'
    });
  }
}

export async function getDeliveries(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const stats = await analyticsService.getDeliveryAnalytics({
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get delivery analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery analytics'
    });
  }
}

export async function getComplaints(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const stats = await analyticsService.getComplaintAnalytics({
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get complaint analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint analytics'
    });
  }
}

export async function getRefunds(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const stats = await analyticsService.getRefundAnalytics({
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get refund analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund analytics'
    });
  }
}
