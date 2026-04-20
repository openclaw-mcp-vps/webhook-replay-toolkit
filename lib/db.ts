import { randomUUID } from "node:crypto";
import { Pool, type PoolConfig } from "pg";

export type PaymentStatus = "active" | "inactive" | "past_due";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  subdomain: string;
  capture_key: string;
  created_at: string;
};

export type WebhookRecord = {
  id: string;
  user_id: string;
  provider: string;
  method: string;
  path: string;
  query: string;
  headers: Record<string, string>;
  body: string;
  body_size: number;
  source_ip: string | null;
  received_at: string;
  replay_count: number;
  last_replayed_at: string | null;
};

export type ReplayLogRecord = {
  id: string;
  webhook_id: string;
  user_id: string;
  target_url: string;
  success: boolean;
  status_code: number | null;
  response_headers: Record<string, string>;
  response_body: string;
  duration_ms: number;
  error_message: string | null;
  attempted_at: string;
};

let pool: Pool | undefined;
let schemaInitialized: Promise<void> | null = null;

function buildPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run webhook-replay-toolkit");
  }

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  return {
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    max: 8,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  };
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool(buildPoolConfig());
  }

  return pool;
}

export async function initDb(): Promise<void> {
  if (schemaInitialized) {
    return schemaInitialized;
  }

  schemaInitialized = (async () => {
    const client = await getPool().connect();

    try {
      await client.query("BEGIN");

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          subdomain TEXT NOT NULL UNIQUE,
          capture_key TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS payments (
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'inactive',
          lemonsqueezy_order_id TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS webhooks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider TEXT NOT NULL,
          method TEXT NOT NULL,
          path TEXT NOT NULL,
          query TEXT NOT NULL,
          headers JSONB NOT NULL,
          body TEXT NOT NULL,
          body_size INTEGER NOT NULL,
          source_ip TEXT,
          received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          replay_count INTEGER NOT NULL DEFAULT 0,
          last_replayed_at TIMESTAMPTZ
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS replay_logs (
          id TEXT PRIMARY KEY,
          webhook_id TEXT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          target_url TEXT NOT NULL,
          success BOOLEAN NOT NULL,
          status_code INTEGER,
          response_headers JSONB NOT NULL,
          response_body TEXT NOT NULL,
          duration_ms INTEGER NOT NULL,
          error_message TEXT,
          attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_webhooks_user_received_at ON webhooks(user_id, received_at DESC)"
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_webhooks_provider ON webhooks(provider)"
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_replay_logs_webhook_attempted ON replay_logs(webhook_id, attempted_at DESC)"
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      schemaInitialized = null;
      throw error;
    } finally {
      client.release();
    }
  })();

  return schemaInitialized;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  subdomain: string;
  captureKey: string;
}): Promise<UserRecord> {
  await initDb();

  const result = await getPool().query<UserRecord>(
    `
      INSERT INTO users (id, email, name, password_hash, subdomain, capture_key)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      randomUUID(),
      input.email.toLowerCase(),
      input.name,
      input.passwordHash,
      input.subdomain,
      input.captureKey
    ]
  );

  return result.rows[0];
}

export async function getUserByEmail(
  email: string
): Promise<UserRecord | null> {
  await initDb();

  const result = await getPool().query<UserRecord>(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email.toLowerCase()]
  );

  return result.rows[0] ?? null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  await initDb();

  const result = await getPool().query<UserRecord>(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function getUserByCaptureKey(
  captureKey: string
): Promise<UserRecord | null> {
  await initDb();

  const result = await getPool().query<UserRecord>(
    `SELECT * FROM users WHERE capture_key = $1 LIMIT 1`,
    [captureKey]
  );

  return result.rows[0] ?? null;
}

export async function getUserBySubdomain(
  subdomain: string
): Promise<UserRecord | null> {
  await initDb();

  const result = await getPool().query<UserRecord>(
    `SELECT * FROM users WHERE subdomain = $1 LIMIT 1`,
    [subdomain]
  );

  return result.rows[0] ?? null;
}

export async function setPaymentStatus(input: {
  userId: string;
  status: PaymentStatus;
  orderId?: string | null;
}): Promise<void> {
  await initDb();

  await getPool().query(
    `
      INSERT INTO payments (user_id, status, lemonsqueezy_order_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        lemonsqueezy_order_id = COALESCE(EXCLUDED.lemonsqueezy_order_id, payments.lemonsqueezy_order_id),
        updated_at = NOW()
    `,
    [input.userId, input.status, input.orderId ?? null]
  );
}

export async function getPaymentStatus(
  userId: string
): Promise<PaymentStatus> {
  await initDb();

  const result = await getPool().query<{ status: PaymentStatus }>(
    `SELECT status FROM payments WHERE user_id = $1 LIMIT 1`,
    [userId]
  );

  return result.rows[0]?.status ?? "inactive";
}

export async function insertWebhook(input: {
  userId: string;
  provider: string;
  method: string;
  path: string;
  query: string;
  headers: Record<string, string>;
  body: string;
  sourceIp: string | null;
}): Promise<WebhookRecord> {
  await initDb();

  const result = await getPool().query<WebhookRecord>(
    `
      INSERT INTO webhooks
      (id, user_id, provider, method, path, query, headers, body, body_size, source_ip)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
      RETURNING *
    `,
    [
      randomUUID(),
      input.userId,
      input.provider,
      input.method,
      input.path,
      input.query,
      JSON.stringify(input.headers),
      input.body,
      Buffer.byteLength(input.body, "utf8"),
      input.sourceIp
    ]
  );

  return result.rows[0];
}

export async function listWebhooksByUser(
  userId: string,
  options?: {
    provider?: string;
    search?: string;
    limit?: number;
  }
): Promise<WebhookRecord[]> {
  await initDb();

  const values: Array<string | number> = [userId];
  const filters: string[] = ["user_id = $1"];

  if (options?.provider && options.provider !== "all") {
    values.push(options.provider.toLowerCase());
    filters.push(`provider = $${values.length}`);
  }

  if (options?.search) {
    values.push(`%${options.search.toLowerCase()}%`);
    const idx = values.length;
    filters.push(`(
      LOWER(path) LIKE $${idx}
      OR LOWER(body) LIKE $${idx}
      OR LOWER(provider) LIKE $${idx}
    )`);
  }

  const limit = Math.max(1, Math.min(options?.limit ?? 100, 500));
  values.push(limit);

  const query = `
    SELECT *
    FROM webhooks
    WHERE ${filters.join(" AND ")}
    ORDER BY received_at DESC
    LIMIT $${values.length}
  `;

  const result = await getPool().query<WebhookRecord>(query, values);
  return result.rows;
}

export async function getWebhookById(
  userId: string,
  webhookId: string
): Promise<WebhookRecord | null> {
  await initDb();

  const result = await getPool().query<WebhookRecord>(
    `
      SELECT *
      FROM webhooks
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [webhookId, userId]
  );

  return result.rows[0] ?? null;
}

export async function insertReplayLog(input: {
  webhookId: string;
  userId: string;
  targetUrl: string;
  success: boolean;
  statusCode: number | null;
  responseHeaders: Record<string, string>;
  responseBody: string;
  durationMs: number;
  errorMessage?: string | null;
}): Promise<ReplayLogRecord> {
  await initDb();

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const replayResult = await client.query<ReplayLogRecord>(
      `
        INSERT INTO replay_logs
        (id, webhook_id, user_id, target_url, success, status_code, response_headers, response_body, duration_ms, error_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
        RETURNING *
      `,
      [
        randomUUID(),
        input.webhookId,
        input.userId,
        input.targetUrl,
        input.success,
        input.statusCode,
        JSON.stringify(input.responseHeaders),
        input.responseBody,
        input.durationMs,
        input.errorMessage ?? null
      ]
    );

    await client.query(
      `
        UPDATE webhooks
        SET replay_count = replay_count + 1,
            last_replayed_at = NOW()
        WHERE id = $1
      `,
      [input.webhookId]
    );

    await client.query("COMMIT");

    return replayResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listReplayLogsForWebhook(
  userId: string,
  webhookId: string
): Promise<ReplayLogRecord[]> {
  await initDb();

  const result = await getPool().query<ReplayLogRecord>(
    `
      SELECT *
      FROM replay_logs
      WHERE user_id = $1 AND webhook_id = $2
      ORDER BY attempted_at DESC
      LIMIT 20
    `,
    [userId, webhookId]
  );

  return result.rows;
}

export async function getDashboardMetrics(userId: string): Promise<{
  totalWebhooks: number;
  webhooksLast24h: number;
  replayAttemptsLast24h: number;
  failedReplaysLast24h: number;
}> {
  await initDb();

  const result = await getPool().query<{
    total_webhooks: string;
    webhooks_last_24h: string;
    replay_attempts_last_24h: string;
    failed_replays_last_24h: string;
  }>(
    `
      SELECT
        (SELECT COUNT(*)::TEXT FROM webhooks WHERE user_id = $1) AS total_webhooks,
        (
          SELECT COUNT(*)::TEXT
          FROM webhooks
          WHERE user_id = $1
            AND received_at >= NOW() - INTERVAL '24 hours'
        ) AS webhooks_last_24h,
        (
          SELECT COUNT(*)::TEXT
          FROM replay_logs
          WHERE user_id = $1
            AND attempted_at >= NOW() - INTERVAL '24 hours'
        ) AS replay_attempts_last_24h,
        (
          SELECT COUNT(*)::TEXT
          FROM replay_logs
          WHERE user_id = $1
            AND attempted_at >= NOW() - INTERVAL '24 hours'
            AND success = FALSE
        ) AS failed_replays_last_24h
    `,
    [userId]
  );

  const row = result.rows[0];

  return {
    totalWebhooks: Number(row.total_webhooks),
    webhooksLast24h: Number(row.webhooks_last_24h),
    replayAttemptsLast24h: Number(row.replay_attempts_last_24h),
    failedReplaysLast24h: Number(row.failed_replays_last_24h)
  };
}
