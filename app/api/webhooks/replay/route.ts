import { performance } from "perf_hooks";
import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppSession } from "@/lib/auth";
import { addReplayLog, getWebhookById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/paywall";

const replaySchema = z.object({
  webhookId: z.string().min(1),
  targetUrl: z.string().url()
});

function buildReplayHeaders(headers: Record<string, string>): Record<string, string> {
  const safe = { ...headers };
  delete safe.host;
  delete safe["content-length"];
  safe["x-webhook-replay"] = "webhook-replay-toolkit";
  return safe;
}

export async function POST(request: Request) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasPaidAccess(session.user.id))) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 402 });
  }

  const parsed = replaySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const webhook = await getWebhookById(session.user.id, parsed.data.webhookId);
  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found." }, { status: 404 });
  }

  const requestBody = webhook.bodyText
    ? webhook.bodyText
    : webhook.bodyBase64
      ? Buffer.from(webhook.bodyBase64, "base64")
      : "";

  const start = performance.now();
  let statusCode = 0;
  let responseBody = "";

  try {
    const response = await axios.request({
      url: parsed.data.targetUrl,
      method: webhook.method as "GET",
      headers: buildReplayHeaders(webhook.headers),
      data: requestBody,
      maxRedirects: 5,
      timeout: 15000,
      validateStatus: () => true
    });

    statusCode = response.status;
    responseBody =
      typeof response.data === "string" ? response.data.slice(0, 2000) : JSON.stringify(response.data).slice(0, 2000);
  } catch (error) {
    statusCode = 0;
    responseBody = error instanceof Error ? error.message : "Unknown replay error";
  }

  const durationMs = Math.round(performance.now() - start);

  await addReplayLog({
    webhookId: webhook.id,
    userId: session.user.id,
    targetUrl: parsed.data.targetUrl,
    statusCode,
    responseBody,
    durationMs
  });

  return NextResponse.json({
    statusCode,
    durationMs,
    responseBody
  });
}
