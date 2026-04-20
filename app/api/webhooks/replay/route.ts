import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerAuthSession } from "@/lib/auth";
import { getPaymentStatus, getWebhookById, insertReplayLog } from "@/lib/db";
import {
  PAYWALL_COOKIE_NAME,
  verifyPaidCookieValue
} from "@/lib/paywall";
import { replayCapturedWebhook } from "@/lib/webhook-proxy";

const replaySchema = z.object({
  webhookId: z.string().uuid(),
  targetUrl: z.string().url(),
  timeoutMs: z.number().int().min(500).max(30_000).optional()
});

export async function POST(request: Request) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const paidCookie = cookieStore.get(PAYWALL_COOKIE_NAME)?.value;

  if (!verifyPaidCookieValue(paidCookie, session.user.id)) {
    const paymentStatus = await getPaymentStatus(session.user.id);

    if (paymentStatus !== "active") {
      return NextResponse.json(
        { error: "Upgrade required before replay is enabled" },
        { status: 402 }
      );
    }
  }

  const parsed = replaySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid replay payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const webhook = await getWebhookById(session.user.id, parsed.data.webhookId);

  if (!webhook) {
    return NextResponse.json(
      { error: "Webhook record not found" },
      { status: 404 }
    );
  }

  const replay = await replayCapturedWebhook({
    webhook,
    targetUrl: parsed.data.targetUrl,
    timeoutMs: parsed.data.timeoutMs
  });

  await insertReplayLog({
    webhookId: webhook.id,
    userId: session.user.id,
    targetUrl: parsed.data.targetUrl,
    success: replay.success,
    statusCode: replay.statusCode,
    responseHeaders: replay.responseHeaders,
    responseBody: replay.responseBody,
    durationMs: replay.durationMs,
    errorMessage: replay.errorMessage
  });

  return NextResponse.json(replay);
}
