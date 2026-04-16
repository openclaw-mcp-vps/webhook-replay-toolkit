import { headers as nextHeaders } from "next/headers";
import { db } from "@/lib/db";

const SOURCE_HINTS: Record<string, string> = {
  "stripe-signature": "Stripe",
  "x-shopify-topic": "Shopify",
  "x-github-event": "GitHub",
  "x-slack-signature": "Slack",
  "x-resend-signature": "Resend",
  "x-postmark-signature": "Postmark"
};

export function detectWebhookSource(headers: Headers): string {
  const lowerHeaders = new Set(Array.from(headers.keys()).map((key) => key.toLowerCase()));
  for (const [header, provider] of Object.entries(SOURCE_HINTS)) {
    if (lowerHeaders.has(header)) {
      return provider;
    }
  }
  return "Unknown";
}

export async function recordWebhookCapture(input: {
  userId: string;
  method: string;
  path: string;
  query: string;
  body: string;
  headers: Headers;
}) {
  const serializableHeaders = Object.fromEntries(input.headers.entries());

  await db.user.upsert({
    where: { id: input.userId },
    create: {
      id: input.userId,
      name: `Webhook User ${input.userId.slice(0, 8)}`
    },
    update: {}
  });

  return db.webhookEvent.create({
    data: {
      userId: input.userId,
      source: detectWebhookSource(input.headers),
      method: input.method,
      path: input.path,
      query: input.query,
      headers: JSON.stringify(serializableHeaders),
      body: input.body,
      bodySize: Buffer.byteLength(input.body)
    }
  });
}

export async function currentRequestOrigin() {
  const hdrs = await nextHeaders();
  const host = hdrs.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
