export const CSV_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel', 'text/plain'],
  uploadDir: 'uploads/temp',
  previewRows: 5,
  
  requiredHeaders: {
    delivery_logs: [
      'orderId',
      'restaurantId', 
      'riderId',
      'customerZone',
      'assignedAt',
      'promisedTime',
      'slaBreached',
      'distanceKm'
    ],
    rider_assignments: [
      'orderId',
      'riderId',
      'riderCode',
      'riderName',
      'vehicleType',
      'assignedAt'
    ],
    complaints: [
      'orderId',
      'complaintType',
      'severity',
      'description',
      'createdAt'
    ],
    refunds: [
      'orderId',
      'refundAmount',
      'refundReason',
      'approved',
      'createdAt'
    ]
  },
  
  validEnums: {
    vehicleType: ['BIKE', 'SCOOTER', 'MOTORCYCLE', 'CAR', 'BICYCLE'],
    complaintType: [
      'LATE_DELIVERY',
      'WRONG_ORDER',
      'MISSING_ITEMS',
      'POOR_QUALITY',
      'RIDER_BEHAVIOR',
      'RESTAURANT_ISSUE',
      'OTHER'
    ],
    severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    slaBreached: ['true', 'false', 'TRUE', 'FALSE', '1', '0'],
    approved: ['true', 'false', 'TRUE', 'FALSE', '1', '0']
  }
};
