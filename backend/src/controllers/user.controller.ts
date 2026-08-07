import { RequestHandler } from 'express';
import { AuthRequest, UpdateProfileDTO } from '../types/index.js';
import { UserService } from '../services/user.service.js';

/**
 * Get current user's profile
 */
export const getMyProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

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
};

/**
 * Update current user's profile
 */
export const updateMyProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const body = req.body as Partial<{
      name: string;
      full_name: string;
      avatar: string;
      age: number;
      gender: string;
      height: number;
      weight: number;
      fitnessGoal: string;
      fitness_goal: string;
      activityLevel: string;
      activity_level: string;
    }>;

    const updateData: UpdateProfileDTO = {
      full_name: body.name ?? body.full_name,
      avatar: body.avatar,
      age: body.age,
      gender: body.gender,
      height: body.height,
      weight: body.weight,
      fitness_goal: body.fitnessGoal ?? body.fitness_goal,
      activity_level: body.activityLevel ?? body.activity_level
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
};

/**
 * Change user password
 */
export const changePassword: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

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
};

/**
 * Soft delete user account
 */
export const deleteMyAccount: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

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
};
