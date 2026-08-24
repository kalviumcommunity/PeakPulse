import { Request, Response } from 'express';
import { CSVService } from '../services/csv.service.js';
import { getFileType, deleteFile } from '../utils/csv.utils.js';
import { CSVUploadResponse } from '../types/csv.types.js';

const csvService = new CSVService();

export async function uploadCSV(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const { path: filePath, originalname } = req.file;
    
    // Determine file type from filename
    const fileType = getFileType(originalname);
    
    if (fileType === 'unknown') {
      deleteFile(filePath);
      res.status(400).json({
        success: false,
        message: 'Unable to determine file type. Filename must include: delivery, rider, complaint, or refund'
      });
      return;
    }

    // Parse and validate CSV
    const validation = await csvService.parseAndValidate(filePath, fileType);

    // Clean up temporary file
    deleteFile(filePath);

    // Prepare response
    const response: CSVUploadResponse = {
      success: validation.valid,
      message: validation.valid 
        ? `CSV validated successfully. ${validation.rowCount} rows ready for import.`
        : `CSV validation failed with ${validation.errors.length} error(s)`,
      fileType,
      validation
    };

    const statusCode = validation.valid ? 200 : 400;
    res.status(statusCode).json(response);
    return;

  } catch (error: any) {
    // Clean up file on error
    if (req.file?.path) {
      deleteFile(req.file.path);
    }

    console.error('CSV upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process CSV file'
    });
    return;
  }
}

export async function getUploadInfo(_req: Request, res: Response): Promise<void> {
  try {
    res.json({
      maxFileSize: '10MB',
      allowedTypes: ['CSV'],
      requiredFiles: [
        'delivery_logs.csv',
        'rider_assignments.csv',
        'complaints.csv',
        'refunds.csv'
      ],
      requiredHeaders: {
        delivery_logs: [
          'orderId',
          'restaurantId',
          'riderId',
          'customerZone',
          'assignedAt',
          'pickedAt (optional)',
          'deliveredAt (optional)',
          'promisedTime',
          'actualDeliveryTime (optional)',
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
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
      }
    });
  } catch (error: any) {
    console.error('Get upload info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload information'
    });
  }
}
