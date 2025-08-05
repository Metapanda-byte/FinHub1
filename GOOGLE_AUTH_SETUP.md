# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for FinHub using Supabase.

## Prerequisites

- A Supabase project
- A Google Cloud Console account
- Access to your project's environment variables

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" user type
     - Fill in the required fields (app name, support email, etc.)
     - Add your domain to authorized domains
     - Save and continue

5. For the OAuth client ID:
   - Application type: "Web application"
   - Name: "FinHub Auth" (or your preferred name)
   - Authorized redirect URIs, add:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
   - Click "Create"

6. Save your credentials:
   - Client ID: `[YOUR_CLIENT_ID]`
   - Client Secret: `[YOUR_CLIENT_SECRET]`

## Step 2: Supabase Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" in the list and enable it
5. Enter your Google OAuth credentials:
   - Client ID: Paste the Client ID from Google Cloud Console
   - Client Secret: Paste the Client Secret from Google Cloud Console
6. Click "Save"

## Step 3: Environment Variables

Ensure your `.env.local` file includes:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

## Step 4: Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Click the "Sign In" button in your app
3. Select "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app and logged in

## Troubleshooting

### Common Issues

1. **Redirect URI mismatch error**
   - Ensure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL
   - Check for trailing slashes or protocol differences (http vs https)

2. **401 Unauthorized error**
   - Verify your Client ID and Client Secret are correctly entered in Supabase
   - Ensure the Google+ API is enabled in Google Cloud Console

3. **User profile not created**
   - Check that the database trigger for creating user profiles is active
   - Verify the `handle_new_user()` function exists in your database

### Security Best Practices

1. **Never commit credentials**
   - Keep your `.env.local` file in `.gitignore`
   - Use environment variables in production

2. **Restrict OAuth origins**
   - In production, only allow your production domain in Google Cloud Console
   - Remove localhost URLs from authorized redirect URIs in production

3. **Enable additional security**
   - Consider enabling 2FA for Google accounts
   - Use Supabase Row Level Security (RLS) policies
   - Implement proper session management

## Additional Features

### Customizing User Data

The auth system automatically captures:
- Email address
- Full name (if available)
- Profile picture URL (stored in `user_metadata.avatar_url`)

### Handling Different OAuth Providers

The auth system is designed to easily add more providers:
1. Enable the provider in Supabase Dashboard
2. Add a button in the auth modal
3. Call `signInWithProvider('provider-name')`

Supported providers include:
- GitHub
- GitLab  
- Bitbucket
- Azure (Microsoft)
- Discord
- Facebook
- And many more...

## Next Steps

1. Set up proper error handling for failed authentications
2. Implement user profile pages
3. Add role-based access control if needed
4. Configure email templates for magic link authentication 