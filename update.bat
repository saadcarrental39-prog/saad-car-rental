@echo off
rem Double-click: build + git commit (timestamp message) + git push -> Cloudflare deploys.
set "COMMIT_MSG="
call "%~dp0_update-core.bat"
