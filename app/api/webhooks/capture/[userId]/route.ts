import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createWebhook } from "@/lib/database";

const paramsSchema = z.object({
  userId: z.string().min(8)
});

function detectProvider(headers: Record<string, string>): { provider: string; eventType: string } {
  if (headers["stripe-signature"]) {
    return { provider: "Stripe", eventType: headers["stripe-event"] || "stripe.event" };
  }

  if (headers["x-shopify-topic"]) {
    return { provider: "Shopify", eventType: headers["x-shopify-topic"] };
  }

  if (headers["x-github-event"]) {
    return { provider: "GitHub", eventType: headers["x-github-event"] };
  }

  return { provider: "Unknown", eventType: headers["x-event-type"] || "unknown.event" };
}

export async function POST(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const rawParams = await context.params;
  const parsedParams = paramsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const provider = detectProvider(headers);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const query = request.nextUrl.searchParams.toString();

  const record = createWebhook({
    userId: parsedParams.data.userId,
    provider: provider.provider,
    eventType: provider.eventType,
    method: request.method,
    path: request.nextUrl.pathname,
    query,
    ip,
    headers,
    body,
    bodyType: headers["content-type"] || "unknown"
  });

  return NextResponse.json({ received: true, id: record.id });
}

export async function GET() {
  return NextResponse.json({ error: "POST required" }, { status: 405 });
}
