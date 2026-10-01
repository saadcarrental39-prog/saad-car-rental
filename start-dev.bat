@echo off
setlocal EnableExtensions
title SAAD CAR RENTAL - Local Test Server
color 0B
cd /d "%~dp0"
cls
echo ============================================================
echo    SAAD CAR RENTAL SERVICES  -  LOCAL TEST (DEV SERVER)
echo ============================================================
echo  Folder : %CD%
echo.
where node >nul 2>&1
if errorlevel 1 set "ERR=Node.js install nahi hai. https://nodejs.org se LTS install karein." & goto :fail
where npm >nul 2>&1
if errorlevel 1 set "ERR=npm nahi mila. Node.js dobara install karein." & goto :fail
if not exist "package.json" set "ERR=package.json nahi mila. Yeh file project folder mein honi chahiye." & goto :fail
if exist "node_modules\" goto :run
echo  Packages install ho rahe hain, sirf pehli baar...
call npm install
if errorlevel 1 set "ERR=npm install fail hua. Internet check karein." & goto :fail
:run
echo  Server start ho raha hai. Browser khud khulega: http://localhost:5173
echo  Band karne ke liye window ka X dabayein, ya Ctrl+C phir Y.
echo  Note: Local mein reviews sample data se dikhte hain, asli reviews live site par.
echo ------------------------------------------------------------
call npm run dev -- --port 5173 --strictPort --open
if errorlevel 1 set "ERR=Server start nahi hua. Agar port 5173 masroof hai to pehle purani dev window band karein." & goto :fail
color 0E
echo.
echo  Server band ho gaya.
goto :end
:fail
color 0C
echo.
echo ============================================================
echo    X   ERROR
echo ============================================================
echo  %ERR%
:end
echo.
echo Press any key to exit...
pause >nul
