import { PrismaClient } from '@prisma/client';
import { CSVService } from './csv.service.js';
import { DataCleaner } from '../utils/data-cleaner.js';
import { DataTransformer } from '../utils/data-transformer.js';
import { ImportReport, ImportStats } from '../types/etl.types.js';

const prisma = new PrismaClient();
const csvService = new CSVService();
const cleaner = new DataCleaner();
const transformer = new DataTransformer();

export class ETLService {
  async processDeliveryLogs(filePath: string): Promise<ImportReport> {
    const report: ImportReport = this.initializeReport('delivery_logs');
    const startTime = Date.now();

    try {
      // Step 1: Parse CSV
      const rows = await this.parseCSV(filePath);
      report.stats.totalRows = rows.length;

      // Step 2: Clean data
      const cleanedData = cleaner.cleanDeliveryLogs(rows);
      report.stats.cleanedRows = cleanedData.valid.length;
      report.stats.corruptedRows = cleanedData.corrupted.length;
      report.errors.push(...cleanedData.errors);

      // Step 3: Remove duplicates
      const deduplicated = this.removeDuplicates(cleanedData.valid, 'orderId');
      report.stats.duplicateRows = cleanedData.valid.length - deduplicated.length;

      // Step 4: Transform and insert
      await this.insertDeliveries(deduplicated, report);

      report.stats.duration = Date.now() - startTime;
      report.success = report.errors.length === 0;

    } catch (error: any) {
      report.success = false;
      report.errors.push(`Pipeline failed: ${error.message}`);
    }

    return report;
  }

  async processRiderAssignments(filePath: string): Promise<ImportReport> {
    const report: ImportReport = this.initializeReport('rider_assignments');
    const startTime = Date.now();

    try {
      const rows = await this.parseCSV(filePath);
      report.stats.totalRows = rows.length;

      const cleanedData = cleaner.cleanRiderAssignments(rows);
      report.stats.cleanedRows = cleanedData.valid.length;
      report.stats.corruptedRows = cleanedData.corrupted.length;
      report.errors.push(...cleanedData.errors);

      const deduplicated = this.removeDuplicates(cleanedData.valid, 'orderId');
      report.stats.duplicateRows = cleanedData.valid.length - deduplicated.length;

      await this.insertRidersAndAssignments(deduplicated, report);

      report.stats.duration = Date.now() - startTime;
      report.success = report.errors.length === 0;

    } catch (error: any) {
      report.success = false;
      report.errors.push(`Pipeline failed: ${error.message}`);
    }

    return report;
  }

  async processComplaints(filePath: string): Promise<ImportReport> {
    const report: ImportReport = this.initializeReport('complaints');
    const startTime = Date.now();

    try {
      const rows = await this.parseCSV(filePath);
      report.stats.totalRows = rows.length;

      const cleanedData = cleaner.cleanComplaints(rows);
      report.stats.cleanedRows = cleanedData.valid.length;
      report.stats.corruptedRows = cleanedData.corrupted.length;
      report.errors.push(...cleanedData.errors);

      const deduplicated = this.removeDuplicates(cleanedData.valid, 'orderId');
      report.stats.duplicateRows = cleanedData.valid.length - deduplicated.length;

      await this.insertComplaints(deduplicated, report);

      report.stats.duration = Date.now() - startTime;
      report.success = report.errors.length === 0;

    } catch (error: any) {
      report.success = false;
      report.errors.push(`Pipeline failed: ${error.message}`);
    }

    return report;
  }

  async processRefunds(filePath: string): Promise<ImportReport> {
    const report: ImportReport = this.initializeReport('refunds');
    const startTime = Date.now();

    try {
      const rows = await this.parseCSV(filePath);
      report.stats.totalRows = rows.length;

      const cleanedData = cleaner.cleanRefunds(rows);
      report.stats.cleanedRows = cleanedData.valid.length;
      report.stats.corruptedRows = cleanedData.corrupted.length;
      report.errors.push(...cleanedData.errors);

      const deduplicated = this.removeDuplicates(cleanedData.valid, 'orderId');
      report.stats.duplicateRows = cleanedData.valid.length - deduplicated.length;

      await this.insertRefunds(deduplicated, report);

      report.stats.duration = Date.now() - startTime;
      report.success = report.errors.length === 0;

    } catch (error: any) {
      report.success = false;
      report.errors.push(`Pipeline failed: ${error.message}`);
    }

    return report;
  }

