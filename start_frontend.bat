@echo off
echo Starting CMMS MADAMPE MILLS Frontend
echo =================================

echo Installing frontend dependencies...
cd frontend
npm install --legacy-peer-deps

echo Starting frontend development server...
npm start

pause