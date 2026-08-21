import fs from 'fs';

export function ensureUploadDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function getFileType(filename: string): string {
  const name = filename.toLowerCase().replace('.csv', '');
  
  if (name.includes('delivery') || name.includes('deliveries')) {
    return 'delivery_logs';
  }
  if (name.includes('rider') || name.includes('assignment')) {
    return 'rider_assignments';
  }
  if (name.includes('complaint')) {
    return 'complaints';
  }
  if (name.includes('refund')) {
    return 'refunds';
  }
  
  return 'unknown';
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

export function parseBoolean(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return normalized === 'true' || normalized === '1';
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function isValidNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
}
