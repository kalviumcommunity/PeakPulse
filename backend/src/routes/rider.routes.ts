import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getRiders, getRiderPerformance, getTopRiders } from '../controllers/rider.controller.js';
import { dateRangeValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getRiders);
router.get('/performance', dateRangeValidation, getRiderPerformance);
router.get('/top', dateRangeValidation, getTopRiders);

export default router;
