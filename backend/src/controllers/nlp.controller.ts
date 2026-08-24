import { Request, Response } from 'express';
import { NLPAnalyticsService } from '../services/nlp-analytics.service.js';

const nlpService = new NLPAnalyticsService();

/**
 * POST /api/nlp/query - Main natural language conversational analytics query handler
 */
export async function handleNLPQuery(req: Request, res: Response): Promise<void> {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Valid natural language query string is required'
      });
      return;
    }

    const result = await nlpService.executeNLPQuery(query.trim());

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('NLP query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process natural language analytics query',
      error: error.message
    });
  }
}

/**
 * GET /api/nlp/suggestions - Pre-packaged starter prompts categorized for operations managers
 */
export async function getSuggestions(_req: Request, res: Response): Promise<void> {
  try {
    const suggestions = nlpService.getStarterSuggestions();

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    console.error('Get NLP suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve prompt suggestions',
      error: error.message
    });
  }
}

/**
 * GET /api/nlp/schema - Data catalog and metric glossary
 */
export async function getSchemaCatalog(_req: Request, res: Response): Promise<void> {
  try {
    const schema = nlpService.getSchemaCatalog();

    res.json({
      success: true,
      data: schema
    });
  } catch (error: any) {
    console.error('Get NLP schema error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve NLP data schema catalog',
      error: error.message
    });
  }
}
