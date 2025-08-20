# InstantDB with Google OAuth Setup Guide

This guide will help you set up InstantDB as your backend database with Google OAuth authentication.

## Prerequisites

- A Google account for OAuth setup
- Node.js and npm installed
- A Next.js project (this setup assumes you're using Next.js)

## Step 1: Set up Google OAuth

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen:
   - User Type: External
   - Add your app name and support email
   - Add developer contact information
   - Skip scopes and test users for now
6. Create OAuth client ID:
   - Application type: Web application
   - Name: Your app name
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production domain
   - Authorized redirect URIs:
     - `https://api.instantdb.com/runtime/oauth/callback`

### 1.2 Get your credentials
- Copy the **Client ID** and **Client Secret**
- You'll need these for the next step

## Step 2: Set up InstantDB

### 2.1 Create InstantDB Account
1. Go to [InstantDB Dashboard](https://instantdb.com/dash)
2. Sign up for an account
3. Create a new app

### 2.2 Configure Google OAuth in InstantDB
1. In your InstantDB dashboard, go to the **Auth** tab
2. Click "Set up Google"
3. Enter your **Client ID** and **Client Secret** from Step 1.2
4. Check "I added the redirect to Google"
5. Add your redirect origins:
   - `http://localhost:3000` (for development)
   - Your production domain
6. Click "Add Client"

### 2.3 Get your App ID
- Copy your **APP_ID** from the dashboard
- You'll need this for your environment variables

## Step 3: Configure Your Application

### 3.1 Environment Variables
Update your `.env.local` file with your actual credentials:

```env
NEXT_PUBLIC_INSTANT_APP_ID=your_actual_app_id_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
NEXT_PUBLIC_GOOGLE_CLIENT_NAME=your_google_client_name_here
```

### 3.2 Push Schema and Permissions
Run these commands to push your schema and permissions to InstantDB:

```bash
# Push the schema
npx instant-cli push schema

# Push the permissions
npx instant-cli push perms
```

## Step 4: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. You should see the login page with Google OAuth button

4. Click the button and complete the OAuth flow

5. After successful authentication, you should be redirected to the dashboard

## File Structure

```
├── lib/
│   └── db.ts                 # InstantDB configuration
├── components/
│   ├── GoogleLogin.tsx       # Google OAuth component
│   ├── LoginPage.tsx         # Login page UI
│   └── Dashboard.tsx         # User dashboard
├── instant.schema.ts         # Database schema
├── instant.perms.ts          # Database permissions
├── .env.local               # Environment variables
└── app/
    └── page.tsx             # Main app with auth flow
```

## Features Included

- ✅ Google OAuth authentication
- ✅ User profile creation with Google data
- ✅ Protected routes (dashboard only accessible when logged in)
- ✅ Project creation and management
- ✅ Real-time data synchronization
- ✅ TypeScript support with schema validation
- ✅ Row-level security with permissions

## Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check that your Google Client ID is correct and the origins/redirect URIs are properly configured.

2. **"Auth failed" error**: Ensure your InstantDB App ID is correct and you've pushed your schema and permissions.

3. **Login succeeds but no profile data**: Check that the profile creation transaction is working correctly in the GoogleLogin component.

4. **TypeScript errors**: Make sure you've pushed your schema to InstantDB and the types are being generated correctly.

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded correctly
3. Test the InstantDB connection in the dashboard
4. Check that Google OAuth is properly configured in both Google Console and InstantDB

## Next Steps

- Customize the dashboard UI to match your needs
- Add more features like project collaboration, comments, etc.
- Set up production deployment
- Configure additional OAuth providers if needed
- Add email notifications or other integrations

## Support

- [InstantDB Documentation](https://instantdb.com/docs)
- [InstantDB Discord](https://discord.com/invite/VU53p7uQcE)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)