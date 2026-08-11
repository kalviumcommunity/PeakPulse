import { CSV_CONFIG } from '../config/csv.config.js';
import { isValidDate, isValidNumber, parseBoolean } from '../utils/csv.utils.js';

export class CSVValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  validateHeaders(headers: string[], fileType: string): boolean {
    const requiredHeaders = CSV_CONFIG.requiredHeaders[fileType as keyof typeof CSV_CONFIG.requiredHeaders];
    
    if (!requiredHeaders) {
      this.errors.push(`Unknown file type: ${fileType}`);
      return false;
    }

    const missingHeaders = requiredHeaders.filter(
      header => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      this.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return false;
    }

    const extraHeaders = headers.filter(
      header => !requiredHeaders.includes(header)
    );

    if (extraHeaders.length > 0) {
      this.warnings.push(`Extra headers found (will be ignored): ${extraHeaders.join(', ')}`);
    }

    return true;
  }

  validateRow(row: any, rowNumber: number, fileType: string): boolean {
    let valid = true;

    switch (fileType) {
      case 'delivery_logs':
        valid = this.validateDeliveryLog(row, rowNumber);
        break;
      case 'rider_assignments':
        valid = this.validateRiderAssignment(row, rowNumber);
        break;
      case 'complaints':
        valid = this.validateComplaint(row, rowNumber);
        break;
      case 'refunds':
        valid = this.validateRefund(row, rowNumber);
        break;
      default:
        this.errors.push(`Unknown file type: ${fileType}`);
        return false;
    }

    return valid;
  }

  private validateDeliveryLog(row: any, rowNumber: number): boolean {
    let valid = true;

    if (!row.orderId || row.orderId.trim() === '') {
      this.errors.push(`Row ${rowNumber}: orderId is required`);
      valid = false;
    }

    if (!row.restaurantId || row.restaurantId.trim() === '') {
      this.errors.push(`Row ${rowNumber}: restaurantId is required`);
      valid = false;
    }

    if (!row.riderId || row.riderId.trim() === '') {
      this.errors.push(`Row ${rowNumber}: riderId is required`);
      valid = false;
    }

    if (!row.customerZone || row.customerZone.trim() === '') {
      this.errors.push(`Row ${rowNumber}: customerZone is required`);
      valid = false;
    }

    if (!isValidDate(row.assignedAt)) {
      this.errors.push(`Row ${rowNumber}: assignedAt must be a valid date`);
      valid = false;
    }

    if (!isValidDate(row.promisedTime)) {
      this.errors.push(`Row ${rowNumber}: promisedTime must be a valid date`);
      valid = false;
    }

    if (row.pickedAt && !isValidDate(row.pickedAt)) {
      this.errors.push(`Row ${rowNumber}: pickedAt must be a valid date`);
      valid = false;
    }

    if (row.deliveredAt && !isValidDate(row.deliveredAt)) {
      this.errors.push(`Row ${rowNumber}: deliveredAt must be a valid date`);
      valid = false;
    }

    if (row.actualDeliveryTime && !isValidDate(row.actualDeliveryTime)) {
      this.errors.push(`Row ${rowNumber}: actualDeliveryTime must be a valid date`);
      valid = false;
    }

    if (!CSV_CONFIG.validEnums.slaBreached.includes(row.slaBreached)) {
      this.errors.push(`Row ${rowNumber}: slaBreached must be true/false or 1/0`);
      valid = false;
    }

    if (!isValidNumber(row.distanceKm)) {
      this.errors.push(`Row ${rowNumber}: distanceKm must be a valid number`);
      valid = false;
    } else if (parseFloat(row.distanceKm) < 0) {
      this.errors.push(`Row ${rowNumber}: distanceKm cannot be negative`);
      valid = false;
    }

    return valid;
  }

  private validateRiderAssignment(row: any, rowNumber: number): boolean {
    let valid = true;

    if (!row.orderId || row.orderId.trim() === '') {
      this.errors.push(`Row ${rowNumber}: orderId is required`);
      valid = false;
    }

    if (!row.riderId || row.riderId.trim() === '') {
      this.errors.push(`Row ${rowNumber}: riderId is required`);
      valid = false;
    }

    if (!row.riderCode || row.riderCode.trim() === '') {
      this.errors.push(`Row ${rowNumber}: riderCode is required`);
      valid = false;
    }

    if (!row.riderName || row.riderName.trim() === '') {
      this.errors.push(`Row ${rowNumber}: riderName is required`);
      valid = false;
    }

    if (!CSV_CONFIG.validEnums.vehicleType.includes(row.vehicleType)) {
      this.errors.push(`Row ${rowNumber}: vehicleType must be one of: ${CSV_CONFIG.validEnums.vehicleType.join(', ')}`);
      valid = false;
    }

    if (!isValidDate(row.assignedAt)) {
      this.errors.push(`Row ${rowNumber}: assignedAt must be a valid date`);
      valid = false;
    }

    return valid;
  }

  private validateComplaint(row: any, rowNumber: number): boolean {
    let valid = true;

    if (!row.orderId || row.orderId.trim() === '') {
      this.errors.push(`Row ${rowNumber}: orderId is required`);
      valid = false;
    }

    if (!CSV_CONFIG.validEnums.complaintType.includes(row.complaintType)) {
      this.errors.push(`Row ${rowNumber}: complaintType must be one of: ${CSV_CONFIG.validEnums.complaintType.join(', ')}`);
      valid = false;
    }

    if (!CSV_CONFIG.validEnums.severity.includes(row.severity)) {
      this.errors.push(`Row ${rowNumber}: severity must be one of: ${CSV_CONFIG.validEnums.severity.join(', ')}`);
      valid = false;
    }

    if (!row.description || row.description.trim() === '') {
      this.errors.push(`Row ${rowNumber}: description is required`);
      valid = false;
    }

    if (!isValidDate(row.createdAt)) {
      this.errors.push(`Row ${rowNumber}: createdAt must be a valid date`);
      valid = false;
    }

    return valid;
  }

  private validateRefund(row: any, rowNumber: number): boolean {
    let valid = true;

    if (!row.orderId || row.orderId.trim() === '') {
      this.errors.push(`Row ${rowNumber}: orderId is required`);
      valid = false;
    }

    if (!isValidNumber(row.refundAmount)) {
      this.errors.push(`Row ${rowNumber}: refundAmount must be a valid number`);
      valid = false;
    } else if (parseFloat(row.refundAmount) < 0) {
      this.errors.push(`Row ${rowNumber}: refundAmount cannot be negative`);
      valid = false;
    }

    if (!row.refundReason || row.refundReason.trim() === '') {
      this.errors.push(`Row ${rowNumber}: refundReason is required`);
      valid = false;
    }

    if (!CSV_CONFIG.validEnums.approved.includes(row.approved)) {
      this.errors.push(`Row ${rowNumber}: approved must be true/false or 1/0`);
      valid = false;
    }

    if (!isValidDate(row.createdAt)) {
      this.errors.push(`Row ${rowNumber}: createdAt must be a valid date`);
      valid = false;
    }

    return valid;
  }

  getErrors(): string[] {
    return this.errors;
  }

  getWarnings(): string[] {
    return this.warnings;
  }

  reset(): void {
    this.errors = [];
    this.warnings = [];
  }
}
