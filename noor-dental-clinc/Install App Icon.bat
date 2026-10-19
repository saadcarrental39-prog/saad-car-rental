@echo off
setlocal enabledelayedexpansion
title Noor Dental Clinic - Install Desktop Icon
cd /d "%~dp0"

echo ============================================
echo   Noor Dental Clinic - Desktop Icon Setup
echo ============================================
echo.
echo This will:
echo   1. Put a "Noor Dental Clinic" icon on the Desktop.
echo      Double-click it any time to open the app - no cmd window needed.
echo   2. Make the app start quietly by itself whenever this computer
echo      turns on, so it is always ready (works with or without internet -
echo      the clinic data itself never needs internet, only WhatsApp/Email do).
echo.
pause

set VBS=%TEMP%\ndc_shortcut.vbs

REM ---- 1. Desktop shortcut ----
(
echo Set oWS = WScript.CreateObject("WScript.Shell"^)
echo sLinkFile = oWS.SpecialFolders("Desktop"^) ^& "\Noor Dental Clinic.lnk"
echo Set oLink = oWS.CreateShortcut(sLinkFile^)
echo oLink.TargetPath = "%~dp0launch.vbs"
echo oLink.WorkingDirectory = "%~dp0"
echo oLink.IconLocation = "%~dp0assets\app.ico"
echo oLink.Description = "Noor Dental Clinic"
echo oLink.Save
) > "%VBS%"
cscript //nologo "%VBS%"
del "%VBS%"
echo [OK] Desktop icon created.

REM ---- 2. Auto-start on Windows login (also via the Startup folder) ----
(
echo Set oWS = WScript.CreateObject("WScript.Shell"^)
echo sLinkFile = oWS.SpecialFolders("Startup"^) ^& "\Noor Dental Clinic.lnk"
echo Set oLink = oWS.CreateShortcut(sLinkFile^)
echo oLink.TargetPath = "%~dp0launch.vbs"
echo oLink.WorkingDirectory = "%~dp0"
echo oLink.IconLocation = "%~dp0assets\app.ico"
echo oLink.Description = "Noor Dental Clinic (auto-start)"
echo oLink.Save
) > "%VBS%"
cscript //nologo "%VBS%"
del "%VBS%"
echo [OK] Auto-start on Windows login enabled.

echo.
echo ============================================
echo   All done!
echo ============================================
echo From now on: just double-click the "Noor Dental Clinic" icon on the
echo Desktop (or simply turn the computer on - it will start by itself).
echo You do NOT need start.bat or cmd anymore.
echo.
pause
