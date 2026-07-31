export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Express.Request {
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
