import { Request, Response } from 'express';
import { ETLService } from '../services/etl.service.js';
import { getFileType, deleteFile } from '../utils/csv.utils.js';
import fs from 'fs';

const etlService = new ETLService();

export async function importCSV(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { path: filePath, originalname } = req.file;
    const fileType = getFileType(originalname);

    if (fileType === 'unknown') {
      deleteFile(filePath);
      return res.status(400).json({
        success: false,
        message: 'Unable to determine file type'
      });
    }

    // Process based on file type
    let report;
    switch (fileType) {
      case 'delivery_logs':
        report = await etlService.processDeliveryLogs(filePath, originalname);
        break;
      case 'rider_assignments':
        report = await etlService.processRiderAssignments(filePath);
        break;
      case 'complaints':
        report = await etlService.processComplaints(filePath);
        break;
      case 'refunds':
        report = await etlService.processRefunds(filePath);
        break;
      default:
        deleteFile(filePath);
        return res.status(400).json({
          success: false,
          message: 'Unsupported file type'
        });
    }

    // Clean up file
    deleteFile(filePath);

    // Return report
    const statusCode = report.success ? 200 : 207; // 207 = Multi-Status
    return res.status(statusCode).json({
      success: report.success,
      message: report.success
        ? `Successfully imported ${report.stats.importedRows} rows`
        : `Import completed with errors. ${report.stats.importedRows} rows imported, ${report.stats.skippedRows} skipped`,
      report
    });

  } catch (error: any) {
    if (req.file?.path) {
      deleteFile(req.file.path);
    }

    console.error('ETL import error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Import failed'
    });
  }
}

export async function getImportHistory(req: Request, res: Response) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const imports = await prisma.importHistory.findMany({
      orderBy: {
        uploadedAt: 'desc'
      },
      take: 50
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      imports,
      total: imports.length
    });
  } catch (error: any) {
    console.error('Get import history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch import history'
    });
  }
}
