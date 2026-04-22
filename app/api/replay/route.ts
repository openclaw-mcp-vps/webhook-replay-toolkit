import { randomUUID } from "node:crypto";

import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getWebhookById, recordReplayAttempt } from "@/lib/db";
import { enqueueReplayJob } from "@/lib/redis";

const replaySchema = z.object({
  webhookId: z.string().uuid(),
  targetUrl: z.string().url().refine((value) => /^https?:\/\//.test(value), "Target must start with http:// or https://"),
  method: z.enum(["POST", "PUT", "PATCH"]).default("POST"),
  preserveHeaders: z.boolean().default(true),
  timeoutMs: z.number().int().min(1000).max(45000).default(12000)
});

const blockedHeaders = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-port",
  "x-forwarded-proto",
  "x-real-ip"
]);

function replayHeaders(original: Record<string, string>, preserveHeaders: boolean) {
  if (!preserveHeaders) {
    return {};
  }

  return Object.entries(original).reduce<Record<string, string>>((acc, [key, value]) => {
    const normalizedKey = key.toLowerCase();

    if (blockedHeaders.has(normalizedKey)) {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

function normalizeResponseHeaders(headers: Record<string, string | string[] | undefined>) {
  return Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "undefined") {
      return acc;
    }

    acc[key.toLowerCase()] = Array.isArray(value) ? value.join(",") : String(value);
    return acc;
  }, {});
}

export async function POST(request: NextRequest) {
  let replayRequest: z.infer<typeof replaySchema> | null = null;
  let webhookIdForFailure: string | null = null;

  try {
    replayRequest = replaySchema.parse(await request.json());
    const webhook = await getWebhookById(replayRequest.webhookId);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook event not found." }, { status: 404 });
    }

    webhookIdForFailure = webhook.id;

    const queued = await enqueueReplayJob({
      id: randomUUID(),
      webhookId: webhook.id,
      targetUrl: replayRequest.targetUrl,
      queuedAt: new Date().toISOString()
    }).catch(() => false);

    const headers = replayHeaders(webhook.headers, replayRequest.preserveHeaders);
    headers["x-webhook-replay-toolkit"] = "1";
    headers["x-webhook-original-id"] = webhook.id;
    headers["x-webhook-provider"] = webhook.provider;

    if (!Object.keys(headers).some((key) => key.toLowerCase() === "content-type") && webhook.contentType) {
      headers["content-type"] = webhook.contentType;
    }

    const startedAt = Date.now();

    const response = await axios.request<string>({
      url: replayRequest.targetUrl,
      method: replayRequest.method,
      headers,
      data: webhook.body,
      timeout: replayRequest.timeoutMs,
      responseType: "text",
      transformResponse: [(value) => value],
      validateStatus: () => true
    });

    const durationMs = Date.now() - startedAt;

    await recordReplayAttempt({
      webhookId: webhook.id,
      targetUrl: replayRequest.targetUrl,
      method: replayRequest.method,
      statusCode: response.status,
      durationMs,
      responseHeaders: normalizeResponseHeaders(response.headers as Record<string, string | string[] | undefined>),
      responseBody: typeof response.data === "string" ? response.data.slice(0, 20000) : ""
    });

    return NextResponse.json({
      ok: true,
      statusCode: response.status,
      durationMs,
      replayQueued: queued
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid replay request." }, { status: 400 });
    }

    if (error instanceof AxiosError) {
      if (webhookIdForFailure && replayRequest) {
        await recordReplayAttempt({
          webhookId: webhookIdForFailure,
          targetUrl: replayRequest.targetUrl,
          method: replayRequest.method,
          statusCode: error.response?.status ?? null,
          durationMs: 0,
          responseHeaders: {},
          responseBody: error.message
        }).catch(() => undefined);
      }

      return NextResponse.json(
        {
          error: `Replay request failed: ${error.message}`
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Replay failed"
      },
      { status: 500 }
    );
  }
}
