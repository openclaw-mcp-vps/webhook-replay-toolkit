import { NextResponse } from "next/server";
import { findUserByCaptureIdentifier, saveWebhook } from "@/lib/db";

export const dynamic = "force-dynamic";

function detectSource(headers: Record<string, string>): "stripe" | "shopify" | "github" | "unknown" {
  if (headers["stripe-signature"]) return "stripe";
  if (headers["x-shopify-topic"] || headers["x-shopify-hmac-sha256"]) return "shopify";
  if (headers["x-github-event"] || headers["x-hub-signature-256"]) return "github";
  return "unknown";
}

async function capture(request: Request, captureIdentifier: string) {
  const user = await findUserByCaptureIdentifier(captureIdentifier);
  if (!user) {
    return NextResponse.json({ error: "Invalid capture URL." }, { status: 404 });
  }

  const arrayBuffer = await request.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const contentType = request.headers.get("content-type") ?? "application/octet-stream";
  const isTextLike =
    contentType.includes("json") ||
    contentType.includes("text") ||
    contentType.includes("xml") ||
    contentType.includes("x-www-form-urlencoded");

  const headers = Object.fromEntries(
    Array.from(request.headers.entries()).map(([k, v]) => [k.toLowerCase(), v])
  );

  const query = Object.fromEntries(new URL(request.url).searchParams.entries());

  const bodyText = isTextLike ? buffer.toString("utf-8") : "";

  await saveWebhook({
    userId: user.id,
    method: request.method,
    path: new URL(request.url).pathname,
    query,
    headers,
    bodyText,
    bodyBase64: !isTextLike ? buffer.toString("base64") : undefined,
    sourceHint: detectSource(headers),
    contentType,
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown"
  });

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  return capture(request, userId);
}

export async function GET(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  return capture(request, userId);
}

export async function PUT(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  return capture(request, userId);
}

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  return capture(request, userId);
}

export async function DELETE(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  return capture(request, userId);
}
