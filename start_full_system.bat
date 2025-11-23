@echo off
echo Starting CMMS System with MongoDB...

echo.
echo 1. Checking if MongoDB is installed...
mongod --version >nul 2>&1
if %errorlevel% == 0 (
    echo    MongoDB is installed
) else (
    echo    MongoDB is not installed or not in PATH
    echo    Please install MongoDB Community Edition from https://www.mongodb.com/try/download/community
    echo    Or start MongoDB manually before running this script
    echo.
    echo    Continuing anyway - the application will use demo data...
    timeout /t 5 >nul
)

echo.
echo 2. Starting backend server...
cd backend
start "Backend Server" cmd /k "python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000"
cd ..

echo.
echo 3. Starting frontend...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo Both servers are starting in separate command windows.
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:8000
echo.
echo If you see connection errors, make sure:
echo  - MongoDB is running
echo  - The backend server started successfully
echo  - No firewall is blocking the connections
echo.
pause