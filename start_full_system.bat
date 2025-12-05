@echo off
echo Starting CMMS System with Firebase...

echo.
echo 1. Starting backend server...
cd backend
start "Backend Server" cmd /k "python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000"
cd ..

echo.
echo 2. Starting frontend...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo Both servers are starting in separate command windows.
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:8000
echo.
echo The application is using Firebase Firestore for data storage.
echo.
pause