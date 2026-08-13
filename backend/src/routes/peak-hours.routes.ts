import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getHourlyAnalytics, getPeakComparison, getRiskPatterns } from '../controllers/peak-hours.controller.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/peak-hours', getHourlyAnalytics);
router.get('/peak-hours/comparison', getPeakComparison);
router.get('/risk-patterns', getRiskPatterns);

export default router;
