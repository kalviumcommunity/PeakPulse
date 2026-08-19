import { Request, Response } from 'express';
import { InsightsService } from '../services/insights.service.js';

const insightsService = new InsightsService();

export async function getInsights(req: Request, res: Response) {
  try {
    const { startDate, endDate, zone, restaurantId, riderId } = req.query;

    const filter = {
      startDate: startDate as string,
      endDate: endDate as string,
      zone: zone as string,
      restaurantId: restaurantId as string,
      riderId: riderId as string
    };

    const insights = await insightsService.generateInsights(filter);

    res.json({
      success: true,
      data: insights,
      count: insights.length
    });
  } catch (error: any) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
}