  private async parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const csv = require('csv-parser');
      const rows: any[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row: any) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  private removeDuplicates(rows: any[], key: string): any[] {
    const seen = new Set();
    return rows.filter(row => {
      const value = row[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  private async insertDeliveries(rows: any[], report: ImportReport): Promise<void> {
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      try {
        await prisma.$transaction(async (tx) => {
          for (const row of batch) {
            try {
              // Ensure restaurant exists
              const restaurant = await tx.restaurant.upsert({
                where: { id: row.restaurantId },
                create: {
                  id: row.restaurantId,
                  name: row.restaurantId,
                  location: 'Unknown'
                },
                update: {}
              });

              // Ensure rider exists
              const rider = await tx.rider.upsert({
                where: { id: row.riderId },
                create: {
                  id: row.riderId,
                  riderCode: row.riderId,
                  name: row.riderId,
                  vehicleType: 'BIKE'
                },
                update: {}
              });

              // Insert delivery
              const delivery = transformer.transformDelivery(row);
              await tx.delivery.create({
                data: delivery
              });

              report.stats.importedRows++;
            } catch (error: any) {
              report.stats.skippedRows++;
              report.errors.push(`Skipped orderId ${row.orderId}: ${error.message}`);
            }
          }
        });
      } catch (error: any) {
        report.errors.push(`Batch ${i / BATCH_SIZE + 1} failed: ${error.message}`);
      }
    }
  }

  private async insertRidersAndAssignments(rows: any[], report: ImportReport): Promise<void> {
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      try {
        await prisma.$transaction(async (tx) => {
          for (const row of batch) {
            try {
              // Create or update rider
              await tx.rider.upsert({
                where: { riderCode: row.riderCode },
                create: {
                  id: row.riderId,
                  riderCode: row.riderCode,
                  name: row.riderName,
                  vehicleType: row.vehicleType as any
                },
                update: {
                  name: row.riderName,
                  vehicleType: row.vehicleType as any
                }
              });

              report.stats.importedRows++;
            } catch (error: any) {
              report.stats.skippedRows++;
              report.errors.push(`Skipped riderCode ${row.riderCode}: ${error.message}`);
            }
          }
        });
      } catch (error: any) {
        report.errors.push(`Batch ${i / BATCH_SIZE + 1} failed: ${error.message}`);
      }
    }
  }

  private async insertComplaints(rows: any[], report: ImportReport): Promise<void> {
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      try {
        await prisma.$transaction(async (tx) => {
          for (const row of batch) {
            try {
              // Check if delivery exists
              const delivery = await tx.delivery.findUnique({
                where: { orderId: row.orderId }
              });

              if (!delivery) {
                report.stats.skippedRows++;
                report.errors.push(`Skipped complaint for orderId ${row.orderId}: Delivery not found`);
                continue;
              }

              // Insert complaint
              const complaint = transformer.transformComplaint(row, delivery.id);
              await tx.complaint.create({
                data: complaint
              });

              report.stats.importedRows++;
            } catch (error: any) {
              report.stats.skippedRows++;
              report.errors.push(`Skipped complaint for orderId ${row.orderId}: ${error.message}`);
            }
          }
        });
      } catch (error: any) {
        report.errors.push(`Batch ${i / BATCH_SIZE + 1} failed: ${error.message}`);
      }
    }
  }

  private async insertRefunds(rows: any[], report: ImportReport): Promise<void> {
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      try {
        await prisma.$transaction(async (tx) => {
          for (const row of batch) {
            try {
              // Check if delivery exists
              const delivery = await tx.delivery.findUnique({
                where: { orderId: row.orderId }
              });

              if (!delivery) {
                report.stats.skippedRows++;
                report.errors.push(`Skipped refund for orderId ${row.orderId}: Delivery not found`);
                continue;
              }

              // Insert refund
              const refund = transformer.transformRefund(row, delivery.id);
              await tx.refund.create({
                data: refund
              });

              report.stats.importedRows++;
            } catch (error: any) {
              report.stats.skippedRows++;
              report.errors.push(`Skipped refund for orderId ${row.orderId}: ${error.message}`);
            }
          }
        });
      } catch (error: any) {
        report.errors.push(`Batch ${i / BATCH_SIZE + 1} failed: ${error.message}`);
      }
    }
  }

  private initializeReport(fileType: string): ImportReport {
    return {
      fileType,
      success: true,
      stats: {
        totalRows: 0,
        importedRows: 0,
        skippedRows: 0,
        duplicateRows: 0,
        corruptedRows: 0,
        cleanedRows: 0,
        duration: 0
      },
      errors: [],
      warnings: []
    };
  }
}
