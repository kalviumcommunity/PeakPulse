import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getActiveDeliveriesRisk,
  getDeliveryRiskById,
  getRiskSummary,
  evaluateRisk
} from '../controllers/risk.controller.js';

const router = express.Router();

// Authenticate all risk endpoints
router.use(authenticateToken);

// GET /api/risk/active - List of active deliveries with computed risk scores
router.get('/active', getActiveDeliveriesRisk);

// GET /api/risk/summary - Aggregate risk status across active fleet
router.get('/summary', getRiskSummary);

// GET /api/risk/delivery/:id - Single delivery risk breakdown
router.get('/delivery/:id', getDeliveryRiskById);

// POST /api/risk/evaluate - What-if simulation risk scoring
router.post('/evaluate', evaluateRisk);

export default router;
