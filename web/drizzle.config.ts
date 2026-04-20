import { defineConfig } from 'drizzle-kit'
import path from 'path'

export default defineConfig({
  schema: './src/backend/db/schema.ts',
  out: './src/backend/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:${path.resolve(process.cwd(), '../db/domainDB.db')}`,
  },
})
