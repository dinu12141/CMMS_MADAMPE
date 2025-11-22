@echo off
echo Starting CMMS MADAMPE MILLS Backend Services
echo ========================================

echo Checking if MongoDB is installed...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not installed or not in PATH.
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    echo Or download and run MongoDB Community Server locally.
    echo.
    echo Press any key to continue with mock data only...
    pause >nul
    exit /b
)

echo Creating data directories if they don't exist...
if not exist "data\db" mkdir "data\db"
if not exist "data\log" mkdir "data\log"

echo Starting MongoDB...
start "MongoDB" mongod --dbpath="%cd%\data\db" --logpath="%cd%\data\log\mongodb.log" --logappend

timeout /t 5 /nobreak >nul

echo Starting Backend Server...
cd backend
echo Make sure to install Python dependencies first:
echo pip install -r requirements.txt
echo.
python -m uvicorn server:app --reload

echo Press any key to exit...
pause