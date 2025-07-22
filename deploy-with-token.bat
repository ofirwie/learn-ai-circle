@echo off
echo Vercel Deploy Script
echo ===================
echo.
set /p VERCEL_TOKEN="Paste your Vercel token here: "

echo.
echo Deploying to Vercel...
set VERCEL_TOKEN=%VERCEL_TOKEN%
npx vercel --prod --yes --token=%VERCEL_TOKEN%

pause