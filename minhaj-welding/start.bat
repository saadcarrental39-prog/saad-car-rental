@echo off
echo === MINHAJ WELDING - Start ===
if not exist backend\node_modules (echo Pehle install.bat chalayen. & pause & exit /b)
if not exist backend\.env copy backend\.env.example backend\.env
start "MW Backend" cmd /k "cd backend && npm start"
start "MW Frontend" cmd /k "cd frontend && npm run dev"
echo Backend start ho raha hai, 8 second intezar...
timeout /t 8 >nul
start http://localhost:5173
echo.
echo Agar login par "Server se connection nahi ho raha" aaye to MW Backend wali window check karein.
