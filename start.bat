@echo off
title CarbonLens Startup Script

echo ======================================
echo CarbonLens Windows Startup Script
echo ======================================

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18.0.0 or higher
    pause
    exit /b 1
)

echo Node.js version check passed
echo.

:: Get the option parameter
set "option=%~1"
if "%option%"=="" set "option=all"

echo Starting services: %option%
echo.

:: Start backend if needed
if "%option%"=="backend" goto :start_backend
if "%option%"=="all" goto :start_backend
goto :check_frontend

:start_backend
echo Starting backend service...

if not exist "backend" (
    echo ERROR: backend directory does not exist!
    pause
    exit /b 1
)

cd backend

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
)

:: Create .env file if not exists
if not exist ".env" (
    if exist "env.example" (
        echo Creating environment file...
        copy env.example .env >nul
    ) else (
        echo Creating default environment file...
        (
            echo PORT=3001
            echo NODE_ENV=development
            echo DATABASE_URL=sqlite:./database.sqlite
            echo JWT_SECRET=your-super-secret-jwt-key-here
            echo JWT_EXPIRES_IN=7d
            echo FRONTEND_URL=http://localhost:3000
        ) > .env
    )
)

:: Start backend development server
echo Starting backend development server...
start "CarbonLens Backend" cmd /c "npm run dev && pause"
cd ..

timeout /t 3 /nobreak >nul
echo Backend service started at http://localhost:3001

:check_frontend
:: Start frontend if needed
if "%option%"=="frontend" goto :start_frontend
if "%option%"=="all" goto :start_frontend
goto :finish

:start_frontend
echo Starting web frontend...

if not exist "web-frontend" (
    echo ERROR: web-frontend directory does not exist!
    pause
    exit /b 1
)

cd web-frontend

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
)

:: Create .env file if not exists
if not exist ".env" (
    echo Creating frontend environment file...
    echo VITE_API_URL=http://localhost:3001/api > .env
)

:: Start frontend development server
echo Starting frontend development server...
start "CarbonLens Frontend" cmd /c "npm run dev && pause"
cd ..

timeout /t 3 /nobreak >nul
echo Web frontend started at http://localhost:3000

:finish
echo.
echo ======================================
echo Startup completed!
echo ======================================
echo Mobile App: npm run start (in project root)
echo Web App: http://localhost:3000
echo Backend API: http://localhost:3001
echo Health Check: http://localhost:3001/health
echo ======================================
echo.
echo Press any key to exit...
pause >nul 