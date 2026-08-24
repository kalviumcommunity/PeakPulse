import express from 'express';
import { seedDemo, getDemoStatus } from '../controllers/demo.controller.js';

const router = express.Router();

// POST /api/demo/seed - Seed live dataset
router.post('/seed', seedDemo);

// GET /api/demo/status - Get status
router.get('/status', getDemoStatus);

export default router;
