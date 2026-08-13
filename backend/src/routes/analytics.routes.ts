import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getOverview, getSLA, getDeliveries, getComplaints, getRefunds } from '../controllers/analytics.controller.js';
import { dateRangeValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/overview', dateRangeValidation, getOverview);
router.get('/sla', dateRangeValidation, getSLA);
router.get('/deliveries', dateRangeValidation, getDeliveries);
router.get('/complaints', dateRangeValidation, getComplaints);
router.get('/refunds', dateRangeValidation, getRefunds);

export default router;
