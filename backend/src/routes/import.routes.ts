import express from 'express';
import { uploadCSV as uploadMiddleware } from '../middleware/upload.middleware.js';
import { uploadCSV, getUploadInfo } from '../controllers/import.controller.js';
import { importCSV, getImportHistory } from '../controllers/etl.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protect routes with authentication
router.use(authenticateToken);

// Get upload information and requirements
router.get('/info', getUploadInfo);

// Upload and validate CSV (no database insert)
router.post('/upload', uploadMiddleware.single('file'), uploadCSV);

// Import CSV with ETL pipeline (validation + database insert)
router.post('/import', uploadMiddleware.single('file'), importCSV);

// Get import history
router.get('/history', getImportHistory);

export default router;
