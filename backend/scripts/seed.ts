import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { loadLocalEnv } from './env';

loadLocalEnv();

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/devdesk';

const users = [
  {
    name: 'DevDesk Admin',
    email: 'admin@devdesk.local',
    password: 'Admin12345',
    role: 'ADMIN'
  },
  {
    name: 'Support Agent',
    email: 'agent@devdesk.local',
    password: 'Agent12345',
    role: 'SUPPORT_AGENT'
  },
  {
    name: 'Customer User',
    email: 'customer@devdesk.local',
    password: 'Customer12345',
    role: 'CUSTOMER'
  }
] as const;

const categories = ['Technical Issue', 'Billing', 'Account', 'Feature Request', 'Other'];

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 12);

      await pool.query(
        `
          INSERT INTO users (name, email, password_hash, role)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            updated_at = NOW()
        `,
        [user.name, user.email, passwordHash, user.role]
      );

      console.log(`Seeded user: ${user.email}`);
    }

    for (const name of categories) {
      await pool.query(
        `
          INSERT INTO categories (name, is_active)
          VALUES ($1, TRUE)
          ON CONFLICT (name) DO UPDATE SET
            is_active = TRUE,
            updated_at = NOW()
        `,
        [name]
      );

      console.log(`Seeded category: ${name}`);
    }

    console.log('Seed completed.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed failed.');
  console.error(error);
  process.exit(1);
});
