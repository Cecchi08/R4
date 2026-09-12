// Reutiliza un pool PostgreSQL limitado por instancia para el entorno serverless.
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
import pg from 'pg';

const { Pool } = pg;

function getConnectionString() {
  if (process.env.DB_URL) {
    return process.env.DB_URL;
  }

  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  if (DB_HOST && DB_NAME && DB_USER) {
    const port = DB_PORT || 5432;
    const password = encodeURIComponent(DB_PASSWORD || '');
    return `postgresql://${DB_USER}:${password}@${DB_HOST}:${port}/${DB_NAME}`;
  }

  return undefined;
}

const connectionString = getConnectionString();

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
  max: 3,
  idleTimeoutMillis: 10000,
  allowExitOnIdle: true,
  ssl: process.env.DB_SSL === 'false' ? false : connectionString
    ? { rejectUnauthorized: false }
    : undefined,
});

pool.on('error', err => console.error('[DB pool]', err.message));

export async function testConnection() {
  if (!connectionString) {
    console.error(
      '[DB] Connection failed: missing configuration (set DB_URL or DB_HOST/DB_NAME/DB_USER)',
    );
    return false;
  }

  try {
    await pool.query('SELECT 1');
    console.log('[DB] Connection successful');
    return true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  }
}

export default pool;
