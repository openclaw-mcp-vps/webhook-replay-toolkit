import { randomUUID } from "node:crypto";
import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __webhookReplayPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __webhookReplayDbReady: boolean | undefined;
}

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export type WebhookSummary = {
  id: string;
  provider: string;
  method: string;
  path: string;
  contentType: string | null;
  sourceIp: string | null;
  receivedAt: string;
  bodySize: number;
};

export type ReplayAttempt = {
  id: string;
  webhookId: string;
  targetUrl: string;
  method: string;
  statusCode: number | null;
  durationMs: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  createdAt: string;
};

export type WebhookDetail = WebhookSummary & {
  headers: Record<string, string>;
  body: string;
  query: Record<string, string>;
  parsedBody: JSONValue | null;
  signature: string | null;
  replayAttempts: ReplayAttempt[];
};

export type DashboardStats = {
  totalEvents: number;
  eventsLast24h: number;
  replayCount: number;
  lastCaptureAt: string | null;
};

export type RecordWebhookInput = {
  provider: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string;
  parsedBody: JSONValue | null;
  sourceIp: string | null;
  contentType: string | null;
  signature: string | null;
};

export type RecordReplayAttemptInput = {
  webhookId: string;
  targetUrl: string;
  method: string;
  statusCode: number | null;
  durationMs: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
};

export type AccessGrant = {
  id: string;
  email: string;
  active: boolean;
  source: string;
  stripeCustomerId: string | null;
  checkoutSessionId: string | null;
  lastEventId: string | null;
  grantedAt: string;
  updatedAt: string;
};

const pool =
  globalThis.__webhookReplayPool ??
  new Pool(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") {
  globalThis.__webhookReplayPool = pool;
}

let dbReady = globalThis.__webhookReplayDbReady ?? false;

function assertDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to capture and replay webhooks.");
  }
}

function normalizeJsonRecord(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object") {
    return {};
  }

  return Object.entries(input as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = typeof value === "string" ? value : JSON.stringify(value);
    return acc;
  }, {});
}

function mapWebhookSummary(row: QueryResultRow): WebhookSummary {
  return {
    id: row.id,
    provider: row.provider,
    method: row.method,
    path: row.path,
    contentType: row.content_type,
    sourceIp: row.source_ip,
    receivedAt: row.received_at,
    bodySize: row.body_size
  };
}

function mapReplayAttempt(row: QueryResultRow): ReplayAttempt {
  return {
    id: row.id,
    webhookId: row.webhook_id,
    targetUrl: row.target_url,
    method: row.method,
    statusCode: row.status_code,
    durationMs: row.duration_ms,
    responseHeaders: normalizeJsonRecord(row.response_headers),
    responseBody: row.response_body ?? "",
    createdAt: row.created_at
  };
}

function mapAccessGrant(row: QueryResultRow): AccessGrant {
  return {
    id: row.id,
    email: row.email,
    active: row.active,
    source: row.source,
    stripeCustomerId: row.stripe_customer_id,
    checkoutSessionId: row.checkout_session_id,
    lastEventId: row.last_event_id,
    grantedAt: row.granted_at,
    updatedAt: row.updated_at
  };
}

