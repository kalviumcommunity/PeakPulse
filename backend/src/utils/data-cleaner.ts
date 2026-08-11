import { CleanedData } from '../types/etl.types.js';

export class DataCleaner {
  cleanDeliveryLogs(rows: any[]): CleanedData {
    const valid: any[] = [];
    const corrupted: any[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      try {
        const cleaned = {
          orderId: this.trimString(row.orderId),
          restaurantId: this.trimString(row.restaurantId),
          riderId: this.trimString(row.riderId),
          customerZone: this.normalizeZone(row.customerZone),
          assignedAt: this.validateTimestamp(row.assignedAt),
          pickedAt: row.pickedAt ? this.validateTimestamp(row.pickedAt) : null,
          deliveredAt: row.deliveredAt ? this.validateTimestamp(row.deliveredAt) : null,
          promisedTime: this.validateTimestamp(row.promisedTime),
          actualDeliveryTime: row.actualDeliveryTime ? this.validateTimestamp(row.actualDeliveryTime) : null,
          slaBreached: this.parseBoolean(row.slaBreached),
          distanceKm: this.parseFloat(row.distanceKm)
        };

        if (!cleaned.orderId || !cleaned.restaurantId || !cleaned.riderId) {
          throw new Error('Missing required IDs');
        }

        if (cleaned.distanceKm < 0) {
          throw new Error('Distance cannot be negative');
        }

        valid.push(cleaned);
      } catch (error: any) {
        corrupted.push(row);
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    return { valid, corrupted, errors };
  }

  cleanRiderAssignments(rows: any[]): CleanedData {
    const valid: any[] = [];
    const corrupted: any[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      try {
        const cleaned = {
          orderId: this.trimString(row.orderId),
          riderId: this.trimString(row.riderId),
          riderCode: this.trimString(row.riderCode),
          riderName: this.normalizeName(row.riderName),
          vehicleType: this.normalizeEnum(row.vehicleType),
          assignedAt: this.validateTimestamp(row.assignedAt)
        };

        if (!cleaned.orderId || !cleaned.riderId || !cleaned.riderCode) {
          throw new Error('Missing required IDs');
        }

        if (!['BIKE', 'SCOOTER', 'MOTORCYCLE', 'CAR', 'BICYCLE'].includes(cleaned.vehicleType)) {
          throw new Error('Invalid vehicle type');
        }

        valid.push(cleaned);
      } catch (error: any) {
        corrupted.push(row);
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    return { valid, corrupted, errors };
  }

  cleanComplaints(rows: any[]): CleanedData {
    const valid: any[] = [];
    const corrupted: any[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      try {
        const cleaned = {
          orderId: this.trimString(row.orderId),
          complaintType: this.normalizeEnum(row.complaintType),
          severity: this.normalizeEnum(row.severity),
          description: this.trimString(row.description),
          createdAt: this.validateTimestamp(row.createdAt)
        };

        if (!cleaned.orderId || !cleaned.description) {
          throw new Error('Missing required fields');
        }

        valid.push(cleaned);
      } catch (error: any) {
        corrupted.push(row);
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    return { valid, corrupted, errors };
  }

  cleanRefunds(rows: any[]): CleanedData {
    const valid: any[] = [];
    const corrupted: any[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      try {
        const cleaned = {
          orderId: this.trimString(row.orderId),
          refundAmount: this.parseFloat(row.refundAmount),
          refundReason: this.trimString(row.refundReason),
          approved: this.parseBoolean(row.approved),
          createdAt: this.validateTimestamp(row.createdAt)
        };

        if (!cleaned.orderId || !cleaned.refundReason) {
          throw new Error('Missing required fields');
        }

        if (cleaned.refundAmount < 0) {
          throw new Error('Refund amount cannot be negative');
        }

        valid.push(cleaned);
      } catch (error: any) {
        corrupted.push(row);
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    return { valid, corrupted, errors };
  }

  private trimString(value: any): string {
    return value ? String(value).trim() : '';
  }

  private normalizeName(value: any): string {
    return this.trimString(value)
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private normalizeZone(value: any): string {
    return this.trimString(value).toUpperCase();
  }

  private normalizeEnum(value: any): string {
    return this.trimString(value).toUpperCase().replace(/\s+/g, '_');
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase().trim();
    return str === 'true' || str === '1' || str === 'yes';
  }

  private parseFloat(value: any): number {
    const num = parseFloat(value);
    if (isNaN(num)) throw new Error(`Invalid number: ${value}`);
    return num;
  }

  private validateTimestamp(value: any): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp: ${value}`);
    }
    return date;
  }
}
