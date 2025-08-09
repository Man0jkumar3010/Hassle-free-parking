# easy-parking

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Drizzle ORM

Drizzle orm is used for maintaining the migration and schema in the codebase.

The migration type used is mentioned here.
https://orm.drizzle.team/docs/migrations

Option 3 is chosen for this application.

It is called as codebase first approach. You have your TypeScript Drizzle schema as a source of truth and Drizzle let’s you generate SQL migration files based on your schema changes with drizzle-kit generate and then apply them to the database with drizzle-kit migrate commands.

Command used to generate the migration scripts

```bash
npx drizzle-kit generate --name init
```

The above command will do the following things:

1. read previous migration folders
2. find diff between current and previous schema
3. prompt developer for renames if necessary
4. generate SQL migration and persist to file

To run these migrations to the postgres database

```bash
npx drizzle-kit migrate
```

The above command will do the following things:

1. read migration.sql files in migrations folder
2. fetch migration history from database
3. pick previously unapplied migrations
4. apply new migration to the database

To create an empty migration file use --custom in the drizzle-kit migrate cli command.

For example

```bash
 npx drizzle-kit generate --custom --name=seed-add-slots
```

The above command creates an empty seed-users in which you can add the seeding values

Note: Don't forget to add the config in the env file
