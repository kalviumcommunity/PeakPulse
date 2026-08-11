export class DataTransformer {
  transformDelivery(row: any) {
    return {
      orderId: row.orderId,
      restaurantId: row.restaurantId,
      riderId: row.riderId,
      customerZone: row.customerZone,
      assignedAt: row.assignedAt,
      pickedAt: row.pickedAt,
      deliveredAt: row.deliveredAt,
      promisedTime: row.promisedTime,
      actualDeliveryTime: row.actualDeliveryTime,
      slaBreached: row.slaBreached,
      distanceKm: row.distanceKm
    };
  }

  transformComplaint(row: any, deliveryId: string) {
    return {
      deliveryId,
      complaintType: row.complaintType as any,
      severity: row.severity as any,
      description: row.description,
      createdAt: row.createdAt
    };
  }

  transformRefund(row: any, deliveryId: string) {
    return {
      deliveryId,
      refundAmount: row.refundAmount,
      refundReason: row.refundReason,
      approved: row.approved,
      createdAt: row.createdAt
    };
  }
}
