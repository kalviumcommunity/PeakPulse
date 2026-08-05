import { pool } from '../database/connection.js';
import { User, UserProfileDTO, UpdateProfileDTO } from '../types/index.js';
import { comparePassword, hashPassword } from '../utils/password.js';

export class UserService {
  /**
   * Get user profile by ID (excludes password hash)
   */
  static async getUserProfile(userId: number): Promise<UserProfileDTO | null> {
    const result = await pool.query(
      `SELECT id, email, full_name, role, avatar, age, gender, height, weight, 
              fitness_goal, activity_level, created_at, updated_at, last_login
       FROM users 
       WHERE id = $1 AND is_active = true AND deleted_at IS NULL`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: number,
    data: UpdateProfileDTO
  ): Promise<UserProfileDTO | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic UPDATE query based on provided fields
    if (data.full_name !== undefined) {
      fields.push(`full_name = $${paramIndex}`);
      values.push(data.full_name);
      paramIndex++;
    }

    if (data.avatar !== undefined) {
      fields.push(`avatar = $${paramIndex}`);
      values.push(data.avatar);
      paramIndex++;
    }

    if (data.age !== undefined) {
      fields.push(`age = $${paramIndex}`);
      values.push(data.age);
      paramIndex++;
    }

    if (data.gender !== undefined) {
      fields.push(`gender = $${paramIndex}`);
      values.push(data.gender);
      paramIndex++;
    }

    if (data.height !== undefined) {
      fields.push(`height = $${paramIndex}`);
      values.push(data.height);
      paramIndex++;
    }

    if (data.weight !== undefined) {
      fields.push(`weight = $${paramIndex}`);
      values.push(data.weight);
      paramIndex++;
    }

    if (data.fitness_goal !== undefined) {
      fields.push(`fitness_goal = $${paramIndex}`);
      values.push(data.fitness_goal);
      paramIndex++;
    }

    if (data.activity_level !== undefined) {
      fields.push(`activity_level = $${paramIndex}`);
      values.push(data.activity_level);
      paramIndex++;
    }

    // If no fields to update, return current profile
    if (fields.length === 0) {
      return this.getUserProfile(userId);
    }

    // Add userId to values
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND is_active = true AND deleted_at IS NULL
      RETURNING id, email, full_name, role, avatar, age, gender, height, weight,
                fitness_goal, activity_level, created_at, updated_at, last_login
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    // Get user with password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1 AND is_active = true AND deleted_at IS NULL',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const user = userResult.rows[0];

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    return { success: true, message: 'Password changed successfully' };
  }

  /**
   * Soft delete user account
   */
  static async softDeleteUser(userId: number): Promise<boolean> {
    const result = await pool.query(
      `UPDATE users 
       SET deleted_at = CURRENT_TIMESTAMP, is_active = false 
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [userId]
    );

    return result.rows.length > 0;
  }

  /**
   * Check if email exists (excluding current user)
   */
  static async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    let query = 'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL';
    const values: any[] = [email];

    if (excludeUserId) {
      query += ' AND id != $2';
      values.push(excludeUserId);
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }
}
