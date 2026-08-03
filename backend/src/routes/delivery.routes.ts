import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDeliveries, getDeliveryById, getDeliveriesByZone } from '../controllers/delivery.controller.js';
import { dateRangeValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', dateRangeValidation, getDeliveries);
router.get('/zone/:zone', dateRangeValidation, getDeliveriesByZone);
router.get('/:id', getDeliveryById);

export default router;
