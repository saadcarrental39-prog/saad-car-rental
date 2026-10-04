@echo off
echo === MINHAJ WELDING - Install ===
echo (Internet chahiye, sirf pehli baar. 5-10 minute lag sakte hain)
set PUPPETEER_SKIP_DOWNLOAD=1
cd /d "%~dp0backend"
call npm install
if errorlevel 1 goto fail
if not exist .env copy .env.example .env
call npm run seed
if errorlevel 1 goto fail
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 goto fail
echo.
echo Install complete. Ab start.bat chalayen.
pause
exit /b 0
:fail
echo.
echo *** INSTALL FAIL HO GAYA - upar wala error padhein ya mujhe bhejein ***
pause
exit /b 1
