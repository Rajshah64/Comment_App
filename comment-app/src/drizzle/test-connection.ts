import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Query Supabase's auth.users table
  const result = await db.execute(
    'SELECT COUNT(*) as user_count FROM auth.users',
  );
  console.log(
    '🟢 Connected! Found',
    result.rows[0].user_count,
    'users in auth.users',
  );

  const allComments = await db.select().from(schema.comments);
  console.log('🟢 Found', allComments.length, 'comments');

  await pool.end();
}

main().catch((err) => {
  console.error('🔴 Connection error:', err);
  process.exit(1);
});
