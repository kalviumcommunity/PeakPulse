import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getOverallStats,
  getSLAViolations,
  getPeakHourAnalysis,
  getComplaintAnalysis,
  getRefundAnalysis
} from '../controllers/analytics.controller.js';
import { dateRangeValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', dateRangeValidation, getOverallStats);
router.get('/sla-violations', dateRangeValidation, getSLAViolations);
router.get('/peak-hours', dateRangeValidation, getPeakHourAnalysis);
router.get('/complaints', dateRangeValidation, getComplaintAnalysis);
router.get('/refunds', dateRangeValidation, getRefundAnalysis);

export default router;
