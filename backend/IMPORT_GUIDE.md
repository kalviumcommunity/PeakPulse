# PeakPulse CSV Import Guide

## 📋 Overview

PeakPulse supports importing delivery analytics data through CSV files. This guide covers the complete import process, supported formats, and API endpoints.

## 🚀 Quick Start

### 1. Prepare Your CSV Files

Ensure your CSV files follow the required format (see below) and are named appropriately:
- `delivery_logs.csv` or `deliveries.csv`
- `rider_assignments.csv` or `riders.csv`
- `complaints.csv`
- `refunds.csv`

### 2. Import via API

```bash
# Upload and validate (no database insert)
curl -X POST http://localhost:5000/api/import/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@delivery_logs.csv"

# Import with full ETL pipeline
curl -X POST http://localhost:5000/api/import/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@delivery_logs.csv"
```

## 📊 Supported CSV Formats

### 1. Delivery Logs (`delivery_logs.csv`)

**Required Headers:**
- `orderId` - Unique order identifier
- `restaurantId` - Restaurant identifier
- `riderId` - Rider identifier
- `customerZone` - Delivery zone
- `assignedAt` - ISO timestamp when order was assigned
- `promisedTime` - ISO timestamp of promised delivery
- `slaBreached` - Boolean (true/false or 1/0)
- `distanceKm` - Distance in kilometers (numeric)

**Optional Headers:**
- `pickedAt` - ISO timestamp when order was picked
- `deliveredAt` - ISO timestamp when order was delivered
- `actualDeliveryTime` - ISO timestamp of actual delivery

**Example:**
```csv
orderId,restaurantId,riderId,customerZone,assignedAt,pickedAt,deliveredAt,promisedTime,actualDeliveryTime,slaBreached,distanceKm
ORD001,REST001,RIDER001,Zone A,2024-01-15T10:00:00Z,2024-01-15T10:15:00Z,2024-01-15T10:45:00Z,2024-01-15T10:40:00Z,2024-01-15T10:45:00Z,true,5.2
ORD002,REST002,RIDER002,Zone B,2024-01-15T11:00:00Z,2024-01-15T11:10:00Z,2024-01-15T11:30:00Z,2024-01-15T11:35:00Z,2024-01-15T11:30:00Z,false,3.8
```

### 2. Rider Assignments (`rider_assignments.csv`)

**Required Headers:**
- `orderId` - Order identifier
- `riderId` - Rider identifier
- `riderCode` - Unique rider code
- `riderName` - Rider's full name
- `vehicleType` - One of: BIKE, SCOOTER, MOTORCYCLE, CAR, BICYCLE
- `assignedAt` - ISO timestamp

**Example:**
```csv
orderId,riderId,riderCode,riderName,vehicleType,assignedAt
ORD001,RIDER001,RC001,John Doe,BIKE,2024-01-15T10:00:00Z
ORD002,RIDER002,RC002,Jane Smith,SCOOTER,2024-01-15T11:00:00Z
```

### 3. Complaints (`complaints.csv`)

**Required Headers:**
- `orderId` - Order identifier
- `complaintType` - One of: LATE_DELIVERY, WRONG_ORDER, MISSING_ITEMS, POOR_QUALITY, RIDER_BEHAVIOR, RESTAURANT_ISSUE, OTHER
- `severity` - One of: LOW, MEDIUM, HIGH, CRITICAL
- `description` - Complaint description
- `createdAt` - ISO timestamp

**Example:**
```csv
orderId,complaintType,severity,description,createdAt
ORD001,LATE_DELIVERY,HIGH,Order arrived 30 minutes late,2024-01-15T11:00:00Z
ORD002,WRONG_ORDER,MEDIUM,Received wrong items,2024-01-15T12:00:00Z
```

### 4. Refunds (`refunds.csv`)

**Required Headers:**
- `orderId` - Order identifier
- `refundAmount` - Refund amount (numeric)
- `refundReason` - Reason for refund
- `approved` - Boolean (true/false or 1/0)
- `createdAt` - ISO timestamp

**Example:**
```csv
orderId,refundAmount,refundReason,approved,createdAt
ORD001,150.50,Order arrived late,true,2024-01-15T12:00:00Z
ORD002,200.00,Wrong items delivered,true,2024-01-15T13:00:00Z
```

## 🔧 API Endpoints

### Get Upload Info
```
GET /api/import/info
Authorization: Bearer <token>

Response:
{
  "maxFileSize": "10MB",
  "allowedTypes": ["CSV"],
  "requiredFiles": [...],
  "requiredHeaders": {...},
  "validEnums": {...}
}
```

### Upload & Validate (No Database Insert)
```
POST /api/import/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: file=<csv-file>

Response:
{
  "success": true,
  "message": "CSV validated successfully. 5 rows ready for import.",
  "fileType": "delivery_logs",
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "rowCount": 5,
    "preview": [...]
  }
}
```

