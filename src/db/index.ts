// Make sure to install the 'pg' package
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schemas';

const pool = new Pool({
  host: process.env.POSTGRES_HOST!,
  port: parseInt(process.env.POSTGRES_PORT!),
  password: process.env.POSTGRES_PASSWORD!,
  user: process.env.POSTGRES_USER!,
  database: process.env.POSTGRES_DATABASE!,
  ssl:
    process.env.POSTGRES_SSL_ENABLED === "true"
      ? { rejectUnauthorized: false }
      : false,
});
const db = drizzle({ client: pool, schema, logger: true });

export default db;
