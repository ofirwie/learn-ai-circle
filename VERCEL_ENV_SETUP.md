# 🚨 URGENT: Fix API Error - Vercel Environment Variables Missing

## Root Cause
The login system and API are failing because the `VITE_SUPABASE_ANON_KEY` environment variable is not configured in Vercel.

## Fix Steps

### 1. Get Supabase Keys
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ilotcwtcnlihoprxcdzp/settings/api)
2. Copy the **anon public** key

### 2. Add to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `ai-knowledge-hub-fresh`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
VITE_SUPABASE_URL=https://ilotcwtcnlihoprxcdzp.supabase.co
VITE_SUPABASE_ANON_KEY=[paste your anon key here]
```

### 3. Redeploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or trigger a new deployment by pushing code

## Current Error
```javascript
// This is currently failing:
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
// Because VITE_SUPABASE_ANON_KEY is undefined in Vercel
```

## Test After Fix
Once environment variables are added, the login system should work:
- "Free Registration" button should open modal
- User can login/signup successfully  
- "Welcome back, [username]" should appear after login
- "Logout" button should be visible when logged in

## Admin Test User
- **Email**: ofir.wienerman@gmail.com
- **Registration Code**: Churro393$