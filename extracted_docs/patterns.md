# Patterns

Below are some common patterns for working with InstantDB. We'll add more patterns over time and if you have a pattern you'd like to share, please feel free to submit a PR for this page.

## You can expose your app id to the client.

Similar to Firebase, the app id is a unique identifier for your application. If you want to secure your data, you'll want to add [permissions](/docs/permissions) for the app.

## Restrict creating new attributes.

When your ready to lock down your schema, you can restrict creating a new attribute by adding this to your app's [permissions](/dash?t=perms)

{
  "attrs": { "allow": { "$default": "false" } }
}

This will prevent any new attributes from being created.

## Attribute level permissions

When you query a namespace, it will return all the attributes for an entity. You can use the [`fields`](/docs/instaql#select-fields) clause to restrict which attributes are returned from the server but this will not prevent a client from doing another query to get the full entity.

At the moment InstantDB does not support attribute level permissions. This is something we are actively thinking about though! In the meantime you can work around this by splitting your entities into multiple namespaces. This way you can set separate permissions for private data. [Here's an example](https://github.com/instantdb/instant/blob/main/client/sandbox/react-nextjs/pages/patterns/split-attributes.tsx)

## Find entities with no links.

If you want to find entities that have no links, you can use the `$isNull` query filter. For example, if you want to find all posts that are not linked to an author you can do

const { isLoading, error, data } \= db.useQuery({
  posts: {
    $: {
      where: {
        'author.id': {
          $isNull: true,
        },
      },
    },
  },
});

## Setting limits via permissions.

If you want to limit the number of entities a user can create, you can do so via permissions. Here's an example of limiting a user to creating at most 2 todos.

First the [schema](/docs/modeling-data):

// instant.schema.ts
// Here we define users, todos, and a link between them.
import { i } from '@instantdb/core';
const \_schema \= i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    todos: i.entity({
      label: i.string(),
    }),
  },
  links: {
    userTodos: {
      forward: {
        on: 'todos',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'ownedTodos',
      },
    },
  },
});
// This helps Typescript display nicer intellisense
type \_AppSchema \= typeof \_schema;
interface AppSchema extends \_AppSchema {}
const schema: AppSchema \= \_schema;
export type { AppSchema };
export default schema;

Then the [permissions](/docs/permissions):

import type { InstantRules } from '@instantdb/react';
// instant.perms.ts
// And now we reference the \`owner\` link for todos to check the number
// of todos a user has created.
// (Note): Make sure the \`owner\` link is already defined in the schema.
// before you can reference it in the permissions.
const rules \= {
  todos: {
    allow: {
      create: "size(data.ref('owner.ownedTodos.id')) <= 2",
    },
  },
} satisfies InstantRules;
export default rules;

## Listen to InstantDB connection status.

Sometimes you want to let clients know when they are connected or disconnected to the DB. You can use `db.subscribeConnectionStatus` in vanilla JS or `db.useConnectionStatus` in React to listen to connection changes

// Vanilla JS
const unsub \= db.subscribeConnectionStatus((status) \=> {
  const statusMap \= {
    connecting: 'authenticating',
    opened: 'authenticating',
    authenticated: 'connected',
    closed: 'closed',
    errored: 'errored',
  };
  const connectionState \= statusMap\[status\] || 'unexpected state';
  console.log('Connection status:', connectionState);
});
// React/React Native
function App() {
  const statusMap \= {
    connecting: 'authenticating',
    opened: 'authenticating',
    authenticated: 'connected',
    closed: 'closed',
    errored: 'errored',
  };
  const status \= db.useConnectionStatus();
  const connectionState \= statusMap\[status\] || 'unexpected state';
  return <div\>Connection state: {connectionState}</div\>;
}

## Using Instant via CDN

