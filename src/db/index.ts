import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/autoapply';

// Global singleton to prevent connection leaks during Next.js hot-reloads
declare global {
  var _postgresClient: postgres.Sql | undefined;
}

const client = global._postgresClient || postgres(connectionString, { max: 10 });

if (process.env.NODE_ENV !== 'production') {
  global._postgresClient = client;
}

export const db = drizzle(client, { schema });
export { client, schema };
