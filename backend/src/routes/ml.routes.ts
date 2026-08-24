import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  predictBreach,
  batchPredict,
  trainModel,
  getMetrics,
  getROCCurve,
  getFeatureImportance,
  getModelsComparison,
  getModelInfo
} from '../controllers/ml.controller.js';

const router = express.Router();

// Protected with JWT Authentication
router.use(authenticateToken);

// POST /api/ml/predict - Single delivery SLA breach probability prediction
router.post('/predict', predictBreach);

// POST /api/ml/batch-predict - Batch delivery prediction
router.post('/batch-predict', batchPredict);

// POST /api/ml/train - Retrain classification model with hyperparameter configuration
router.post('/train', trainModel);

// GET /api/ml/metrics - Model evaluation metrics (Precision, Recall, F1, ROC-AUC, Confusion Matrix)
router.get('/metrics', getMetrics);

// GET /api/ml/roc-curve - ROC-AUC & Precision-Recall curves
router.get('/roc-curve', getROCCurve);

// GET /api/ml/feature-importance - Ranked feature importance list
router.get('/feature-importance', getFeatureImportance);

// GET /api/ml/models - Multi-model comparison benchmark
router.get('/models', getModelsComparison);

// GET /api/ml/model-info - Active model info and metadata
router.get('/model-info', getModelInfo);

export default router;
