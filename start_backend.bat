@echo off
REM Start CMMS Backend Services
REM This script starts MongoDB and the Python backend server

echo Starting CMMS MADAMPE MILLS Backend Services
echo ========================================

echo Checking if MongoDB is installed...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not installed or not in PATH.
    echo.
    echo Options:
    echo 1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
    echo 2. Download and run MongoDB Community Server locally
    echo 3. Continue with demo data only (application will work but data won't persist)
    echo.
    echo Press any key to continue with demo data only...
    pause >nul
    goto start_backend
)

echo Creating data directories if they don't exist...
if not exist "%cd%\data\db" mkdir "%cd%\data\db"
if not exist "%cd%\data\log" mkdir "%cd%\data\log"

echo Starting MongoDB...
start "MongoDB" mongod --dbpath="%cd%\data\db" --logpath="%cd%\data\log\mongodb.log" --logappend

timeout /t 5 /nobreak >nul

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

goto end

:start_backend
echo Starting Backend Server without MongoDB...
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
echo Note: Application will use demo data since MongoDB is not available
echo Press Ctrl+C to stop the server
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000

echo Press any key to exit...
pause

:end