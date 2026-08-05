import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getMyProfile, 
  updateMyProfile, 
  changePassword,
  deleteMyAccount 
} from '../controllers/user.controller.js';
import { 
  updateProfileValidation, 
  changePasswordValidation 
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/me - Get current user's profile
router.get('/me', getMyProfile);

// PUT /api/users/me - Update current user's profile
router.put('/me', updateProfileValidation, updateMyProfile);

// PUT /api/users/change-password - Change password
router.put('/change-password', changePasswordValidation, changePassword);

// DELETE /api/users/me - Soft delete account
router.delete('/me', deleteMyAccount);

export default router;
