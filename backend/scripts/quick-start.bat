@echo off
echo ========================================
echo   PeakPulse Backend - Quick Start
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo [2/4] Installing dependencies...
call npm install

echo [3/4] Running database migrations...
call npm run migrate

echo [4/4] Starting development server...
echo.
echo ========================================
echo   Backend server starting on port 5000
echo   Press Ctrl+C to stop
echo ========================================
echo.
call npm run dev
