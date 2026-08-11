import fs from 'fs';
import csv from 'csv-parser';
import { CSVValidator } from '../validators/csv.validator.js';
import { CSV_CONFIG } from '../config/csv.config.js';
import { CSVValidationResult } from '../types/csv.types.js';

export class CSVService {
  private validator: CSVValidator;

  constructor() {
    this.validator = new CSVValidator();
  }

  async parseAndValidate(filePath: string, fileType: string): Promise<CSVValidationResult> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      let headers: string[] = [];
      let rowNumber = 0;
      let isValid = true;

      this.validator.reset();

      const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (csvHeaders: string[]) => {
          headers = csvHeaders;
          
          if (!this.validator.validateHeaders(headers, fileType)) {
            isValid = false;
            stream.destroy();
          }
        })
        .on('data', (row: any) => {
          rowNumber++;
          rows.push(row);

          if (!this.validator.validateRow(row, rowNumber, fileType)) {
            isValid = false;
          }

          // Stop reading after max errors
          if (this.validator.getErrors().length > 50) {
            stream.destroy();
          }
        })
        .on('end', () => {
          const preview = rows.slice(0, CSV_CONFIG.previewRows);
          
          resolve({
            valid: isValid && this.validator.getErrors().length === 0,
            errors: this.validator.getErrors(),
            warnings: this.validator.getWarnings(),
            rowCount: rows.length,
            preview
          });
        })
        .on('error', (error: Error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        });
    });
  }

  async countRows(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', () => count++)
        .on('end', () => resolve(count))
        .on('error', reject);
    });
  }
}
