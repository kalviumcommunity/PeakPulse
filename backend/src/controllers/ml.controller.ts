import { Request, Response } from 'express';
import { MLPredictorService } from '../services/ml-predictor.service.js';
import { DeliveryFeatures, ModelTrainingConfig } from '../types/ml.types.js';

const mlService = new MLPredictorService();

/**
 * POST /api/ml/predict - Single delivery SLA breach probability prediction
 */
export async function predictBreach(req: Request, res: Response): Promise<void> {
  try {
    const features: DeliveryFeatures = req.body;

    if (features.distanceKm === undefined || isNaN(Number(features.distanceKm))) {
      res.status(400).json({
        success: false,
        message: 'Valid distanceKm (number) is required'
      });
      return;
    }

    const prediction = mlService.predict(features);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error: any) {
    console.error('ML Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate ML SLA breach prediction',
      error: error.message
    });
  }
}

/**
 * POST /api/ml/batch-predict - Batch delivery prediction across multiple orders
 */
export async function batchPredict(req: Request, res: Response): Promise<void> {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'items array is required for batch prediction'
      });
      return;
    }

    const result = mlService.batchPredict(items);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('ML Batch Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run batch ML SLA breach predictions',
      error: error.message
    });
  }
}

/**
 * POST /api/ml/train - Retrain or tune the classification model
 */
export async function trainModel(req: Request, res: Response): Promise<void> {
  try {
    const config: ModelTrainingConfig = req.body || {};

    const metrics = mlService.trainModelInternal(config);

    res.json({
      success: true,
      message: `Model successfully trained using algorithm: ${config.algorithm || 'random_forest'}`,
      data: {
        metrics,
        modelInfo: mlService.getModelInfo()
      }
    });
  } catch (error: any) {
    console.error('ML Training error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to train ML model',
      error: error.message
    });
  }
}

/**
 * GET /api/ml/metrics - Retrieve current active model's evaluation metrics
 */
export async function getMetrics(_req: Request, res: Response): Promise<void> {
  try {
    const metrics = mlService.getMetrics();
    const modelInfo = mlService.getModelInfo();

    res.json({
      success: true,
      data: {
        metrics,
        modelInfo
      }
    });
  } catch (error: any) {
    console.error('Get ML Metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ML evaluation metrics',
      error: error.message
    });
  }
}

/**
 * GET /api/ml/roc-curve - Get ROC curve coordinates (TPR vs FPR) and PR curve
 */
export async function getROCCurve(_req: Request, res: Response): Promise<void> {
  try {
    const data = mlService.getROCCurve();

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Get ROC Curve error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ROC curve data',
      error: error.message
    });
  }
}

/**
 * GET /api/ml/feature-importance - Ranked feature importance & weights
 */
export async function getFeatureImportance(_req: Request, res: Response): Promise<void> {
  try {
    const items = mlService.getFeatureImportance();

    res.json({
      success: true,
      data: items
    });
  } catch (error: any) {
    console.error('Get Feature Importance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feature importance rankings',
      error: error.message
    });
  }
}

/**
 * GET /api/ml/models - Multi-model comparative benchmark
 */
export async function getModelsComparison(_req: Request, res: Response): Promise<void> {
  try {
    const comparison = mlService.getModelComparison();

    res.json({
      success: true,
      data: comparison
    });
  } catch (error: any) {
    console.error('Get Models Comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve model comparison benchmark',
      error: error.message
    });
  }
}

/**
 * GET /api/ml/model-info - General model metadata and active algorithm
 */
export async function getModelInfo(_req: Request, res: Response): Promise<void> {
  try {
    const info = mlService.getModelInfo();

    res.json({
      success: true,
      data: info
    });
  } catch (error: any) {
    console.error('Get Model Info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve model information',
      error: error.message
    });
  }
}
