@echo off
echo =====================================
echo   Starting Career Counseling Platform
echo =====================================
echo.

echo This will start both frontend and backend servers...
echo.
echo Opening terminals...

start "Backend Server" cmd /k "cd backend && npm run start:dev"
timeout /t 2 /nobreak >nul

start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Servers starting...
echo - Backend: http://localhost:3001
echo - Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul