import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAlerts,
  getActiveAlerts,
  getAlertSummary,
  getAlertById,
  evaluateAlerts,
  acknowledgeAlert,
  resolveAlert,
  dismissAlert,
  getAlertRules,
  updateAlertRule,
  simulateAlert
} from '../controllers/alert.controller.js';

const router = express.Router();

// Protected with JWT Authentication
router.use(authenticateToken);

// GET /api/alerts - List all alerts with filters
router.get('/', getAlerts);

// GET /api/alerts/active - Active / firing alerts
router.get('/active', getActiveAlerts);

// GET /api/alerts/summary - KPI summary (MTTA, MTTR, critical alarms)
router.get('/summary', getAlertSummary);

// GET /api/alerts/rules - Configurable alert rules and thresholds
router.get('/rules', getAlertRules);

// PUT /api/alerts/rules/:id - Update rule thresholds or status
router.put('/rules/:id', updateAlertRule);

// POST /api/alerts/evaluate - Trigger on-demand rule evaluation
router.post('/evaluate', evaluateAlerts);

// POST /api/alerts/simulate - Inject simulated drill alert
router.post('/simulate', simulateAlert);

// GET /api/alerts/:id - Single alert detail
router.get('/:id', getAlertById);

// PATCH /api/alerts/:id/acknowledge - Acknowledge alert
router.patch('/:id/acknowledge', acknowledgeAlert);

// PATCH /api/alerts/:id/resolve - Resolve alert with RCA notes
router.patch('/:id/resolve', resolveAlert);

// PATCH /api/alerts/:id/dismiss - Dismiss alert
router.patch('/:id/dismiss', dismissAlert);

export default router;
