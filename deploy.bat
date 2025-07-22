@echo off
echo 🚀 AI Knowledge Hub - Quick Deploy Script
echo ========================================
echo.
echo Choose deployment method:
echo 1) Vercel (Recommended - Instant deploy)
echo 2) Netlify Drop (Manual - Drag and drop)
echo 3) Surge.sh (Instant - No login required)
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo 📦 Deploying to Vercel...
    call npx vercel --prod
) else if "%choice%"=="2" (
    echo 📦 Building for Netlify...
    call npm run build
    echo.
    echo ✅ Build complete!
    echo 👉 Now go to https://app.netlify.com/drop
    echo 👉 Drag the 'dist' folder to deploy
    echo.
    pause
    start https://app.netlify.com/drop
) else if "%choice%"=="3" (
    echo 📦 Deploying to Surge.sh...
    call npm run build
    echo.
    call npx surge ./dist ai-knowledge-hub.surge.sh
) else (
    echo Invalid choice
)

pause