### Import with ETL Pipeline
```
POST /api/import/import
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: file=<csv-file>

Response:
{
  "success": true,
  "message": "Successfully imported 45 rows",
  "report": {
    "fileType": "delivery_logs",
    "success": true,
    "stats": {
      "totalRows": 50,
      "importedRows": 45,
      "skippedRows": 3,
      "duplicateRows": 2,
      "corruptedRows": 0,
      "cleanedRows": 48,
      "duration": 1234
    },
    "errors": [],
    "warnings": []
  }
}
```

### Get Import History
```
GET /api/import/history
Authorization: Bearer <token>

Response:
{
  "success": true,
  "imports": [
    {
      "id": "uuid",
      "filename": "delivery_logs.csv",
      "fileType": "delivery_logs",
      "uploadedAt": "2024-01-15T10:00:00Z",
      "importedRows": 45,
      "skippedRows": 3,
      "failedRows": 2,
      "status": "SUCCESS",
      "duration": 1234
    }
  ],
  "total": 1
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── csv.config.ts          # CSV configuration
│   ├── controllers/
│   │   ├── import.controller.ts   # Upload & validation
│   │   └── etl.controller.ts      # ETL pipeline
│   ├── services/
│   │   ├── csv.service.ts         # CSV parsing
│   │   └── etl.service.ts         # ETL orchestration
│   ├── validators/
│   │   └── csv.validator.ts       # CSV validation
│   ├── utils/
│   │   ├── csv.utils.ts           # Helper functions
│   │   ├── data-cleaner.ts        # Data cleaning
│   │   └── data-transformer.ts    # Data transformation
│   └── middleware/
│       └── upload.middleware.ts   # Multer configuration
├── tests/
│   ├── csv/                       # Test CSV files
│   ├── test-csv-upload.ts        # Upload tests
│   └── test-etl-pipeline.ts      # ETL tests
└── uploads/
    └── temp/                      # Temporary upload storage
```

## 🛠️ Data Processing Pipeline

The ETL pipeline consists of 5 stages:

### 1. Upload
- File validation (size, type)
- Temporary storage
- Initial parsing

### 2. Validate
- Header validation
- Row-by-row validation
- Data type checking
- Enum validation

### 3. Clean
- Remove duplicates
- Trim whitespace
- Normalize names
- Validate timestamps
- Handle corrupted rows

### 4. Transform
- Map CSV columns to database models
- Type conversion
- Data normalization

### 5. Insert
- Batch inserts (100 rows per batch)
- Transaction management
- Rollback on failure
- Foreign key handling

## ✅ Data Validation Rules

### Timestamps
- Must be valid ISO 8601 format
- Example: `2024-01-15T10:00:00Z`

### Enums
- Case-insensitive
- Spaces converted to underscores
- Must match valid values

### Numbers
- Must be valid numeric values
- Cannot be negative (for distance, amounts)

### Booleans
- Accepts: `true`, `false`, `1`, `0`, `TRUE`, `FALSE`

### IDs
- Cannot be empty
- Whitespace is trimmed
- Case-sensitive

## 🧪 Testing

### Run Upload Tests
```bash
npm run test:csv
```

### Run ETL Pipeline Tests
```bash
npm run test:etl
```

### Test Files Available
- `valid_delivery_logs.csv` - Valid test data
- `invalid_delivery_logs.csv` - Contains errors
- `missing_headers.csv` - Missing required headers
- `duplicate_records.csv` - Duplicate order IDs
- `empty.csv` - Empty file
- `large_delivery_logs.csv` - Large dataset

## 🚨 Common Errors

### Missing Headers
```
Error: Missing required headers: promisedTime, slaBreached
```
**Solution:** Ensure all required headers are present in your CSV.

### Invalid Timestamp
```
Error: Row 3: assignedAt must be a valid date
```
**Solution:** Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)

### Invalid Enum
```
Error: Row 5: vehicleType must be one of: BIKE, SCOOTER, MOTORCYCLE, CAR, BICYCLE
```
**Solution:** Use exact enum values (case-insensitive)

### Negative Values
```
Error: Row 7: distanceKm cannot be negative
```
**Solution:** Ensure numeric values are positive

### Missing Delivery
```
Error: Skipped complaint for orderId ORD999: Delivery not found
```
**Solution:** Import deliveries before importing related data (complaints, refunds)

## 💡 Best Practices

1. **Import Order:** Always import in this sequence:
   - Restaurants (auto-created if missing)
   - Riders (from rider_assignments or auto-created)
   - Deliveries
   - Complaints (requires deliveries)
   - Refunds (requires deliveries)

2. **File Size:** Keep files under 10MB for optimal performance

3. **Batch Size:** System processes 100 rows per transaction

4. **Duplicates:** First occurrence is kept, duplicates are skipped

5. **Validation:** Use `/upload` endpoint first to validate before importing

6. **Error Handling:** Review import report for detailed error messages

## 🔐 Security

- All endpoints require JWT authentication
- Files are validated before processing
- Temporary files are automatically cleaned up
- File size limits enforced (10MB)
- Only CSV format accepted

## 📞 Support

For issues or questions:
1. Check validation errors in import report
2. Review this guide for format requirements
3. Test with provided sample CSV files
4. Check API response for detailed error messages
