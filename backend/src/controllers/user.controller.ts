import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { UserService } from '../services/user.service.js';

/**
 * Get current user's profile
 */
export async function getMyProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const profile = await UserService.getUserProfile(userId);

    if (!profile) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile' 
    });
  }
}

/**
 * Update current user's profile
 */
export async function updateMyProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const updateData = {
      full_name: req.body.name || req.body.full_name,
      avatar: req.body.avatar,
      age: req.body.age,
      gender: req.body.gender,
      height: req.body.height,
      weight: req.body.weight,
      fitness_goal: req.body.fitnessGoal || req.body.fitness_goal,
      activity_level: req.body.activityLevel || req.body.activity_level
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const updatedProfile = await UserService.updateUserProfile(userId, updateData);

    if (!updatedProfile) {
      res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error: any) {
    console.error('Update profile error:', error);

    // Handle database constraint violations
    if (error.code === '23514') {
      res.status(400).json({
        success: false,
        message: 'Invalid data provided. Please check field values.'
      });
      return;
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile' 
    });
  }
}

/**
 * Change user password
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const result = await UserService.changePassword(userId, currentPassword, newPassword);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message
      });
      return;
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to change password' 
    });
  }
}

/**
 * Soft delete user account
 */
export async function deleteMyAccount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const deleted = await UserService.softDeleteUser(userId);

    if (!deleted) {
      res.status(404).json({ 
        success: false,
        message: 'User not found or already deleted' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete account' 
    });
  }
}
