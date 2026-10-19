@echo off
setlocal enabledelayedexpansion
title Noor Dental Clinic - Server
cd /d "%~dp0"

echo ============================================
echo   Noor Dental Clinic Management System
echo ============================================
echo.

REM ---- 1. Make sure Node.js is installed ----
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found on this computer.
  echo.
  echo Please install Node.js from https://nodejs.org and then
  echo double-click this file again.
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v') do set NODE_VERSION=%%v
for /f "delims=" %%v in ('npm -v') do set NPM_VERSION=%%v
echo Detected Node.js %NODE_VERSION%  (npm %NPM_VERSION%)
echo.

REM ---- 2. Install dependencies only if needed ----
if not exist "node_modules" (
  echo Installing dependencies for the first time, please wait...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] "npm install" failed. See the messages above for details.
    echo.
    pause
    exit /b 1
  )
) else (
  echo Dependencies already installed - skipping npm install.
)
echo.

REM ---- 3. Start the server, keep window open if it exits/crashes ----
:run
echo Starting server...
echo.

REM Open as a clean app window shortly after launch (server takes a moment to bind the port)
start "" wscript //nologo "%~dp0open-app-window.vbs" 2

call npm start
set EXITCODE=%ERRORLEVEL%

if %EXITCODE%==75 (
  echo.
  echo Restarting after restore...
  goto run
)

if not %EXITCODE%==0 (
  echo.
  echo [ERROR] The server stopped unexpectedly (exit code %EXITCODE%).
  echo Scroll up to see the actual error message from Node.js.
  echo.
)

echo.
echo Server stopped. Press any key to close this window.
pause >nul
