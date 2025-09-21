@echo off
echo ========================================
echo  GitHub Repository Setup Instructions
echo ========================================
echo.
echo Your repository is ready to upload! Follow these steps:
echo.
echo 1. Go to https://github.com/new
echo 2. Set Repository name: career-counseling-platform
echo 3. Set Description: AI-Powered Career Counseling Platform - Complete solution for students and job seekers with career assessments, mentorship marketplace, and market insights. Built with Next.js 14 ^& NestJS for PEC Hackathon.
echo 4. Set to PUBLIC (recommended for hackathon visibility)
echo 5. DO NOT check any of these boxes:
echo    - Add a README file
echo    - Add .gitignore
echo    - Choose a license
echo 6. Click "Create repository"
echo.
echo After creating the repository on GitHub:
echo 7. Come back to this terminal
echo 8. Press any key to continue...
pause
echo.
echo ========================================
echo  Pushing to GitHub...
echo ========================================
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo  SUCCESS! Repository uploaded!
    echo ========================================
    echo.
    echo Your repository is now available at:
    echo https://github.com/ajrotech/career-counseling-platform
    echo.
    echo What's included:
    echo - Enhanced README.md with professional presentation
    echo - MIT License for open source compliance
    echo - Complete .env.example with all configurations
    echo - Professional package.json with monorepo scripts
    echo - Assets directory for screenshots and logos
    echo - Testing framework documentation
    echo - Production-ready Docker configuration
    echo - Deployment scripts for development and production
    echo.
    echo Your Career Counseling Platform is ready for the PEC Hackathon!
) else (
    echo ========================================
    echo  Push failed. Please check:
    echo ========================================
    echo 1. Repository was created on GitHub
    echo 2. Repository name is exactly: career-counseling-platform
    echo 3. You have push access to the repository
    echo.
    echo Try running: git push -u origin main
)
echo.
pause