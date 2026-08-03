# PeakPulse - Complete Setup Guide

## Prerequisites

Before starting, ensure you have installed:

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
3. **npm or pnpm** - Comes with Node.js

## Step 1: PostgreSQL Database Setup

### Install PostgreSQL (if not installed)

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer and remember your password
- Default port: 5432

**Using pgAdmin or psql:**

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE peakpulse;

-- Verify database creation
\l
```

## Step 2: Backend Setup

### Navigate to backend folder
```bash
cd backend
```

### Install dependencies
```bash
npm install
```

### Configure environment variables

The `.env` file has been created. Update these values if needed:

```env
DB_HOST=localhost        # Your PostgreSQL host
DB_PORT=5432            # PostgreSQL port
DB_NAME=peakpulse       # Database name
DB_USER=postgres        # Your PostgreSQL username
DB_PASSWORD=postgres    # Your PostgreSQL password
```

### Run database migrations
```bash
npm run migrate
```

This will create all necessary tables: users, deliveries, riders, restaurants, complaints, refunds, etc.

### Seed initial data (optional)
```bash
npm run seed
```

This creates:
- Admin user: `admin@peakpulse.com` / `admin123`
- Sample restaurants and riders

### Start backend server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Step 3: Test the Backend

### Check health endpoint
```bash
curl http://localhost:5000/health
```

### Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"full_name\":\"Test User\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

Save the `accessToken` from the response!

## Step 4: Frontend Setup (Next Steps)

The frontend needs to be updated to connect to the backend:

1. Install axios or fetch for API calls
2. Create authentication context
3. Store JWT tokens (localStorage/sessionStorage)
4. Add API interceptors for auth headers
5. Create login/register pages

## API Architecture

### Authentication Flow

1. **Register**: POST `/api/auth/register`
2. **Login**: POST `/api/auth/login` → Returns `accessToken` & `refreshToken`
3. **Access Protected Routes**: Include header `Authorization: Bearer <accessToken>`
4. **Refresh Token**: POST `/api/auth/refresh` with `refreshToken`
5. **Logout**: POST `/api/auth/logout`

### Protected Routes

All routes under `/api/deliveries`, `/api/analytics`, and `/api/riders` require authentication.

## Common Issues

### Issue: Cannot connect to database
**Solution**: 
- Check if PostgreSQL is running
- Verify credentials in `.env`
- Check firewall settings

### Issue: Port 5000 already in use
**Solution**: Change `PORT` in `.env` to another port (e.g., 5001)

### Issue: JWT errors
**Solution**: 
- Check that `JWT_SECRET` is set in `.env`
- Ensure tokens haven't expired

## Security Best Practices

1. **Never commit `.env` file** - It contains secrets
2. **Change default passwords** - Update JWT secrets in production
3. **Use HTTPS in production** - SSL/TLS certificates
4. **Set strong passwords** - Minimum 8 characters with complexity
5. **Enable rate limiting** - Prevent brute force attacks

## Next Steps

1. ✅ Backend with JWT auth - **COMPLETED**
2. 🔄 Update frontend to consume backend API
3. 📊 Connect dashboard to real data
4. 🚀 Deploy to production

## Useful Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Compile TypeScript
npm start           # Run compiled code

# Database
npm run migrate     # Run migrations
npm run seed        # Seed sample data

# Testing
curl http://localhost:5000/health  # Health check
```

## Support

For issues or questions:
- Check the API documentation in `backend/README.md`
- Review error logs in the console
- Verify database connections
