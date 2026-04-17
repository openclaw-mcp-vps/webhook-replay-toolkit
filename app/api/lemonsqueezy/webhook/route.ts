import { NextResponse } from "next/server";
import { ensureDb, ensureUser, pool } from "@/lib/db";
import { inferSubscriptionState, type LemonWebhookPayload, verifyLemonSignature } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!verifyLemonSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LemonWebhookPayload;
  const eventName = payload.meta?.event_name;

  if (!eventName) {
    return NextResponse.json({ error: "Missing event name" }, { status: 400 });
  }

  const userId =
    payload.meta?.custom_data?.user_id ?? payload.data?.attributes?.custom_data?.user_id ?? payload.data?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Missing user mapping" }, { status: 400 });
  }

  const state = inferSubscriptionState(eventName, payload);
  if (state === "unknown") {
    return NextResponse.json({ received: true });
  }

  await ensureDb();
  await ensureUser(userId);

  const orderId = payload.data?.id ?? null;
  const email = payload.data?.attributes?.user_email ?? payload.data?.attributes?.customer_email ?? null;

  await pool.query(
    `INSERT INTO subscriptions (user_id, status, order_id, customer_email, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET status = EXCLUDED.status,
                   order_id = EXCLUDED.order_id,
                   customer_email = EXCLUDED.customer_email,
                   updated_at = NOW()`,
    [userId, state, orderId, email],
  );

  return NextResponse.json({ received: true, state });
}
