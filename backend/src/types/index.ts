import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number;
  weight?: number;
  fitness_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'general_fitness';
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
  deleted_at?: Date;
}

export interface UserProfileDTO {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  fitness_goal?: string;
  activity_level?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface UpdateProfileDTO {
  full_name?: string;
  avatar?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  fitness_goal?: string;
  activity_level?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface DeliveryStats {
  totalOrders: number;
  onTimeDeliveries: number;
  slaViolationRate: number;
  averageDeliveryTime: number;
  averageAssignmentTime: number;
  complaintRate: number;
  refundRate: number;
}

export interface RiderPerformance {
  riderId: number;
  riderName: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  averageDeliveryTime: number;
  rating: number;
}

export interface RestaurantPerformance {
  restaurantId: number;
  restaurantName: string;
  totalOrders: number;
  slaViolations: number;
  violationRate: number;
  averagePrepTime: number;
}
