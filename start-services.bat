@echo off
echo Starting FMC Microservices...

echo Starting Backend API (Port 8000)...
start "Backend API" cmd /k "cd backend && python run.py"

echo Starting OnBoard App (Port 3000)...
timeout /t 3 >nul
start "OnBoard App" cmd /k "cd OnBoard && npm run dev"

echo Starting Photographers Dashboard (Port 3001)...
timeout /t 3 >nul
start "Photographers Dashboard" cmd /k "cd photographersDashBoard && npm run dev"

echo All services starting...
echo Backend API: http://localhost:8000
echo OnBoard App: http://localhost:3000
echo Photographers Dashboard: http://localhost:3001
pause
