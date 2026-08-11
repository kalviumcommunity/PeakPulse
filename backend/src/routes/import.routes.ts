import express from 'express';
import { uploadCSV as uploadMiddleware } from '../middleware/upload.middleware.js';
import { uploadCSV, getUploadInfo } from '../controllers/import.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protect routes with authentication
router.use(authenticateToken);

// Get upload information and requirements
router.get('/info', getUploadInfo);

// Upload CSV file
router.post('/upload', uploadMiddleware.single('file'), uploadCSV);

export default router;
