import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // eslint-disable-next-line no-console
  console.warn("DATABASE_URL is not set. API routes that use persistence will fail until it is configured.");
}

const globalForDb = globalThis as unknown as {
  pool?: Pool;
  initPromise?: Promise<void>;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

if (!globalForDb.pool) {
  globalForDb.pool = pool;
}

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      order_id TEXT,
      customer_email TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      query_string TEXT,
      headers JSONB NOT NULL,
      body TEXT NOT NULL,
      content_type TEXT,
      body_size INTEGER NOT NULL,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS replays (
      id TEXT PRIMARY KEY,
      webhook_id TEXT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_url TEXT NOT NULL,
      status_code INTEGER,
      response_headers JSONB,
      response_body TEXT,
      duration_ms INTEGER,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_webhooks_user_received_at ON webhooks(user_id, received_at DESC);
    CREATE INDEX IF NOT EXISTS idx_replays_webhook_created_at ON replays(webhook_id, created_at DESC);
  `);
}

export async function ensureDb() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  if (!globalForDb.initPromise) {
    globalForDb.initPromise = initSchema();
  }

  await globalForDb.initPromise;
}

export async function ensureUser(userId: string) {
  await ensureDb();
  await pool.query(
    `INSERT INTO users (id) VALUES ($1)
     ON CONFLICT (id) DO NOTHING`,
    [userId],
  );
}
