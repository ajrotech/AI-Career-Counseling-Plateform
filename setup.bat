@echo off
echo =====================================
echo   Career Counseling Platform Setup
echo =====================================
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo =====================================
echo   Setup Complete!
echo =====================================
echo.
echo To start the application:
echo 1. Open two terminals
echo 2. Terminal 1: cd backend ^&^& npm run start:dev
echo 3. Terminal 2: cd frontend ^&^& npm run dev
echo.
echo Then visit:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo.
echo Press any key to exit...
pause >nul