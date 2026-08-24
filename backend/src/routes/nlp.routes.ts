import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  handleNLPQuery,
  getSuggestions,
  getSchemaCatalog
} from '../controllers/nlp.controller.js';

const router = express.Router();

// Protected with JWT Authentication
router.use(authenticateToken);

// POST /api/nlp/query - Execute natural language query
router.post('/query', handleNLPQuery);

// GET /api/nlp/suggestions - Get categorized prompt library
router.get('/suggestions', getSuggestions);

// GET /api/nlp/schema - Get data schema catalog
router.get('/schema', getSchemaCatalog);

export default router;
