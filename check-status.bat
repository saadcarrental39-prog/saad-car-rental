@echo off
setlocal EnableExtensions EnableDelayedExpansion
title SAAD CAR RENTAL - Git Status
color 0B
cd /d "%~dp0"
cls
echo ============================================================
echo    SAAD CAR RENTAL SERVICES  -  GIT STATUS
echo ============================================================
echo  Folder : %CD%
echo.
where git >nul 2>&1
if errorlevel 1 set "ERR=Git install nahi hai. https://git-scm.com/download/win" & goto :fail
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 set "ERR=Yeh folder Git repository nahi hai." & goto :fail
set "BRANCH="
for /f "delims=" %%b in ('git branch --show-current') do set "BRANCH=%%b"
echo  CURRENT BRANCH : !BRANCH!
echo.
echo ------------------------------------------------------------
echo  LAST 5 COMMITS
echo ------------------------------------------------------------
git --no-pager log -5 --pretty=format:"  %%h  %%ad  %%s" --date=short
echo.
echo.
echo ------------------------------------------------------------
echo  GIT STATUS
echo ------------------------------------------------------------
git --no-pager status -sb
echo.
set "N=0"
for /f "delims=" %%l in ('git status --porcelain') do set /a N+=1
set "AHEAD=0"
git rev-parse --abbrev-ref "@{u}" >nul 2>&1
if not errorlevel 1 for /f %%a in ('git rev-list --count "@{u}..HEAD"') do set "AHEAD=%%a"
echo ============================================================
if "!N!"=="0" (
  color 0A
  echo  OK  Koi uncommitted change nahi, sab commit hai.
) else (
  color 0E
  echo  WARNING  UNCOMMITTED CHANGES: !N! file^(s^) badli hui hain
  echo      Live karne ke liye update.bat chalayein.
)
if not "!AHEAD!"=="0" (
  color 0E
  echo  WARNING  !AHEAD! commit^(s^) abhi GitHub par push nahi hue. update.bat chalayein.
)
echo ============================================================
goto :end
:fail
color 0C
echo  X  ERROR: !ERR!
:end
echo.
echo Press any key to exit...
pause >nul
