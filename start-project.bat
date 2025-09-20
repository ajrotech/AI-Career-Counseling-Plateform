@echo off
echo ====================================
echo Career Counseling Platform Startup
echo ====================================

echo.
echo Checking for existing processes...

echo Killing any existing backend processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    if not "%%a"=="0" (
        echo Terminating process %%a
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo Killing any existing frontend processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo Terminating process %%a
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo.
echo Starting Career Counseling Platform...

echo Starting Backend API on port 3001...
start "Backend API" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend on port 3000...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ====================================
echo Platform is starting up!
echo ====================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo API Docs: http://localhost:3001/api/docs
echo ====================================

pause