import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import { loadLocalEnv } from './env';

loadLocalEnv();

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/devdesk';
const migrationsDir = path.resolve(process.cwd(), 'database', 'migrations');

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await readdir(migrationsDir))
      .filter((filename) => filename.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    for (const filename of files) {
      const existing = await pool.query<{ filename: string }>(
        'SELECT filename FROM schema_migrations WHERE filename = $1',
        [filename]
      );

      if (existing.rowCount) {
        console.log(`Skipping migration: ${filename}`);
        continue;
      }

      console.log(`Running migration: ${filename}`);
      const sql = await readFile(path.join(migrationsDir, filename), 'utf8');
      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log(`Migration completed: ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('All migrations completed.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Migration failed.');
  console.error(error);
  process.exit(1);
});
