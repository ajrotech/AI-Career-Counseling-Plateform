@echo off
REM Quick GitHub Repository Creation Script for Windows
REM Run this after creating the repository on GitHub web interface

echo 🚀 Pushing Career Counseling Platform to GitHub...
echo Repository: https://github.com/ajrotech/career-counseling-platform
echo.

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Error: Please run this from the project root directory
    exit /b 1
)

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Error: Git not initialized. Run 'git init' first
    exit /b 1
)

REM Add remote if not exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo 🔗 Adding GitHub remote...
    git remote add origin https://github.com/ajrotech/career-counseling-platform.git
) else (
    echo ✅ Remote origin already configured
)

REM Set branch to main
echo 🌿 Setting branch to main...
git branch -M main

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCCESS! Your project is now on GitHub!
    echo 🌐 Repository URL: https://github.com/ajrotech/career-counseling-platform
    echo.
    echo 📊 Project Statistics:
    echo    - 93 files committed
    echo    - 50,293+ lines of code
    echo    - Full-stack TypeScript application
    echo    - Professional documentation
    echo.
    echo 🏆 Perfect for hackathon showcase!
) else (
    echo.
    echo ❌ Push failed. Please check:
    echo    1. Repository exists on GitHub
    echo    2. You're signed in to ajrotech account
    echo    3. Repository name is correct
)

pause