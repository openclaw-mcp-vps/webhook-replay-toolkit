import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { setPaymentStatus } from "@/lib/db";

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data?: {
    id?: string;
    attributes?: {
      custom_data?: {
        user_id?: string;
      };
      status?: string;
      user_email?: string;
    };
  };
};

function verifyLemonSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
  } catch {
    return false;
  }
}

function mapEventToStatus(eventName: string): "active" | "inactive" | "past_due" {
  if (
    eventName === "subscription_created" ||
    eventName === "subscription_resumed" ||
    eventName === "subscription_payment_success" ||
    eventName === "subscription_payment_recovered" ||
    eventName === "order_created"
  ) {
    return "active";
  }

  if (eventName === "subscription_payment_failed") {
    return "past_due";
  }

  return "inactive";
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Lemon Squeezy signature" },
      { status: 401 }
    );
  }

  const rawBody = await request.text();

  if (!verifyLemonSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: LemonWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as LemonWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
  const eventName = payload.meta?.event_name ?? "";
  const userId =
    payload.meta?.custom_data?.user_id ||
    payload.data?.attributes?.custom_data?.user_id;

  if (userId) {
    await setPaymentStatus({
      userId,
      status: mapEventToStatus(eventName),
      orderId: payload.data?.id ?? null
    });
  }

  return NextResponse.json({ received: true });
}
