@echo off
title SAAD CAR RENTAL - Update with message
color 0B
cls
echo ============================================================
echo    SAAD CAR RENTAL SERVICES  -  UPDATE (custom message)
echo ============================================================
echo.
echo  Likhein ke aapne kya change kiya, jaise:
echo     Prado ke reviews add kiye
echo.
:ask
set "COMMIT_MSG="
set /p "COMMIT_MSG=Commit message: "
if not defined COMMIT_MSG echo  Message khali nahi ho sakta, dobara likhein. & goto :ask
call "%~dp0_update-core.bat"
