import Database from "better-sqlite3";
import { randomUUID } from "crypto";

export type WebhookRecord = {
  id: string;
  userId: string;
  provider: string;
  eventType: string;
  method: string;
  path: string;
  query: string;
  ip: string;
  headers: Record<string, string>;
  body: string;
  bodyType: string;
  receivedAt: string;
};

export type ReplayRecord = {
  id: string;
  webhookId: string;
  targetUrl: string;
  status: number | null;
  responseHeaders: Record<string, string>;
  responseBody: string;
  durationMs: number;
  error: string | null;
  createdAt: string;
};

const db = new Database("webhooks.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    provider TEXT NOT NULL,
    eventType TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    query TEXT NOT NULL,
    ip TEXT NOT NULL,
    headers TEXT NOT NULL,
    body TEXT NOT NULL,
    bodyType TEXT NOT NULL,
    receivedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS replays (
    id TEXT PRIMARY KEY,
    webhookId TEXT NOT NULL,
    targetUrl TEXT NOT NULL,
    status INTEGER,
    responseHeaders TEXT NOT NULL,
    responseBody TEXT NOT NULL,
    durationMs INTEGER NOT NULL,
    error TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_webhooks_user_received_at ON webhooks(userId, receivedAt DESC);
  CREATE INDEX IF NOT EXISTS idx_webhooks_provider ON webhooks(provider);
  CREATE INDEX IF NOT EXISTS idx_replays_webhook_created_at ON replays(webhookId, createdAt DESC);
`);

export function upsertUser(id: string, email: string): void {
  db.prepare(
    `INSERT INTO users (id, email, createdAt) VALUES (?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET id=excluded.id`
  ).run(id, email, new Date().toISOString());
}

export function createWebhook(input: Omit<WebhookRecord, "id" | "receivedAt">): WebhookRecord {
  const webhook: WebhookRecord = {
    ...input,
    id: randomUUID(),
    receivedAt: new Date().toISOString()
  };

  db.prepare(
    `INSERT INTO webhooks (id, userId, provider, eventType, method, path, query, ip, headers, body, bodyType, receivedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    webhook.id,
    webhook.userId,
    webhook.provider,
    webhook.eventType,
    webhook.method,
    webhook.path,
    webhook.query,
    webhook.ip,
    JSON.stringify(webhook.headers),
    webhook.body,
    webhook.bodyType,
    webhook.receivedAt
  );

  return webhook;
}

export function listWebhooks(userId: string, filters?: { provider?: string; search?: string }): WebhookRecord[] {
  const params: unknown[] = [userId];
  const clauses = ["userId = ?"];

  if (filters?.provider && filters.provider !== "all") {
    clauses.push("provider = ?");
    params.push(filters.provider);
  }

  if (filters?.search) {
    clauses.push("(eventType LIKE ? OR body LIKE ? OR path LIKE ?)");
    const like = `%${filters.search}%`;
    params.push(like, like, like);
  }

  const rows = db
    .prepare(`SELECT * FROM webhooks WHERE ${clauses.join(" AND ")} ORDER BY receivedAt DESC LIMIT 250`)
    .all(...params) as Array<Record<string, string>>;

  return rows.map(deserializeWebhookRow);
}

export function getWebhookById(userId: string, id: string): WebhookRecord | null {
  const row = db.prepare("SELECT * FROM webhooks WHERE id = ? AND userId = ?").get(id, userId) as
    | Record<string, string>
    | undefined;
  if (!row) {
    return null;
  }
  return deserializeWebhookRow(row);
}

export function createReplay(input: Omit<ReplayRecord, "id" | "createdAt">): ReplayRecord {
  const replay: ReplayRecord = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  };

  db.prepare(
    `INSERT INTO replays (id, webhookId, targetUrl, status, responseHeaders, responseBody, durationMs, error, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    replay.id,
    replay.webhookId,
    replay.targetUrl,
    replay.status,
    JSON.stringify(replay.responseHeaders),
    replay.responseBody,
    replay.durationMs,
    replay.error,
    replay.createdAt
  );

  return replay;
}

export function listReplaysForWebhook(webhookId: string): ReplayRecord[] {
  const rows = db
    .prepare("SELECT * FROM replays WHERE webhookId = ? ORDER BY createdAt DESC LIMIT 100")
    .all(webhookId) as Array<Record<string, string>>;

  return rows.map((row) => ({
    id: row.id,
    webhookId: row.webhookId,
    targetUrl: row.targetUrl,
    status: row.status ? Number(row.status) : null,
    responseHeaders: JSON.parse(row.responseHeaders),
    responseBody: row.responseBody,
    durationMs: Number(row.durationMs),
    error: row.error,
    createdAt: row.createdAt
  }));
}

export function getDashboardMetrics(userId: string): {
  totalWebhooks: number;
  totalReplays: number;
  providerCounts: Array<{ provider: string; total: number }>;
  volumeByDay: Array<{ day: string; total: number }>;
} {
  const totalWebhooks = Number(
    (db.prepare("SELECT COUNT(*) as count FROM webhooks WHERE userId = ?").get(userId) as { count: number }).count
  );

  const totalReplays = Number(
    (
      db
        .prepare(
          `SELECT COUNT(*) as count
           FROM replays r
           JOIN webhooks w ON w.id = r.webhookId
           WHERE w.userId = ?`
        )
        .get(userId) as { count: number }
    ).count
  );

  const providerCounts = db
    .prepare(
      `SELECT provider, COUNT(*) as total
       FROM webhooks
       WHERE userId = ?
       GROUP BY provider
       ORDER BY total DESC`
    )
    .all(userId) as Array<{ provider: string; total: number }>;

  const volumeByDay = db
    .prepare(
      `SELECT substr(receivedAt, 1, 10) as day, COUNT(*) as total
       FROM webhooks
       WHERE userId = ?
       GROUP BY day
       ORDER BY day DESC
       LIMIT 14`
    )
    .all(userId) as Array<{ day: string; total: number }>;

  return {
    totalWebhooks,
    totalReplays,
    providerCounts,
    volumeByDay: volumeByDay.reverse()
  };
}

function deserializeWebhookRow(row: Record<string, string>): WebhookRecord {
  return {
    id: row.id,
    userId: row.userId,
    provider: row.provider,
    eventType: row.eventType,
    method: row.method,
    path: row.path,
    query: row.query,
    ip: row.ip,
    headers: JSON.parse(row.headers),
    body: row.body,
    bodyType: row.bodyType,
    receivedAt: row.receivedAt
  };
}
