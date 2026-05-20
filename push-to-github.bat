@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

set GIT=
for %%G in (
  "C:\Program Files\Git\cmd\git.exe"
  "C:\Program Files\Git\bin\git.exe"
  "C:\Program Files (x86)\Git\cmd\git.exe"
) do if exist %%G set GIT=%%~G

if not defined GIT (
  where git >nul 2>&1 && set GIT=git
)

if not defined GIT (
  echo Git not found. Install Git for Windows: https://git-scm.com/download/win
  echo Then run this script again, or use Git Bash.
  exit /b 1
)

set LOG=%~dp0push-log.txt
echo === Push to Mohamedgougam-arch/AI-Usecases-Arena === > "%LOG%"
echo Using: !GIT! >> "%LOG%"

if not exist .git "!GIT!" init >> "%LOG%" 2>&1
"!GIT!" add -A >> "%LOG%" 2>&1
"!GIT!" diff --cached --quiet
if errorlevel 1 (
  "!GIT!" commit -m "feat: add AI Use Cases Arena web app" -m "Next.js app for CGI to submit, vote, and prioritize AI use cases with gamification, insights, and Supabase-ready architecture." >> "%LOG%" 2>&1
) else (
  echo Nothing new to commit. >> "%LOG%"
)

"!GIT!" branch -M main >> "%LOG%" 2>&1
"!GIT!" remote remove origin 2>nul
"!GIT!" remote add origin https://github.com/Mohamedgougam-arch/AI-Usecases-Arena.git >> "%LOG%" 2>&1
"!GIT!" push -u origin main >> "%LOG%" 2>&1

if errorlevel 1 (
  echo.
  echo Push failed. See push-log.txt
  echo Sign in with: gh auth login
  echo Or use a GitHub Personal Access Token when prompted for password.
  type "%LOG%"
  exit /b 1
)

echo.
echo Success! https://github.com/Mohamedgougam-arch/AI-Usecases-Arena
exit /b 0
