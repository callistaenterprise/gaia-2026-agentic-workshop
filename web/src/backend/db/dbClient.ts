import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import path from 'path'

const dbUrl = `file:${path.resolve(process.cwd(), '../db/domainDB.db')}`
const libsqlClient = createClient({ url: dbUrl })

export const db = drizzle(libsqlClient, { schema })
