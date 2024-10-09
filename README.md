# Template Cloudflare Worker

This is a template for a Cloudflare Worker. It is a simple example of how to use the Wrangler CLI to generate a new project.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update)

## Installation

install all the dependencies by running the following command:

```bash
bun i
```

## Database Setup

update your prisma.schema file with your all your models and run the following command to generate the prisma client

```bash
bunx prisma generate
```

use the following command to create a new database

```bash
bunx wrangler d1 migrations create __YOUR_DATABASE_NAME__ create_init_tables
```

> note: update the wrangler.toml file with your database name

```toml
[[d1_databases]]
binding = "DB"
database_name = "database-name"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

This will create a new migration file in the `migrations` directory.

```bash
migrations/
└── 0001_create_init_tables.sql
```

To generate the initial SQL statements for the migration, run the following command:

```bash
bunx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script \
  --output migrations/0001_create_init_tables.sql
```

execute the migration using wrangler d1 migrations apply:
For the local instance, run:

```bash
bunx wrangler d1 migrations apply __YOUR_DATABASE_NAME__ --local
```

For the remote instance, run:

```bash
bunx wrangler d1 migrations apply __YOUR_DATABASE_NAME__ --remote
```

## Development

To start the development server, run the following command:

```bash
bun dev
```

## Deploying to Cloudflare

To deploy your worker to Cloudflare, run the following command:

```bash
bun run deploy
```

## Helper Commands

to monitor the logs of your worker running remotely, run the following command:

```bash
bun wrangler tail
```
