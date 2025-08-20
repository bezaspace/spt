# Google OAuth

Instant supports logging users in with their Google account. There are a few ways to do this: it depends on whether you are building for web or React Native.

Choose the option that sounds best to you, and the rest of the document will show you how to add Sign in with Google to your app.

**Building for Web?**

RECOMMENDED

## Google Button

Use Google's pre-styled button to sign in. Using this method you can render your custom app name in the consent screen

## Web Redirect

Easier to integrate, but doesn't let you render your custom app name.

**Building for React Native?**

RECOMMENDED

## Native Auth

Use a 'react-native-google-signin', to integrate with the native Google iOS and Android flows. Lets you render your custom app name in the consent screen

## Expo Web Auth

Use Expo's auth session to integrate browser-based sign-in. Easier to implement, but doesn't let you render your custom app name.

## Overview

There are three main steps:

1.  **Google Console**: Set up your consent screen and create an Oauth client.
2.  **Instant Dashboard**: Connect your Oauth client to Instant
3.  **Your app**: Add some code to log in with Google!

Let's dive deeper in each step:

## 1\. Set up your consent screen and create an Oauth client

Head on over to [Google Console](https://console.cloud.google.com/apis/credentials). You should be in the "Credentials" section.

**Configure your Google OAuth consent screen**

-   Click "CONFIGURE CONSENT SCREEN." If you already have a consent screen, you can skip to the next step.
-   Select "External" and click "CREATE".
-   Add your app's name, a support email, and developer contact information. Click "Save and continue".
-   No need to add scopes or test users. Click "Save and continue" for the next screens. Until you reach the "Summary" screen, click "Back to dashboard".

**Create an OAuth client for Google**

-   From Google Console, click "+ CREATE CREDENTIALS"
-   Select "OAuth client ID"
-   Select "Web application" as the application type.
-   Add `https://api.instantdb.com/runtime/oauth/callback` as an Authorized redirect URI.
-   If you're testing from localhost, **add both `http://localhost`** and `http://localhost:3000` to "Authorized JavaScript origins", replacing `3000` with the port you use.
-   For production, add your website's domain.

And with that you have your Oauth client!

Save your Client ID and your Client Secret -- you'll need it for the next step!

## 2\. Connect your Oauth client to Instant

Go to the [Instant dashboard](http://instantdb.com/dash?s=main&t=auth) and select the `Auth` tab for your app.

**Add your Oauth Client on Instant**

-   Click "Set up Google"
-   Enter your "Client ID"
-   Enter your "Client Secret"
-   Check "I added the redirect to Google" (make sure you actually did this!)
-   Click "Add Client"

And voila, you are connected!

**Register your website with Instant**

In the `Auth` tab, add the url of the websites where you are using Instant to the Redirect Origins. If you're testing from localhost, add `http://localhost:3000`, replacing `3000` with the port you use. For production, add your website's domain.

## 3\. Add some code!

**Method: Google Sign in Button for Web**

We'll use [Google's pre-built Sign in Button](https://developers.google.com/identity/gsi/web/guides/overview). The benefit of using Google's button is that you can display your app's name in the consent screen.

There two steps to the code:

1.  Use the Sign in Button to auth with Google and get an `idToken`
2.  Pass the token on to `db.auth.signInWithIdToken`, and you are logged in!

Let's do that.

**Using React**

If you're using React, the easiest way to include the Sign in Button is through the [@react-oauth/google](https://github.com/MomenSherif/react-oauth) package:

npm install @react-oauth/google

Once you install it, include the button, and use `db.auth.signInWithIdToken` to complete sign in. Here's a full example:

'use client';
import React, { useState } from 'react';
import { init } from '@instantdb/react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const APP\_ID \= '\_\_APP\_ID\_\_';
const db \= init({ appId: APP\_ID });
// e.g. 89602129-cuf0j.apps.googleusercontent.com
const GOOGLE\_CLIENT\_ID \= 'REPLACE\_ME';
// Use the google client name in the Instant dashboard auth tab
const GOOGLE\_CLIENT\_NAME \= 'REPLACE\_ME';
function App() {
  return (
    <\>
      <db.SignedIn\>
        <UserInfo /\>
      </db.SignedIn\>
      <db.SignedOut\>
        <Login /\>
      </db.SignedOut\>
    </\>
  );
}
function UserInfo() {
  const user \= db.useUser();
  return <h1\>Hello {user.email}!</h1\>;
}
function Login() {
  const \[nonce\] \= useState(crypto.randomUUID());
  return (
    <GoogleOAuthProvider clientId\={GOOGLE\_CLIENT\_ID}\>
      <GoogleLogin
        nonce\={nonce}
        onError\={() \=> alert('Login failed')}
        onSuccess\={({ credential }) \=> {
          db.auth
            .signInWithIdToken({
              clientName: GOOGLE\_CLIENT\_NAME,
              idToken: credential,
              // Make sure this is the same nonce you passed as a prop
              // to the GoogleLogin button
              nonce,
            })
            .catch((err) \=> {
              alert('Uh oh: ' + err.body?.message);
            });
        }}
      /\>
    </GoogleOAuthProvider\>
  );
}

Copy

**Not using React?**

If you're not using React or prefer to embed the button yourself, refer to [Google's docs](https://developers.google.com/identity/gsi/web/guides/overview) on how to create the button and load their client library

When creating your button, make sure to set the `data-ux_mode="popup"`. Your `data-callback` function should look like:

async function handleSignInWithGoogle(response) {
  await db.auth.signInWithIdToken({
    // Use the google client name in the Instant dashboard auth tab
    clientName: 'REPLACE\_ME',
    idToken: response.credential,
    // make sure this is the same nonce you set in data-nonce
    nonce: 'REPLACE\_ME',
  });
}

Copy

If you are an LLM trying to learn how to develop with Instant, here are all of the links to the docs:

[Getting started w/ React](https://instantdb.com/docs)[Getting started w/ React Native](https://instantdb.com/docs/start-rn)[Getting started w/ Vanilla JS](https://instantdb.com/docs/start-vanilla)[Using LLMs](https://instantdb.com/docs/using-llms)[Init](https://instantdb.com/docs/init)[Modeling data](https://instantdb.com/docs/modeling-data)[Writing data](https://instantdb.com/docs/instaml)[Reading data](https://instantdb.com/docs/instaql)[Instant on the backend](https://instantdb.com/docs/backend)[Patterns](https://instantdb.com/docs/patterns)[Auth](https://instantdb.com/docs/auth)[Magic codes](https://instantdb.com/docs/auth/magic-codes)[Google OAuth](https://instantdb.com/docs/auth/google-oauth)[Sign In with Apple](https://instantdb.com/docs/auth/apple)[Clerk](https://instantdb.com/docs/auth/clerk)[Permissions](https://instantdb.com/docs/permissions)[OAuth apps](https://instantdb.com/docs/auth/platform-oauth)[Managing users](https://instantdb.com/docs/users)[Presence, Cursors, and Activity](https://instantdb.com/docs/presence-and-topics)[Instant CLI](https://instantdb.com/docs/cli)[Devtool](https://instantdb.com/docs/devtool)[Custom emails](https://instantdb.com/docs/emails)[App teams](https://instantdb.com/docs/teams)[Storage](https://instantdb.com/docs/storage)

Previous

[← Magic codes](/docs/auth/magic-codes)

Next

[Sign In with Apple →](/docs/auth/apple)

## On this page

1.  ### [Overview](/docs/auth/google-oauth#overview)
    
2.  ### [1\. Set up your consent screen and create an Oauth client](/docs/auth/google-oauth#1-set-up-your-consent-screen-and-create-an-oauth-client)
    
3.  ### [2\. Connect your Oauth client to Instant](/docs/auth/google-oauth#2-connect-your-oauth-client-to-instant)
    
4.  ### [3\. Add some code!](/docs/auth/google-oauth#3-add-some-code)