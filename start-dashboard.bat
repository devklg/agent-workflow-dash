@echo off
echo ========================================
echo  Prometheus Agent Dashboard - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] Node.js detected
echo.

REM Navigate to client directory
cd client

REM Install dependencies
echo Installing dependencies...
call npm install

echo.
echo Copying Claude Dashboard components...
call npm run copy-claude-components

echo.
echo ========================================
echo  Setup complete!
echo ========================================
echo.
echo Starting the dashboard...
echo Dashboard will be available at http://localhost:3000
echo.

REM Start the application
call npm start

pause