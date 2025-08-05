# Quick Start: Authentication Setup

## Why the Login Button Isn't Working

The login button requires Supabase to be configured. Here's how to set it up:

## Step 1: Create Your .env.local File

Create a file named `.env.local` in the project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Set Up Google Authentication (Optional)

Follow the detailed guide in `GOOGLE_AUTH_SETUP.md` to enable Google sign-in.

## Step 4: Restart Your Development Server

```bash
npm run dev
```

## What You'll See

Once configured:
- Click "Sign In" button → Opens authentication modal
- Sign up with email/password or Google
- After login → User avatar appears in header
- Protected routes will be accessible

## Troubleshooting

### "Missing Supabase environment variables" Error
- Make sure `.env.local` file exists
- Check that both environment variables are set
- Restart the development server after adding variables

### Google Sign-In Not Working
- Ensure Google provider is enabled in Supabase Dashboard
- Check that redirect URLs are correctly configured
- See `GOOGLE_AUTH_SETUP.md` for detailed instructions

### Need Help?
Check the browser console for specific error messages. The authentication system provides detailed error logging to help diagnose issues. 