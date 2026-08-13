import { Request, Response } from 'express';
import { PeakHoursService } from '../services/peak-hours.service.js';

const peakHoursService = new PeakHoursService();

export async function getHourlyAnalytics(req: Request, res: Response) {
  try {
    const { startDate, endDate, zone, restaurantId, riderId } = req.query;

    const filter = {
      startDate: startDate as string,
      endDate: endDate as string,
      zone: zone as string,
      restaurantId: restaurantId as string,
      riderId: riderId as string
    };

    const analytics = await peakHoursService.getHourlyAnalytics(filter);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Get hourly analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hourly analytics'
    });
  }
}

export async function getPeakComparison(req: Request, res: Response) {
  try {
    const { startDate, endDate, zone, restaurantId, riderId } = req.query;

    const filter = {
      startDate: startDate as string,
      endDate: endDate as string,
      zone: zone as string,
      restaurantId: restaurantId as string,
      riderId: riderId as string
    };

    const comparison = await peakHoursService.getPeakComparison(filter);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error: any) {
    console.error('Get peak comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch peak comparison'
    });
  }
}

export async function getRiskPatterns(req: Request, res: Response) {
  try {
    const { startDate, endDate, zone, restaurantId, riderId } = req.query;

    const filter = {
      startDate: startDate as string,
      endDate: endDate as string,
      zone: zone as string,
      restaurantId: restaurantId as string,
      riderId: riderId as string
    };

    const patterns = await peakHoursService.getRiskPatterns(filter);

    res.json({
      success: true,
      data: patterns
    });
  } catch (error: any) {
    console.error('Get risk patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk patterns'
    });
  }
}
