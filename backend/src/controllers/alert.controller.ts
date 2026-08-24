import { Request, Response } from 'express';
import { AlertsService } from '../services/alerts.service.js';
import { AlertSeverity, AlertStatus, AlertCategory } from '../types/alert.types.js';

const alertsService = new AlertsService();

/**
 * GET /api/alerts - List all alerts with optional filtering and pagination
 */
export async function getAlerts(req: Request, res: Response): Promise<void> {
  try {
    const { status, severity, category, zone, restaurantId, page = '1', limit = '50' } = req.query;

    const result = alertsService.getAlerts({
      status: status as AlertStatus | undefined,
      severity: severity as AlertSeverity | undefined,
      category: category as AlertCategory | undefined,
      zone: zone as string | undefined,
      restaurantId: restaurantId as string | undefined,
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 50
    });

    res.json({
      success: true,
      data: result.alerts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve operational alerts',
      error: error.message
    });
  }
}

/**
 * GET /api/alerts/active - Retrieve currently firing / unacknowledged / acknowledged active alerts
 */
export async function getActiveAlerts(_req: Request, res: Response): Promise<void> {
  try {
    const active = alertsService.getActiveAlerts();

    res.json({
      success: true,
      data: active
    });
  } catch (error: any) {
    console.error('Get active alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active alerts',
      error: error.message
    });
  }
}

/**
 * GET /api/alerts/summary - Retrieve KPI summary (MTTA, MTTR, critical alarms, category breakdown)
 */
export async function getAlertSummary(_req: Request, res: Response): Promise<void> {
  try {
    const summary = alertsService.getSummaryKPI();

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    console.error('Get alert summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate alert summary metrics',
      error: error.message
    });
  }
}

/**
 * GET /api/alerts/:id - Retrieve single alert by ID
 */
export async function getAlertById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const alert = alertsService.getAlertById(id);

    if (!alert) {
      res.status(404).json({
        success: false,
        message: `Alert '${id}' not found`
      });
      return;
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error: any) {
    console.error('Get alert by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alert details',
      error: error.message
    });
  }
}

/**
 * POST /api/alerts/evaluate - Trigger on-demand evaluation of operational rules across live telemetry
 */
export async function evaluateAlerts(_req: Request, res: Response): Promise<void> {
  try {
    const evaluation = alertsService.evaluateOperationalRules();

    res.json({
      success: true,
      message: 'Operational rules evaluation completed',
      data: evaluation
    });
  } catch (error: any) {
    console.error('Evaluate alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute operational rules evaluation',
      error: error.message
    });
  }
}

/**
 * PATCH /api/alerts/:id/acknowledge - Analyst acknowledgment of alert
 */
export async function acknowledgeAlert(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { acknowledgedBy = 'Analyst' } = req.body;

    const alert = alertsService.acknowledgeAlert(id, { acknowledgedBy });

    if (!alert) {
      res.status(404).json({
        success: false,
        message: `Alert '${id}' not found`
      });
      return;
    }

    res.json({
      success: true,
      message: `Alert '${id}' successfully acknowledged`,
      data: alert
    });
  } catch (error: any) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
      error: error.message
    });
  }
}

/**
 * PATCH /api/alerts/:id/resolve - Analyst resolution of alert with RCA notes
 */
export async function resolveAlert(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { resolvedBy = 'Analyst', resolutionNotes, rootCause = 'OTHER' } = req.body;

    if (!resolutionNotes || resolutionNotes.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'resolutionNotes string is required to resolve an alert'
      });
      return;
    }

    const alert = alertsService.resolveAlert(id, {
      resolvedBy,
      resolutionNotes,
      rootCause
    });

    if (!alert) {
      res.status(404).json({
        success: false,
        message: `Alert '${id}' not found`
      });
      return;
    }

    res.json({
      success: true,
      message: `Alert '${id}' successfully resolved`,
      data: alert
    });
  } catch (error: any) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: error.message
    });
  }
}

/**
 * PATCH /api/alerts/:id/dismiss - Dismiss alert as false alarm
 */
export async function dismissAlert(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const alert = alertsService.dismissAlert(id, reason);

    if (!alert) {
      res.status(404).json({
        success: false,
        message: `Alert '${id}' not found`
      });
      return;
    }

    res.json({
      success: true,
      message: `Alert '${id}' dismissed`,
      data: alert
    });
  } catch (error: any) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss alert',
      error: error.message
    });
  }
}

/**
 * GET /api/alerts/rules - List configurable operational alert rules
 */
export async function getAlertRules(_req: Request, res: Response): Promise<void> {
  try {
    const rules = alertsService.getRules();

    res.json({
      success: true,
      data: rules
    });
  } catch (error: any) {
    console.error('Get alert rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alert rules',
      error: error.message
    });
  }
}

/**
 * PUT /api/alerts/rules/:id - Update rule thresholds or enable/disable
 */
export async function updateAlertRule(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rule = alertsService.updateRule(id, updates);

    if (!rule) {
      res.status(404).json({
        success: false,
        message: `Alert rule '${id}' not found`
      });
      return;
    }

    res.json({
      success: true,
      message: `Alert rule '${id}' updated successfully`,
      data: rule
    });
  } catch (error: any) {
    console.error('Update alert rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert rule',
      error: error.message
    });
  }
}

/**
 * POST /api/alerts/simulate - Inject test alert for operational drills
 */
export async function simulateAlert(req: Request, res: Response): Promise<void> {
  try {
    const dto = req.body;

    if (!dto.category) {
      res.status(400).json({
        success: false,
        message: 'Valid alert category is required'
      });
      return;
    }

    const alert = alertsService.simulateAlert(dto);

    res.json({
      success: true,
      message: 'Simulated operational drill alert generated successfully',
      data: alert
    });
  } catch (error: any) {
    console.error('Simulate alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate operational alert',
      error: error.message
    });
  }
}
