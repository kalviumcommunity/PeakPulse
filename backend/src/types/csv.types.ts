export interface DeliveryLogRow {
  orderId: string;
  restaurantId: string;
  riderId: string;
  customerZone: string;
  assignedAt: string;
  pickedAt?: string;
  deliveredAt?: string;
  promisedTime: string;
  actualDeliveryTime?: string;
  slaBreached: string;
  distanceKm: string;
}

export interface RiderAssignmentRow {
  orderId: string;
  riderId: string;
  riderCode: string;
  riderName: string;
  vehicleType: string;
  assignedAt: string;
}

export interface ComplaintRow {
  orderId: string;
  complaintType: string;
  severity: string;
  description: string;
  createdAt: string;
}

export interface RefundRow {
  orderId: string;
  refundAmount: string;
  refundReason: string;
  approved: string;
  createdAt: string;
}

export interface CSVValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  preview: any[];
}

export interface CSVUploadResponse {
  success: boolean;
  message: string;
  fileType: string;
  validation: CSVValidationResult;
}

export enum CSVFileType {
  DELIVERY_LOGS = 'delivery_logs',
  RIDER_ASSIGNMENTS = 'rider_assignments',
  COMPLAINTS = 'complaints',
  REFUNDS = 'refunds'
}
