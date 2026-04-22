import { NextRequest, NextResponse } from "next/server";

import { recordWebhook } from "@/lib/db";

export const dynamic = "force-dynamic";

function detectProvider(headers: Record<string, string>, pathSegments: string[]) {
  const firstSegment = pathSegments[0]?.toLowerCase() ?? "unknown";

  if (headers["stripe-signature"]) {
    return "stripe";
  }

  if (headers["x-shopify-topic"] || headers["x-shopify-hmac-sha256"]) {
    return "shopify";
  }

  if (headers["x-github-event"] || headers["x-hub-signature-256"]) {
    return "github";
  }

  if (["stripe", "shopify", "github", "slack", "resend", "postmark"].includes(firstSegment)) {
    return firstSegment;
  }

  return firstSegment || "unknown";
}

function extractSignature(headers: Record<string, string>) {
  return (
    headers["stripe-signature"] ??
    headers["x-shopify-hmac-sha256"] ??
    headers["x-hub-signature-256"] ??
    headers["x-slack-signature"] ??
    null
  );
}

function normalizeHeaders(request: NextRequest) {
  const result: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });

  return result;
}

function parseJsonIfPossible(rawBody: string, contentType: string | null) {
  if (!rawBody.trim()) {
    return null;
  }

  if (!contentType?.toLowerCase().includes("json")) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function extractQuery(url: URL) {
  const result: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

function sourceIpFromRequest(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

async function captureWebhook(
  request: NextRequest,
  context: {
    params: Promise<{ slug: string[] }>;
  }
) {
  try {
    const { slug } = await context.params;
    const headers = normalizeHeaders(request);
    const contentType = request.headers.get("content-type");
    const rawBody = await request.text();
    const parsedBody = parseJsonIfPossible(rawBody, contentType);
    const requestUrl = new URL(request.url);

    const id = await recordWebhook({
      provider: detectProvider(headers, slug),
      method: request.method.toUpperCase(),
      path: `/${slug.join("/")}`,
      query: extractQuery(requestUrl),
      headers,
      body: rawBody,
      parsedBody,
      sourceIp: sourceIpFromRequest(request),
      contentType,
      signature: extractSignature(headers)
    });

    return NextResponse.json(
      {
        ok: true,
        id,
        capturedAt: new Date().toISOString()
      },
      {
        status: 202
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Webhook capture failed"
      },
      {
        status: 500
      }
    );
  }
}

export const POST = captureWebhook;
export const PUT = captureWebhook;
export const PATCH = captureWebhook;
export const GET = captureWebhook;
