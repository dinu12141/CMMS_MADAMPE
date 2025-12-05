@echo off
REM Start CMMS Backend Services with Firebase
REM This script starts the Python backend server with Firebase

echo Starting CMMS MADAMPE MILLS Backend Services with Firebase
echo ========================================

echo Starting Backend Server...
cd backend

echo Checking Python dependencies...
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo Failed to install dependencies. Please install manually:
        echo pip install -r requirements.txt
        echo.
        echo Press any key to continue anyway...
        pause >nul
    )
)

echo Starting Python backend server on http://localhost:8000
echo Press Ctrl+C to stop the server
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000

echo Press any key to exit...
pause
