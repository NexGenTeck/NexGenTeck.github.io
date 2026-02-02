import { Pool } from 'pg';

const useSsl = process.env.PGSSL === 'true';

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.PGHOST ?? '127.0.0.1',
        port: Number(process.env.PGPORT ?? 5432),
        database: process.env.PGDATABASE ?? 'nexgenteck',
        user: process.env.PGUSER ?? 'nexgenteck_user',
        password: process.env.PGPASSWORD ?? '',
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
);
