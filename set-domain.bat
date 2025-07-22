@echo off
echo Setting custom Vercel subdomain...
echo.
set /p DOMAIN="Enter desired subdomain (e.g., isai): "

echo.
echo Setting %DOMAIN%.vercel.app as your domain...
npx vercel alias set ai-knowledge-hub-fresh-651vpucx0-ofir-wienermans-projects.vercel.app %DOMAIN%.vercel.app --token=w7GKpO8kChx2iwePeHpgQCWT

echo.
echo Done! Your app will be available at: https://%DOMAIN%.vercel.app
pause