If you have a plain html page or avoid using a build step, you can use InstantDB via a CDN through [unpkg](https://www.unpkg.com/@instantdb/core/).

<!\-- Load Instant via unpkg \--\>
<!\-- Consider replacing @latest with a specific package \--\>
<script src\="https://www.unpkg.com/@instantdb/core@latest/dist/standalone/index.umd.cjs"\></script\>
<!\-- Use Instant like normal \--\>
<script\>
  const { init, id } = instant;
  // Visit https://instantdb.com/dash to get your APP\_ID :)
  const APP\_ID = '\_\_APP\_ID\_\_';
  const db = init({ appId: APP\_ID });
  async function createMessage() {
    await db.transact(
      db.tx.messages\[id()\].update({
        text: 'Hello world!'
      })
    );
  }
</script\>

Copy

## Making Local ids

Sometimes you need an identifier that stays the same between refreshes. A "local id" of sorts.

Local ids are especially useful for features like "guest" mode. You need an identifier for the user who is accessing the service, but they haven't signed up yet. Well, you can use a `localId` for that. To generate one, use `db.getLocalId`:

import { init } from '@instantdb/react';
// Visit https://instantdb.com/dash to get your APP\_ID :)
const APP\_ID \= '\_\_APP\_ID\_\_';
const db \= init({ appId: APP\_ID });
const id \= await db.getLocalId('guest');
console.log(id, 'stays the same even if you refresh');

Or a handy hook if you're inside React:

import { init } from '@instantdb/react';
// Visit https://instantdb.com/dash to get your APP\_ID :)
const APP\_ID \= '\_\_APP\_ID\_\_';
const db \= init({ appId: APP\_ID });
function App() {
  const id \= db.useLocalId('guest');
  if (!id) return;
  console.log(id, 'stays the same even if you refresh');
}

Note: passing in different arguments will produce different ids:

const id1 \= db.useLocalId('device');
const id2 \= db.useLocalId('session');
console.log(
  id1,
  id2,
  'are different. But each will stay the same even if you refresh',
);

Once you have an ID, you can pass it around in your transactions and queries, and use them in [ruleParams](/docs/permissions#rule-params).

## Making admin queries work with NextJS Caching

NextJS caches fetch requests and lets you revalidate them. [`adminDB.query`](/docs/backend#query) uses fetch under the hood, so NextJS caching will work by default.

If you want to finely control how the query caches, you can pass in the same kind of [fetch options](https://nextjs.org/docs/app/building-your-application/caching#fetch) for NextJS. For example, to revalidate a query every hour:

await adminDB.query(
  { goals: {} },
  {
    fetchOpts: {
      next: { revalidate: 3600 },
    },
  },
);

Or to set a specific tag:

await adminDB.query(
  { goals: {} },
  {
    fetchOpts: {
      next: { tags: \['goals:all'\] },
    },
  },
);

## Composite keys

Sometimes you an item is unique by two or more attributes. For example, consider a `location`: it's unique by `latitude` *and* `longitude`.

How can you enforce this uniqueness in Instant?

We don't have composite keys built-in, but you can manage them by creating a composite column. For example, you can make sure `locations` are unique by adding a `latLong` column:

import { i } from '@instantdb/core';
const \_schema \= i.schema({
  entities: {
    // ...
    locations: i.entity({
      latitude: i.number().indexed(),
      longitude: i.number().indexed(),
      latLong: i.string().unique() // <-- our composite column
    }),
  },

We can then set `latLong` in our updates:

function createLocation({ latitude, longitude }) {
  db.transact(
    db.tx.locations\[id()\].update({
      latitude,
      longitude,
      latLong: \`${latitude}\_${longitude}\`,
    }),
  );
}

Now, any locations with the same latitude and longitude will throw a uniqueness error.

To make sure that `latLong` *always* matches `latitude` and `longitude`, you can add a rule in your permissions:

const rules \= {
  locations: {
    allow: {
      create: "(data.latitude + '\_' + data.longitude) == data.latLong",
      update: "(newData.latitude + '\_' + newData.longitude) == newData.latLong",
    },
  },
};

## Saving extra information from Google Oauth

Instant supports [Sign in with Google](/docs/auth/google-oauth). Right now we only save emails, but Google access tokens also include the user's name and profile picture.

What if you wanted to save the user's name and profile picture too? Here's how to do it:

1.  Parse the `given_name`, `last_name`, and `picture` from Google's `idToken`.
2.  Then save that info on a `profiles` namespace!

The full example would look like this:

import React, { useState } from 'react';
import { init } from '@instantdb/react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// Visit https://instantdb.com/dash to get your APP\_ID :)
const APP\_ID \= '\_\_APP\_ID\_\_';
const db \= init({ appId: APP\_ID });
// e.g. 89602129-cuf0j.apps.googleusercontent.com
const GOOGLE\_CLIENT\_ID \= 'REPLACE\_ME';
// Use the google client name in the Instant dashboard auth tab
const GOOGLE\_CLIENT\_NAME \= 'REPLACE\_ME';
type JWTResponse \= {
  given\_name: string;
  email: string;
  last\_name: string;
  picture?: string | undefined;
};
// 1. Parse the \`given\_name\`, \`last\_name\`, and \`picture\` from Google's \`idToken\`.
function parseIdToken(idToken: string): JWTResponse {
  const base64Paload \= idToken.split('.')\[1\];
  const decoded \= Buffer.from(base64Paload, 'base64');
  const parsed \= JSON.parse(decoded.toString());
  return parsed;
}
function Login() {
  const \[nonce\] \= useState(crypto.randomUUID());
  return (
    <GoogleOAuthProvider clientId\={GOOGLE\_CLIENT\_ID}\>
      <GoogleLogin
        nonce\={nonce}
        onError\={() \=> alert('Login failed')}
        onSuccess\={async ({ credential }) \=> {
          if (!credential) return;
          const parsed \= parseIdToken(credential);
          const { user } \= await db.auth.signInWithIdToken({
            clientName: GOOGLE\_CLIENT\_NAME,
            idToken: credential,
            nonce,
          });
          // 2. Then save that info on a \`profiles\` namespace!
          await db.transact(\[
            db.tx.profiles\[user.id\].update({
              firstName: parsed.given\_name,
              lastName: parsed.last\_name,
              googlePicture: parsed.picture,
            }),
          \]);
        }}
      /\>
    </GoogleOAuthProvider\>
  );
}

## Managing local vs production apps

You may want to have separate Instant apps for local development and production. The way to do this right now is to have two separate apps, one for local and one for production.

// lib/db.ts
import { init } from '@instantdb/react';
const APP\_ID \= process.env.NEXT\_PUBLIC\_INSTANT\_APP\_ID;
export const db \= init({ appId: APP\_ID });

Then in your environment files:

\# .env.local
NEXT\_PUBLIC\_INSTANT\_APP\_ID\=your-local-app-id
\# .env.production
NEXT\_PUBLIC\_INSTANT\_APP\_ID\=your-production-app-id

When developing new features that require schema or permission changes, you can follow this workflow:

1.  **Push schema/perms changes locally first**
    
    npx instant-cli push --app your-local-app-id
    
2.  **Test code changes** - Verify your new code works as expected with your changes in your local environment and app.
    
3.  **Push changes to production**
    
    npx instant-cli push --app your-production-app-id
    
4.  **Deploy code changes to prod!** - And that should be it!
    

## Dealing with timeouts

Complicated queries or large transactions may fail due to timeouts. Right now we have a hard limit of 5 seconds for both queries and transactions. We do this to ensure real-time doesn't suffer from long-running operations.

To get a sense for how long a query or transaction takes, you can use the `Sandbox` tab in the dashboard. Using `await db.query` or `await db.transact` will show you the time it took to run the operation in the console. Queries and transactions in the sandbox can run for up to 30 seconds,

Once you have a sense of how long your queries and transactions take, you can iteratively optimize them. For example, you can use pagination or add indexes to speed up queries, or break up large transactions into smaller ones.

If you are an LLM trying to learn how to develop with Instant, here are all of the links to the docs:

[Getting started w/ React](https://instantdb.com/docs)[Getting started w/ React Native](https://instantdb.com/docs/start-rn)[Getting started w/ Vanilla JS](https://instantdb.com/docs/start-vanilla)[Using LLMs](https://instantdb.com/docs/using-llms)[Init](https://instantdb.com/docs/init)[Modeling data](https://instantdb.com/docs/modeling-data)[Writing data](https://instantdb.com/docs/instaml)[Reading data](https://instantdb.com/docs/instaql)[Instant on the backend](https://instantdb.com/docs/backend)[Patterns](https://instantdb.com/docs/patterns)[Auth](https://instantdb.com/docs/auth)[Magic codes](https://instantdb.com/docs/auth/magic-codes)[Google OAuth](https://instantdb.com/docs/auth/google-oauth)[Sign In with Apple](https://instantdb.com/docs/auth/apple)[Clerk](https://instantdb.com/docs/auth/clerk)[Permissions](https://instantdb.com/docs/permissions)[OAuth apps](https://instantdb.com/docs/auth/platform-oauth)[Managing users](https://instantdb.com/docs/users)[Presence, Cursors, and Activity](https://instantdb.com/docs/presence-and-topics)[Instant CLI](https://instantdb.com/docs/cli)[Devtool](https://instantdb.com/docs/devtool)[Custom emails](https://instantdb.com/docs/emails)[App teams](https://instantdb.com/docs/teams)[Storage](https://instantdb.com/docs/storage)

Previous

[← Instant on the backend](/docs/backend)

Next

[Auth →](/docs/auth)

## On this page

1.  ### [You can expose your app id to the client.](/docs/patterns#you-can-expose-your-app-id-to-the-client)
    
2.  ### [Restrict creating new attributes.](/docs/patterns#restrict-creating-new-attributes)
    
3.  ### [Attribute level permissions](/docs/patterns#attribute-level-permissions)
    
4.  ### [Find entities with no links.](/docs/patterns#find-entities-with-no-links)
    
5.  ### [Setting limits via permissions.](/docs/patterns#setting-limits-via-permissions)
    
6.  ### [Listen to InstantDB connection status.](/docs/patterns#listen-to-instant-db-connection-status)
    
7.  ### [Using Instant via CDN](/docs/patterns#using-instant-via-cdn)
    
8.  ### [Making Local ids](/docs/patterns#making-local-ids)
    
9.  ### [Making admin queries work with NextJS Caching](/docs/patterns#making-admin-queries-work-with-next-js-caching)
    
10.  ### [Composite keys](/docs/patterns#composite-keys)
    
11.  ### [Saving extra information from Google Oauth](/docs/patterns#saving-extra-information-from-google-oauth)
    
12.  ### [Managing local vs production apps](/docs/patterns#managing-local-vs-production-apps)
    
13.  ### [Dealing with timeouts](/docs/patterns#dealing-with-timeouts)