import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let isConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.warn('⚠️ PostgreSQL Pool Warning:', err.message);
      isConnected = false;
    });

    pool.query('SELECT 1').then(() => {
      isConnected = true;
      console.log('✅ Connected to PostgreSQL database');
    }).catch((err) => {
      console.warn('⚠️ Could not connect to PostgreSQL database (falling back to in-memory store):', err.message);
      isConnected = false;
    });
  } catch (err: any) {
    console.warn('⚠️ Failed to initialize PostgreSQL pool:', err.message);
    pool = null;
  }
} else {
  console.log('ℹ️ No DATABASE_URL provided. Running with in-memory resilient storage.');
}

export { pool, isConnected };

export async function query(text: string, params?: any[]) {
  if (pool && isConnected) {
    try {
      return await pool.query(text, params);
    } catch (err: any) {
      console.warn('Postgres query error, falling back to memory layer:', err.message);
    }
  }
  return null;
}
