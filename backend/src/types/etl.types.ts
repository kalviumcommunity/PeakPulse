export interface ImportStats {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  duplicateRows: number;
  corruptedRows: number;
  cleanedRows: number;
  duration: number;
}

export interface ImportReport {
  fileType: string;
  success: boolean;
  stats: ImportStats;
  errors: string[];
  warnings: string[];
}

export interface CleanedData {
  valid: any[];
  corrupted: any[];
  errors: string[];
}

export interface ETLResult {
  success: boolean;
  message: string;
  report: ImportReport;
}