export async function ensureDatabase() {
  assertDatabaseConfigured();

  if (dbReady) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      query JSONB NOT NULL DEFAULT '{}'::jsonb,
      headers JSONB NOT NULL,
      body TEXT NOT NULL,
      parsed_body JSONB,
      source_ip TEXT,
      content_type TEXT,
      signature TEXT,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at
      ON webhook_events (received_at DESC);

    CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_received
      ON webhook_events (provider, received_at DESC);

    CREATE TABLE IF NOT EXISTS replay_attempts (
      id TEXT PRIMARY KEY,
      webhook_id TEXT NOT NULL REFERENCES webhook_events(id) ON DELETE CASCADE,
      target_url TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER,
      duration_ms INTEGER NOT NULL,
      response_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
      response_body TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_replay_attempts_webhook_id
      ON replay_attempts (webhook_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS access_grants (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      source TEXT NOT NULL DEFAULT 'stripe',
      stripe_customer_id TEXT,
      checkout_session_id TEXT,
      last_event_id TEXT,
      granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  dbReady = true;
  globalThis.__webhookReplayDbReady = true;
}

export async function recordWebhook(input: RecordWebhookInput) {
  await ensureDatabase();

  const id = randomUUID();

  await pool.query(
    `
      INSERT INTO webhook_events (
        id,
        provider,
        method,
        path,
        query,
        headers,
        body,
        parsed_body,
        source_ip,
        content_type,
        signature
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5::jsonb,
        $6::jsonb,
        $7,
        $8::jsonb,
        $9,
        $10,
        $11
      )
    `,
    [
      id,
      input.provider,
      input.method,
      input.path,
      JSON.stringify(input.query),
      JSON.stringify(input.headers),
      input.body,
      input.parsedBody ? JSON.stringify(input.parsedBody) : null,
      input.sourceIp,
      input.contentType,
      input.signature
    ]
  );

  return id;
}

export async function listWebhooks(options?: {
  provider?: string;
  search?: string;
  limit?: number;
}) {
  await ensureDatabase();

  const where: string[] = [];
  const values: Array<string | number> = [];

  if (options?.provider && options.provider !== "all") {
    values.push(options.provider);
    where.push(`provider = $${values.length}`);
  }

  if (options?.search?.trim()) {
    values.push(`%${options.search.trim()}%`);
    where.push(`(path ILIKE $${values.length} OR body ILIKE $${values.length} OR provider ILIKE $${values.length})`);
  }

  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 200);
  values.push(limit);

  const query = `
    SELECT
      id,
      provider,
      method,
      path,
      content_type,
      source_ip,
      received_at,
      OCTET_LENGTH(body) AS body_size
    FROM webhook_events
    ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY received_at DESC
    LIMIT $${values.length}
  `;

  const result = await pool.query(query, values);
  return result.rows.map(mapWebhookSummary);
}

export async function getWebhookById(id: string): Promise<WebhookDetail | null> {
  await ensureDatabase();

  const webhookResult = await pool.query(
    `
      SELECT
        id,
        provider,
        method,
        path,
        content_type,
        source_ip,
        received_at,
        OCTET_LENGTH(body) AS body_size,
        headers,
        body,
        query,
        parsed_body,
        signature
      FROM webhook_events
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  const webhookRow = webhookResult.rows[0];
  if (!webhookRow) {
    return null;
  }

  const replayResult = await pool.query(
    `
      SELECT
        id,
        webhook_id,
        target_url,
        method,
        status_code,
        duration_ms,
        response_headers,
        response_body,
        created_at
      FROM replay_attempts
      WHERE webhook_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `,
    [id]
  );

  return {
    ...mapWebhookSummary(webhookRow),
    headers: normalizeJsonRecord(webhookRow.headers),
    body: webhookRow.body,
    query: normalizeJsonRecord(webhookRow.query),
    parsedBody: (webhookRow.parsed_body as JSONValue | null) ?? null,
    signature: webhookRow.signature,
    replayAttempts: replayResult.rows.map(mapReplayAttempt)
  };
}

export async function recordReplayAttempt(input: RecordReplayAttemptInput) {
  await ensureDatabase();

  const id = randomUUID();

  await pool.query(
    `
      INSERT INTO replay_attempts (
        id,
        webhook_id,
        target_url,
        method,
        status_code,
        duration_ms,
        response_headers,
        response_body
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
    `,
    [
      id,
      input.webhookId,
      input.targetUrl,
      input.method,
      input.statusCode,
      input.durationMs,
      JSON.stringify(input.responseHeaders),
      input.responseBody
    ]
  );

  return id;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureDatabase();

  const [eventsResult, replayResult] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::int AS total_events,
        COUNT(*) FILTER (WHERE received_at >= NOW() - INTERVAL '24 hours')::int AS events_last_24h,
        MAX(received_at) AS last_capture_at
      FROM webhook_events
    `),
    pool.query(`SELECT COUNT(*)::int AS replay_count FROM replay_attempts`)
  ]);

  const eventsRow = eventsResult.rows[0] ?? {
    total_events: 0,
    events_last_24h: 0,
    last_capture_at: null
  };

  const replayRow = replayResult.rows[0] ?? { replay_count: 0 };

  return {
    totalEvents: eventsRow.total_events,
    eventsLast24h: eventsRow.events_last_24h,
    replayCount: replayRow.replay_count,
    lastCaptureAt: eventsRow.last_capture_at
  };
}

export async function upsertAccessGrant(input: {
  email: string;
  source?: string;
  stripeCustomerId?: string | null;
  checkoutSessionId?: string | null;
  lastEventId?: string | null;
  active?: boolean;
}) {
  await ensureDatabase();

  const id = randomUUID();
  const normalizedEmail = input.email.trim().toLowerCase();

  const result = await pool.query(
    `
      INSERT INTO access_grants (
        id,
        email,
        active,
        source,
        stripe_customer_id,
        checkout_session_id,
        last_event_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email)
      DO UPDATE SET
        active = EXCLUDED.active,
        source = EXCLUDED.source,
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, access_grants.stripe_customer_id),
        checkout_session_id = COALESCE(EXCLUDED.checkout_session_id, access_grants.checkout_session_id),
        last_event_id = COALESCE(EXCLUDED.last_event_id, access_grants.last_event_id),
        updated_at = NOW()
      RETURNING *
    `,
    [
      id,
      normalizedEmail,
      input.active ?? true,
      input.source ?? "stripe",
      input.stripeCustomerId ?? null,
      input.checkoutSessionId ?? null,
      input.lastEventId ?? null
    ]
  );

  return mapAccessGrant(result.rows[0]);
}

export async function setAccessGrantStatus(email: string, active: boolean) {
  await ensureDatabase();

  const result = await pool.query(
    `
      UPDATE access_grants
      SET active = $2, updated_at = NOW()
      WHERE email = $1
      RETURNING *
    `,
    [email.trim().toLowerCase(), active]
  );

  return result.rows[0] ? mapAccessGrant(result.rows[0]) : null;
}

export async function findActiveAccessGrantByEmail(email: string) {
  await ensureDatabase();

  const result = await pool.query(
    `
      SELECT *
      FROM access_grants
      WHERE email = $1 AND active = TRUE
      LIMIT 1
    `,
    [email.trim().toLowerCase()]
  );

  return result.rows[0] ? mapAccessGrant(result.rows[0]) : null;
}
