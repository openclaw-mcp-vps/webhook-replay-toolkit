import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { ensureDb, pool } from "@/lib/db";
import { PAID_COOKIE, USER_COOKIE } from "@/lib/constants";

const replaySchema = z.object({
  webhookId: z.string().uuid(),
  targetUrl: z.string().url(),
});

function sanitizeForwardHeaders(headers: Record<string, unknown>) {
  const blocked = new Set([
    "host",
    "content-length",
    "connection",
    "accept-encoding",
    "transfer-encoding",
  ]);

  return Object.fromEntries(
    Object.entries(headers)
      .filter(([key]) => !blocked.has(key.toLowerCase()))
      .map(([key, value]) => [key, String(value)]),
  );
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const store = await cookies();
  const userId = store.get(USER_COOKIE)?.value;
  const paid = store.get(PAID_COOKIE)?.value === "1";

  if (!userId || !paid) {
    return NextResponse.json({ error: "Paid access required" }, { status: 403 });
  }

  const parsed = replaySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 });
  }

  await ensureDb();

  const webhookRes = await pool.query<{
    id: string;
    method: string;
    headers: Record<string, unknown>;
    body: string;
  }>(
    `SELECT id, method, headers, body
     FROM webhooks WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [parsed.data.webhookId, userId],
  );

  const webhook = webhookRes.rows[0];
  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  const replayId = randomUUID();
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("Replay request timed out"), 15000);

  try {
    const response = await fetch(parsed.data.targetUrl, {
      method: webhook.method,
      headers: sanitizeForwardHeaders(webhook.headers),
      body: webhook.body,
      signal: controller.signal,
      redirect: "manual",
    });
    const responseText = await response.text();
    clearTimeout(timeout);

    const durationMs = Date.now() - start;
    const responseHeaders = Object.fromEntries(response.headers.entries());

    await pool.query(
      `INSERT INTO replays (id, webhook_id, user_id, target_url, status_code, response_headers, response_body, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)`,
      [
        replayId,
        webhook.id,
        userId,
        parsed.data.targetUrl,
        response.status,
        JSON.stringify(responseHeaders),
        responseText.slice(0, 4000),
        durationMs,
      ],
    );

    return NextResponse.json({
      id: replayId,
      status: response.status,
      durationMs,
      data: responseText.slice(0, 4000),
    });
  } catch (error) {
    clearTimeout(timeout);
    const durationMs = Date.now() - start;
    const message = error instanceof Error ? error.message : "Unknown replay error";

    await pool.query(
      `INSERT INTO replays (id, webhook_id, user_id, target_url, duration_ms, error)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [replayId, webhook.id, userId, parsed.data.targetUrl, durationMs, message],
    );

    return NextResponse.json({ error: message, durationMs }, { status: 502 });
  }
}
