import { Request, Response } from 'express';
import { RiskScoringService } from '../services/risk-scoring.service.js';
import { RiskLevel } from '../types/risk.types.js';

const riskService = new RiskScoringService();

export async function getActiveDeliveriesRisk(req: Request, res: Response): Promise<void> {
  try {
    const { riskLevel, zone, restaurantId, page = '1', limit = '50' } = req.query;

    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const result = await riskService.getActiveDeliveriesRisk({
      riskLevel: riskLevel as RiskLevel | undefined,
      zone: zone as string | undefined,
      restaurantId: restaurantId as string | undefined,
      limit: parsedLimit,
      offset
    });

    res.json({
      success: true,
      data: result.deliveries,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / parsedLimit)
      }
    });
  } catch (error: any) {
    console.error('Get active deliveries risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate active deliveries risk',
      error: error.message
    });
  }
}

export async function getDeliveryRiskById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Delivery or Order ID is required'
      });
      return;
    }

    const assessment = await riskService.getDeliveryRiskById(id);

    if (!assessment) {
      res.status(404).json({
        success: false,
        message: `Delivery '${id}' not found`
      });
      return;
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error: any) {
    console.error('Get delivery risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate delivery risk',
      error: error.message
    });
  }
}

export async function getRiskSummary(_req: Request, res: Response): Promise<void> {
  try {
    const summary = await riskService.getRiskSummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    console.error('Get risk summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate risk summary',
      error: error.message
    });
  }
}

export async function evaluateRisk(req: Request, res: Response): Promise<void> {
  try {
    const {
      distanceKm,
      customerZone,
      vehicleType,
      orderTimeHour,
      assignmentDelayMinutes,
      promisedDurationMinutes,
      restaurantName
    } = req.body;

    if (distanceKm === undefined || isNaN(Number(distanceKm))) {
      res.status(400).json({
        success: false,
        message: 'Valid distanceKm is required'
      });
      return;
    }

    const assessment = await riskService.simulateRisk({
      distanceKm: parseFloat(distanceKm),
      customerZone,
      vehicleType,
      orderTimeHour: orderTimeHour !== undefined ? parseInt(orderTimeHour, 10) : undefined,
      assignmentDelayMinutes: assignmentDelayMinutes !== undefined ? parseInt(assignmentDelayMinutes, 10) : undefined,
      promisedDurationMinutes: promisedDurationMinutes !== undefined ? parseInt(promisedDurationMinutes, 10) : undefined,
      restaurantName
    });

    res.json({
      success: true,
      data: assessment
    });
  } catch (error: any) {
    console.error('Evaluate risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate simulation risk',
      error: error.message
    });
  }
}
