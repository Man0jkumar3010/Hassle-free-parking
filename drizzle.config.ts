import { defineConfig } from "drizzle-kit";
import './envConfig'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schemas',
  dbCredentials: {
    host: process.env.POSTGRES_HOST!,
    port: parseInt(process.env.POSTGRES_PORT!),
    password: process.env.POSTGRES_PASSWORD!,
    user: process.env.POSTGRES_USER!,
    database: process.env.POSTGRES_DATABASE!,
    ssl: process.env.POSTGRES_SSL_ENABLED! === 'true',
  }
})
