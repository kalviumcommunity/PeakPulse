import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getInsights } from '../controllers/insights.controller.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/insights', getInsights);

export default router;
