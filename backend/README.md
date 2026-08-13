# PeakPulse Backend

This folder contains the FastAPI backend for PeakPulse.

## What it provides

- `GET /` — basic welcome response
- `GET /api/health` — health check
- `GET /api/zones` — mock zone data
- `GET /api/incidents` — mock incident data
- `GET /api/metrics` — mock summary metrics

## Run locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API from this folder:

```bash
uvicorn main:app --reload --port 8000
```

## Smoke test

Run the included backend smoke test:

```bash
python -m pytest test_backend.py
```
# PeakPulse Backend API

Backend API for the PeakPulse Delivery Intelligence Platform with JWT authentication and CSV import capabilities.

## Features

- 🔐 JWT-based authentication with refresh tokens
- 📊 Comprehensive delivery analytics
- 🚴 Rider performance tracking
- 🍽️ Restaurant analytics
- ⏱️ SLA violation monitoring
- 💬 Complaint analysis
- 💸 Refund tracking
- 📁 CSV import with ETL pipeline
- 🗄️ PostgreSQL database with Prisma ORM

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **CSV Parsing**: csv-parser
- **Security**: helmet, cors
- **Validation**: express-validator

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or pnpm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
copy .env.example .env
```

3. Configure your environment variables in `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=peakpulse
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/peakpulse?schema=public"
```

## Database Setup

1. Create the database:
```sql
CREATE DATABASE peakpulse;
```

2. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Seed sample data:
```bash
npm run seed:prisma
```

This will create:
- 8 Restaurants
- 10 Riders
- 50 Sample Deliveries
- 15 Complaints
- 10 Refunds

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile (protected)

### Analytics
- `GET /api/analytics/stats` - Overall delivery statistics
- `GET /api/analytics/sla-violations` - SLA violation analysis
- `GET /api/analytics/peak-hours` - Peak hour analysis
- `GET /api/analytics/complaints` - Complaint analysis
- `GET /api/analytics/refunds` - Refund analysis

### Deliveries
- `GET /api/deliveries` - Get all deliveries (paginated)
- `GET /api/deliveries/:id` - Get delivery by ID
- `GET /api/deliveries/zone/:zone` - Get deliveries by zone

### Riders
- `GET /api/riders` - Get all riders
- `GET /api/riders/performance` - Rider performance metrics
- `GET /api/riders/top` - Top performing riders

### CSV Import
- `GET /api/import/info` - Get upload requirements
- `POST /api/import/upload` - Upload and validate CSV (no database insert)
- `POST /api/import/import` - Import CSV with full ETL pipeline
- `GET /api/import/history` - Get import history

## CSV Import

PeakPulse supports importing delivery data via CSV files. See [IMPORT_GUIDE.md](./IMPORT_GUIDE.md) for detailed instructions.

### Quick Import
```bash
curl -X POST http://localhost:5000/api/import/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@delivery_logs.csv"
```

### Supported Files
- `delivery_logs.csv` - Delivery records
- `rider_assignments.csv` - Rider information
- `complaints.csv` - Customer complaints
- `refunds.csv` - Refund records

### Sample Data
Test CSV files are available in `tests/csv/`:
- `valid_delivery_logs.csv`
- `valid_complaints.csv`
- `valid_rider_assignments.csv`
- `valid_refunds.csv`

## Database Setup

1. Create the database:
```sql
CREATE DATABASE peakpulse;
```

2. Run migrations:
```bash
npm run migrate
```

3. (Optional) Seed sample data:
```bash
npm run seed
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile (protected)

### Analytics

- `GET /api/analytics/stats` - Overall delivery statistics
- `GET /api/analytics/sla-violations` - SLA violation analysis
- `GET /api/analytics/peak-hours` - Peak hour analysis
- `GET /api/analytics/complaints` - Complaint analysis
- `GET /api/analytics/refunds` - Refund analysis

### Deliveries

- `GET /api/deliveries` - Get all deliveries (paginated)
- `GET /api/deliveries/:id` - Get delivery by ID
- `GET /api/deliveries/zone/:zone` - Get deliveries by zone

### Riders

- `GET /api/riders` - Get all riders
- `GET /api/riders/performance` - Rider performance metrics
- `GET /api/riders/top` - Top performing riders

## Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@peakpulse.com",
    "password": "password123",
    "full_name": "John Analyst",
    "role": "analyst"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@peakpulse.com",
    "password": "password123"
  }'
```

### Get Analytics (Protected)
```bash
curl http://localhost:5000/api/analytics/stats?startDate=2024-01-01&endDate=2024-12-31 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation
│   ├── database/         # DB connection & migrations
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript types
│   └── server.ts         # Main server file
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

## Security Features

- Password hashing with bcryptjs
- JWT access tokens (7 day expiry)
- Refresh tokens (30 day expiry)
- Protected routes with middleware
- CORS configuration
- Helmet for security headers
- Input validation

## License

MIT
