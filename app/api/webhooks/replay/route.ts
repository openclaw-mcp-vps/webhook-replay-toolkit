import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createReplay, getWebhookById } from "@/lib/database";

const replaySchema = z.object({
  webhookId: z.string().uuid(),
  targetUrl: z.string().url(),
  forwardOriginalHeaders: z.boolean().default(true),
  timeoutMs: z.number().min(1000).max(30000).default(8000)
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = replaySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid replay payload" }, { status: 400 });
  }

  const webhook = getWebhookById(session.user.id, parsed.data.webhookId);
  if (!webhook) {
    return NextResponse.json({ ok: false, message: "Webhook not found" }, { status: 404 });
  }

  const headers: Record<string, string> = {
    "x-webhook-replay": "1",
    "x-webhook-original-id": webhook.id
  };

  if (parsed.data.forwardOriginalHeaders) {
    for (const [key, value] of Object.entries(webhook.headers)) {
      if (["host", "content-length", "accept-encoding", "connection"].includes(key.toLowerCase())) {
        continue;
      }
      headers[key] = value;
    }
  }

  const startedAt = Date.now();

  try {
    const contentType = webhook.headers["content-type"] || "";
    const payload = contentType.includes("application/json") ? safeJsonParse(webhook.body) : webhook.body;

    const response = await axios.request({
      url: parsed.data.targetUrl,
      method: webhook.method as "POST" | "PUT" | "PATCH" | "DELETE" | "GET",
      headers,
      data: payload,
      timeout: parsed.data.timeoutMs,
      validateStatus: () => true
    });

    const replay = createReplay({
      webhookId: webhook.id,
      targetUrl: parsed.data.targetUrl,
      status: response.status,
      responseHeaders: objectHeaderMap(response.headers),
      responseBody:
        typeof response.data === "string" ? response.data.slice(0, 5000) : JSON.stringify(response.data, null, 2).slice(0, 5000),
      durationMs: Date.now() - startedAt,
      error: null
    });

    return NextResponse.json({
      ok: true,
      message: `Replay sent (${response.status}) in ${replay.durationMs}ms`
    });
  } catch (error) {
    const replay = createReplay({
      webhookId: webhook.id,
      targetUrl: parsed.data.targetUrl,
      status: null,
      responseHeaders: {},
      responseBody: "",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown replay error"
    });

    return NextResponse.json(
      {
        ok: false,
        message: `Replay failed after ${replay.durationMs}ms: ${replay.error}`
      },
      { status: 502 }
    );
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function objectHeaderMap(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)])
  );
}
