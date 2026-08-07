# PeakPulse Backend

Express + TypeScript backend for the PeakPulse Delivery Intelligence Platform.

## What it provides

- JWT authentication with refresh tokens
- Delivery analytics, rider metrics, and operational reporting
- User profile management under `/api/users`
- PostgreSQL-backed persistence and migrations
- Validation, security headers, and centralized error handling

## Tech Stack

- Node.js 18+
- Express.js
- TypeScript
- PostgreSQL
- JWT, bcryptjs, helmet, cors, express-validator

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Configure the database and auth values in `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=peakpulse
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

4. Create the database and run migrations:

```bash
npm run migrate
```

5. Optional: seed sample data and run the profile migration if needed:

```bash
npm run seed
npm run migrate:profile
```

## Run

Development:

```bash
npm run dev
```

Build and start:

```bash
npm run build
npm start
```

## Available Routes

### Health

- `GET /health`

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

### Users

- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/change-password`
- `DELETE /api/users/me`

### Analytics

- `GET /api/analytics/stats`
- `GET /api/analytics/sla-violations`
- `GET /api/analytics/peak-hours`
- `GET /api/analytics/complaints`
- `GET /api/analytics/refunds`

### Deliveries

- `GET /api/deliveries`
- `GET /api/deliveries/:id`
- `GET /api/deliveries/zone/:zone`

### Riders

- `GET /api/riders`
- `GET /api/riders/performance`
- `GET /api/riders/top`

## Example Requests

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@peakpulse.com","password":"password123","full_name":"John Analyst","role":"analyst"}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@peakpulse.com","password":"password123"}'
```

Get profile:

```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── server.ts
├── prisma/
├── package.json
└── README.md
```

## Validation

- `npm run build` compiles the backend
- `npm test` currently runs the build as the repository's validation step

