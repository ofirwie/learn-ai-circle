# ISAI AI Knowledge Hub - Deployment Guide

## Overview
Complete ISAI AI Knowledge Hub with authentication, user management, and multi-content type system.

## Features
- ✅ User authentication with registration codes
- ✅ Entity-based user groups and permissions
- ✅ Professional ISAI branding with blue theme
- ✅ English-only (simplified from multi-language)
- ✅ Complete database schema with RLS
- ✅ Responsive design
- ✅ Modern React + TypeScript + Vite setup

## Environment Setup

### 1. Environment Variables
Create `.env.local` in the root directory:

```bash
VITE_SUPABASE_URL=https://ilotcwtcnlihoprxcdzp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_NAME="ISAI AI Knowledge Hub"
VITE_DEFAULT_LANGUAGE="en"
VITE_SUPPORTED_LANGUAGES="en"
```

### 2. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the complete schema from `database-setup.sql`
4. This creates all tables, RLS policies, and sample data

### 3. Test Registration Code
Use the demo registration code: `DEMO2024` to create test accounts.

## Deployment to Render

### Option 1: Deploy Current Project
1. Push your code to GitHub
2. Connect Render to your repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Render dashboard

### Option 2: Deploy from Git
```bash
# Build the project
npm run build

# The dist/ folder contains the deployable files
```

## Project Structure
```
src/
├── components/
│   ├── auth/          # Login & Signup forms
│   ├── Dashboard/     # Existing dashboard components
│   └── Article/       # Existing article components
├── store/
│   └── authStore.ts   # Zustand authentication store
├── types/
│   ├── content.ts     # Content type definitions
│   └── database.types.ts  # Supabase database types
├── services/
│   └── supabase.ts    # Supabase client configuration
├── index.css          # Complete styling with ISAI theme
└── App.tsx            # Main application with auth flow
```

## Authentication Flow
1. **Unauthenticated**: Shows login/signup forms
2. **Registration**: Requires valid registration code
3. **Authenticated**: Shows full ISAI interface with navigation

## Key Features
- **Entity System**: Organizations can have multiple user groups
- **Registration Codes**: Secure signup with entity/group assignment
- **Content Types**: 7 types (guides, prompts, prefixes, tools, news, videos, articles)
- **Forum System**: Categories, posts, and comments
- **Analytics**: User progress tracking and engagement metrics
- **Responsive**: Works on desktop and mobile

## Default Demo Account
- Registration Code: `DEMO2024`
- Entity: Demo Organization
- Group: Users

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: Supabase Auth with custom user profiles
- **Database**: PostgreSQL with Row Level Security
- **State Management**: Zustand
- **Icons**: Lucide React
- **Styling**: Custom CSS with CSS Variables

## Next Steps
1. Run the database setup SQL in Supabase
2. Update environment variables with your Supabase keys
3. Test locally with `npm run dev`
4. Deploy to Render or your preferred platform

The application is now a complete, professional AI Knowledge Hub ready for production use!