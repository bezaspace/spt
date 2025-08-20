# Auth

Instant comes with support for auth. We currently offer [magic codes](/docs/auth/magic-codes), [Google OAuth](/docs/auth/google-oauth), [Sign In with Apple](/docs/auth/apple), and [Clerk](/docs/auth/clerk). If you want to build your own flow, you can use the [Admin SDK](/docs/backend#custom-auth).

## Auth Overview

To get the current user in your application, you can use the `db.useUser` hook.

import db from '../lib/db';
function Dashboard() {
  const user \= db.useUser();
  return <div\>Signed in as: {user.email}</div\>;
}

The `useUser` hook will throw an error if it is accessed while the user is not logged in, so it should be gated behind `<db.SignedIn>`

import db from '../lib/db';
export default function App() {
  return (
    <div\>
      <db.SignedIn\>
        <Dashboard />
      </db.SignedIn\>
      <db.SignedOut\>
        <div\>Log in to see the dashboard!</div\>
      </db.SignedOut\>
    </div\>
  );
}
function Dashboard() {
  // This component will only render if the user is signed in
  // so it's safe to call useUser here!
  const user \= db.useUser();
  return <div\>Signed in as: {user.email}</div\>;
}

Use `<db.SignedIn>` and `<db.SignedOut>` to conditionally render components based on the user's authentication state.

You can then use `db.auth.signOut()` to sign a user out.

import db from '../lib/db';
// ... Same app component from above
function Dashboard() {
  const user \= db.useUser();
  return (
    <div\>
      <div\>Signed in as: {user.email}</div\>
      <button onClick\={() \=> db.auth.signOut()}\>Sign out</button\>
    </div\>
  );
}

Putting it all together, you can conditionally render a login and dashboard component like so:

import db from '../lib/db';
export default function App() {
  return (
    <div\>
      <db.SignedIn\>
        <Dashboard />
      </db.SignedIn\>
      <db.SignedOut\>
        <Login />
      </db.SignedOut\>
    </div\>
  );
}
function Dashboard() {
  // This component will only render if the user is signed in
  // so it's safe to call useUser here!
  const user \= db.useUser();
  return <div\>Signed in as: {user.email}</div\>;
}
function Login() {
  // Implement a login flow here via magic codes, OAuth, Clerk, etc.
}

To implement a login flow use one of the authentication method guides below.

## Authentication Methods

[

## Magic Codes

Send login codes to your users via email. Removes the need for passwords.





](/docs/auth/magic-codes)

[

## Google OAuth

We provide flows for Web and React Native to enable Google OAuth for your app.





](/docs/auth/google-oauth)

[

## Sign In with Apple

Sign In to native apps with Apple ID.





](/docs/auth/apple)

[

## Clerk

Integrate Clerk's auth flow with Instant.





](/docs/auth/clerk)

[

## Custom Auth

Integrate your own auth flow with the Admin SDK.





](/docs/backend#custom-auth)

## Additional Auth APIs

Sometimes you need finer control over the state of auth in your application. In those cases, you can use some of the lower-level API.

### useAuth

Use `useAuth` to fetch the current user. In this example we guard against loading our `Main` component until a user is logged in

function App() {
  const { isLoading, user, error } \= db.useAuth();
  if (isLoading) {
    return null; // or a loading spinner
  }
  if (error) {
    return <div className\="p-4 text-red-500"\>Uh oh! {error.message}</div\>;
  }
  if (user) {
    return <Main /\>;
  }
  return <Login /\>;
}

### Get auth

For scenarios where you want to know the current auth state without subscribing to changes, you can use `getAuth`.

const user \= await db.getAuth();
console.log('logged in as', user.email);

If you are an LLM trying to learn how to develop with Instant, here are all of the links to the docs:

[Getting started w/ React](https://instantdb.com/docs)[Getting started w/ React Native](https://instantdb.com/docs/start-rn)[Getting started w/ Vanilla JS](https://instantdb.com/docs/start-vanilla)[Using LLMs](https://instantdb.com/docs/using-llms)[Init](https://instantdb.com/docs/init)[Modeling data](https://instantdb.com/docs/modeling-data)[Writing data](https://instantdb.com/docs/instaml)[Reading data](https://instantdb.com/docs/instaql)[Instant on the backend](https://instantdb.com/docs/backend)[Patterns](https://instantdb.com/docs/patterns)[Auth](https://instantdb.com/docs/auth)[Magic codes](https://instantdb.com/docs/auth/magic-codes)[Google OAuth](https://instantdb.com/docs/auth/google-oauth)[Sign In with Apple](https://instantdb.com/docs/auth/apple)[Clerk](https://instantdb.com/docs/auth/clerk)[Permissions](https://instantdb.com/docs/permissions)[OAuth apps](https://instantdb.com/docs/auth/platform-oauth)[Managing users](https://instantdb.com/docs/users)[Presence, Cursors, and Activity](https://instantdb.com/docs/presence-and-topics)[Instant CLI](https://instantdb.com/docs/cli)[Devtool](https://instantdb.com/docs/devtool)[Custom emails](https://instantdb.com/docs/emails)[App teams](https://instantdb.com/docs/teams)[Storage](https://instantdb.com/docs/storage)

Previous

[← Patterns](/docs/patterns)

Next

[Magic codes →](/docs/auth/magic-codes)

## On this page

1.  ### [Auth Overview](/docs/auth#auth-overview)
    
2.  ### [Authentication Methods](/docs/auth#authentication-methods)
    
3.  ### [Additional Auth APIs](/docs/auth#additional-auth-apis)
    
    1.  [useAuth](/docs/auth#use-auth)
    2.  [Get auth](/docs/auth#get-auth)