@echo off
setlocal EnableExtensions EnableDelayedExpansion
title SAAD CAR RENTAL - Website Update
color 0B
cd /d "%~dp0"
if errorlevel 1 set "ERR=Project folder nahi mila: %~dp0" & goto :fail
set "STEP=0"
cls
echo ============================================================
echo    SAAD CAR RENTAL SERVICES  -  WEBSITE UPDATE
echo ============================================================
echo  Folder : %CD%
echo  Time   : %date% %time:~0,8%
echo ============================================================

rem ---------- STEP: tools check ----------
call :step "Node.js, npm aur Git check ho rahe hain"
where node >nul 2>&1
if errorlevel 1 set "ERR=Node.js install nahi hai. https://nodejs.org se LTS version install karein, computer restart karein, phir dobara chalayein." & goto :fail
where npm >nul 2>&1
if errorlevel 1 set "ERR=npm nahi mila. Node.js dobara install karein: https://nodejs.org" & goto :fail
where git >nul 2>&1
if errorlevel 1 set "ERR=Git install nahi hai. https://git-scm.com/download/win se install karein, phir dobara chalayein." & goto :fail
for /f "delims=" %%v in ('node -v') do set "NODEV=%%v"
for /f "delims=" %%v in ('git --version') do set "GITV=%%v"
echo  OK  Node !NODEV!  /  !GITV!
if not exist "package.json" set "ERR=package.json nahi mila. Yeh file D:\saad folder ke andar (package.json ke saath) rakhni hai." & goto :fail
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 set "ERR=Yeh folder Git repository nahi hai. README-UPDATE.md mein Troubleshooting dekhein." & goto :fail
git remote get-url origin >nul 2>&1
if errorlevel 1 set "ERR=GitHub remote (origin) set nahi hai. Command: git remote add origin https://github.com/saadcarrental39-prog/saad-car-rental.git" & goto :fail
set "BRANCH="
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
if "!BRANCH!"=="HEAD" set "ERR=Git detached HEAD par hai. Command chalayein: git checkout main" & goto :fail
if not defined BRANCH set "ERR=Git branch ka naam nahi mila. Kya kam se kam ek commit maujood hai?" & goto :fail
echo  OK  Branch: !BRANCH!
if not exist ".gitignore" (
  > ".gitignore" echo node_modules
  >> ".gitignore" echo dist
  >> ".gitignore" echo .env
  >> ".gitignore" echo .dev.vars
  >> ".gitignore" echo .wrangler
  echo  OK  .gitignore bana diya gaya, node_modules aur dist GitHub par nahi jayenge
)

rem ---------- STEP: packages ----------
if exist "node_modules\" goto :build
call :step "Packages install ho rahe hain, sirf pehli baar, thora time lagega"
call npm install
if errorlevel 1 set "ERR=npm install fail hua. Internet check karein. Phir folder mein node_modules delete karke dobara try karein." & goto :fail

rem ---------- STEP: build ----------
:build
call :step "Website build ho rahi hai: npm run build"
call npm run build
if errorlevel 1 set "ERR=BUILD FAIL HO GAYA. Upar wali error lines padhein, unmein file ka naam aur line number likha hota hai. Jab tak build theek nahi hota GitHub par kuch nahi jayega. Error Claude ko copy-paste kar dein." & goto :fail
if not exist "dist\index.html" set "ERR=Build ke baad dist\index.html nahi bani. Build output check karein." & goto :fail
echo.
echo  OK  Build kamyab

rem ---------- STEP: git add ----------
call :step "Changes Git mein add ho rahe hain: git add"
git add -A
if errorlevel 1 set "ERR=git add fail hua. Dusra Git program/window band karein ya .git\index.lock file delete karein." & goto :fail
set "CHANGES="
for /f "delims=" %%l in ('git status --porcelain') do set "CHANGES=1"
if defined CHANGES goto :commit

echo  Koi nayi change nahi mili.
git rev-parse --abbrev-ref "@{u}" >nul 2>&1
if errorlevel 1 goto :push
set "AHEAD=0"
for /f %%a in ('git rev-list --count "@{u}..HEAD"') do set "AHEAD=%%a"
if "!AHEAD!"=="0" goto :nothing
echo  Lekin !AHEAD! purane commit abhi GitHub par nahi gaye, woh push kiye ja rahe hain.
goto :push

rem ---------- STEP: commit ----------
:commit
call :step "Commit ban raha hai: git commit"
git config user.email >nul 2>&1
if errorlevel 1 set "ERR=Git ko aapka naam/email nahi pata. Ek baar yeh 2 commands chalayein: git config --global user.name YourName   aur   git config --global user.email you@example.com   (apna naam aur email likhein)" & goto :fail
if not defined COMMIT_MSG set "COMMIT_MSG=Update: %date% %time:~0,8%"
set "COMMIT_MSG=!COMMIT_MSG:"='!"
echo  Message: !COMMIT_MSG!
git commit -m "!COMMIT_MSG!"
if errorlevel 1 set "ERR=git commit fail hua. Upar ka Git message padhein." & goto :fail

rem ---------- STEP: push ----------
:push
call :step "GitHub par upload ho raha hai: git push"
git push -u origin "!BRANCH!"
if not errorlevel 1 goto :pushok
echo.
echo  GitHub par naye changes hain. Unhein khud merge kiya ja raha hai: git pull --rebase
git pull --rebase --autostash origin "!BRANCH!"
if errorlevel 1 (
  git rebase --abort >nul 2>&1
  goto :pushfail
)
git push -u origin "!BRANCH!"
if errorlevel 1 goto :pushfail
:pushok
for /f "delims=" %%c in ('git log -1 --pretty=format:"%%h  %%s"') do set "LAST=%%c"

color 0A
echo.
echo ============================================================
echo    SUCCESS  -  Update GitHub par chala gaya
echo ============================================================
echo  Commit : !LAST!
echo.
echo  Ab Cloudflare Pages khud deploy karega.
echo  2-3 minute baad website live ho jayegi.
echo  Progress dekhne ke liye: https://dash.cloudflare.com
echo  Pages ^> saad-car-rental ^> Deployments
echo ============================================================
set "RC=0"
goto :end

:nothing
color 0E
echo.
echo ============================================================
echo    KUCH UPDATE KARNE KO NAHI HAI
echo ============================================================
echo  Build theek hai aur GitHub par pehle se sab kuch maujood hai.
echo  Pehle code mein change karein, phir dobara chalayein.
echo ============================================================
set "RC=0"
goto :end

:pushfail
set "ERR=PUSH FAIL HO GAYA. Aam wajahein: (1) Internet nahi. (2) GitHub login/permission masla: Git Credential Manager ki login window aaye to sign in karein. (3) Error mein rejected ya non-fast-forward likha ho to GitHub par naye changes hain: pehle command chalayein  git pull --rebase  phir update dobara chalayein. Commit local computer par safe hai."
goto :fail

:fail
color 0C
echo.
echo ============================================================
echo    X   UPDATE FAIL HO GAYA   (Step !STEP!)
echo ============================================================
echo.
echo  !ERR!
echo.
echo  Kuch bhi GitHub par nahi gaya jab tak yeh theek na ho.
echo ============================================================
set "RC=1"
goto :end

:end
echo.
echo Press any key to exit...
pause >nul
exit /b %RC%

:step
set /a STEP+=1
echo.
echo ------------------------------------------------------------
echo  [STEP !STEP!]  %~1
echo ------------------------------------------------------------
exit /b 0
