import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { setAccessGrantStatus, upsertAccessGrant } from "@/lib/db";
import { extractAccessGrantFromStripeEvent, verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

const stripeEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.object({}).catchall(z.unknown())
  })
});

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  if (!verifyStripeWebhookSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const parsedJson = (() => {
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  })();

  if (!parsedJson) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parseResult = stripeEventSchema.safeParse(parsedJson);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid Stripe event payload" }, { status: 400 });
  }

  const event = parseResult.data;
  const grant = extractAccessGrantFromStripeEvent(event);

  if (!grant) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (grant.active) {
    await upsertAccessGrant({
      email: grant.email,
      source: "stripe",
      stripeCustomerId: grant.stripeCustomerId,
      checkoutSessionId: grant.checkoutSessionId,
      lastEventId: event.id,
      active: true
    });
  } else {
    await setAccessGrantStatus(grant.email, false);
  }

  return NextResponse.json({ received: true });
}
