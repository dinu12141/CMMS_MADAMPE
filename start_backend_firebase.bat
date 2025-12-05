@echo off
REM Start CMMS Backend Services with Firebase
REM This script starts the Python backend server with Firebase

echo Starting CMMS MADAMPE MILLS Backend Services with Firebase
echo ========================================

cd backend

echo Starting Python backend server on http://localhost:8000
echo Press Ctrl+C to stop the server
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000

echo Press any key to exit...
pause