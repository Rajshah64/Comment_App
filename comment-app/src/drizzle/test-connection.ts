import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const allUsers = await db.select().from(schema.users);
  console.log('🟢 Connected! Found', allUsers.length, 'users');
  await pool.end();
}

main().catch(err => {
  console.error('🔴 Connection error:', err);
  process.exit(1);
});
