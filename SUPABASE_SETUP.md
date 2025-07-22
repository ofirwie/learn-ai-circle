# Supabase Dashboard Configuration

## Fix Email Redirect URLs

To fix the email confirmation redirecting to localhost, update these settings in your Supabase dashboard:

### 1. Update Site URL
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ilotcwtcnlihoprxcdzp`
3. Go to **Authentication** → **URL Configuration**
4. Update **Site URL** from:
   - ❌ `http://localhost:3000`
   - ✅ `https://isai-hub.vercel.app`

### 2. Update Redirect URLs
In the same section, add these to **Redirect URLs**:
- `https://isai-hub.vercel.app`
- `https://isai-hub.vercel.app/*`
- `https://*.vercel.app` (for preview deployments)

### 3. Save Changes
Click **Save** at the bottom of the page.

## Email Templates (Optional)
If you want to customize email templates:
1. Go to **Authentication** → **Email Templates**
2. Make sure all templates use `{{ .SiteURL }}` for links
3. The confirm signup template should redirect to: `{{ .SiteURL }}#access_token={{ .Token }}&token_type=bearer&type=signup`

## Test the Fix
1. Create a new test user
2. Check that the confirmation email links to `https://isai-hub.vercel.app` instead of localhost
3. The app will automatically handle the authentication callback

## Current Admin User
- **Email**: ofir.wienerman@gmail.com
- **Status**: Created successfully
- **Group**: ISAI Admin - Administrators
- **Registration Code Used**: Churro393$