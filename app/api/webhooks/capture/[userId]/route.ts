import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ensureDb, ensureUser, pool } from "@/lib/db";

function inferProvider(headers: Headers) {
  if (headers.get("stripe-signature")) return "stripe";
  if (headers.get("x-shopify-hmac-sha256")) return "shopify";
  if (headers.get("x-github-event")) return "github";
  if (headers.get("x-slack-signature")) return "slack";
  if (headers.get("x-postmark-signature")) return "postmark";
  if (headers.get("x-resend-signature")) return "resend";
  return "unknown";
}

async function capture(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const requestId = randomUUID();
  const body = await req.text();
  const parsedUrl = new URL(req.url);

  const headers = Object.fromEntries(req.headers.entries());
  const provider = inferProvider(req.headers);
  const contentType = req.headers.get("content-type");

  await ensureDb();
  await ensureUser(userId);

  await pool.query(
    `INSERT INTO webhooks (id, user_id, provider, method, path, query_string, headers, body, content_type, body_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)`,
    [
      requestId,
      userId,
      provider,
      req.method,
      parsedUrl.pathname,
      parsedUrl.searchParams.toString() || null,
      JSON.stringify(headers),
      body,
      contentType,
      Buffer.byteLength(body, "utf8"),
    ],
  );

  return NextResponse.json({
    ok: true,
    id: requestId,
    provider,
    capturedAt: new Date().toISOString(),
  });
}

export const GET = capture;
export const POST = capture;
export const PUT = capture;
export const PATCH = capture;
export const DELETE = capture;
export const OPTIONS = capture;
