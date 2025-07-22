#!/bin/bash

echo "🚀 AI Knowledge Hub - Quick Deploy Script"
echo "========================================"
echo ""
echo "Choose deployment method:"
echo "1) Vercel (Recommended - Instant deploy)"
echo "2) Netlify Drop (Manual - Drag & drop)"
echo "3) GitHub Pages (Automatic - Via Git)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "📦 Deploying to Vercel..."
    npx vercel --prod
    ;;
  2)
    echo "📦 Building for Netlify..."
    npm run build
    echo ""
    echo "✅ Build complete!"
    echo "👉 Now go to https://app.netlify.com/drop"
    echo "👉 Drag the 'dist' folder to deploy"
    echo ""
    read -p "Press Enter to open Netlify Drop..." 
    start https://app.netlify.com/drop
    ;;
  3)
    echo "📦 Deploying to GitHub Pages..."
    npm run build
    git add .
    git commit -m "Deploy to GitHub Pages 🚀"
    git push
    echo ""
    echo "✅ Pushed to GitHub!"
    echo "👉 Enable GitHub Pages in repo settings"
    echo "👉 Select 'gh-pages' branch"
    ;;
  *)
    echo "Invalid choice"
    ;;
esac