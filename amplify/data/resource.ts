import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  NewsSubscriber: a
    .model({
      email: a.string().required(),
      subscribed_at: a.string().required(),
    })
    .identifier(['email', 'subscribed_at'])
    .authorization((allow) => [allow.publicApiKey()]),

  Member: a
    .model({
      email: a.string().required(),
      applied_at: a.string().required(),
      name: a.string().required(),
      affiliation: a.string(),
      phone: a.string().required(),
      member_type: a.string().required(),
      interest: a.string(),
      motivation: a.string(),
      status: a.string().required(),
      recv_channels: a.string(),
      agreed: a.boolean(),
      marketing: a.boolean(),
    })
    .identifier(['email', 'applied_at'])
    .authorization((allow) => [allow.publicApiKey()]),

  Partner: a
    .model({
      contact_email: a.string().required(),
      created_at: a.string().required(),
      org_name: a.string().required(),
      org_type: a.string().required(),
      contact_name: a.string().required(),
      contact_title: a.string(),
      contact_phone: a.string().required(),
      programs: a.string(),
      cooperation_detail: a.string(),
      partner_agreed: a.boolean(),
      status: a.string().required(),
    })
    .identifier(['contact_email', 'created_at'])
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
