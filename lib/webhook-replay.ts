import axios from "axios";
import { z } from "zod";
import { db } from "@/lib/db";

export const replaySchema = z.object({
  webhookId: z.string().min(1),
  targetUrl: z.string().url(),
  includeOriginalHeaders: z.boolean().default(true),
  overrideMethod: z.string().optional()
});

export async function replayWebhook(input: z.infer<typeof replaySchema>) {
  const event = await db.webhookEvent.findUnique({
    where: { id: input.webhookId }
  });

  if (!event) {
    throw new Error("Webhook event not found.");
  }

  const parsedHeaders = event.headers ? (JSON.parse(event.headers) as Record<string, string>) : {};

  const outgoingHeaders: Record<string, string> = {
    "content-type": parsedHeaders["content-type"] || "application/json",
    "x-webhook-replay-tool": "webhook-replay-toolkit",
    "x-webhook-original-id": event.id,
    "x-webhook-source": event.source
  };

  if (input.includeOriginalHeaders) {
    for (const [key, value] of Object.entries(parsedHeaders)) {
      const lower = key.toLowerCase();
      if (["host", "content-length", "connection", "accept-encoding"].includes(lower)) {
        continue;
      }
      outgoingHeaders[key] = value;
    }
  }

  const method = input.overrideMethod || event.method;

  const response = await axios.request({
    url: input.targetUrl,
    method,
    data: event.body,
    timeout: 20000,
    headers: outgoingHeaders,
    validateStatus: () => true
  });

  await db.webhookEvent.update({
    where: { id: event.id },
    data: {
      replayCount: { increment: 1 },
      lastReplayAt: new Date()
    }
  });

  return {
    status: response.status,
    statusText: response.statusText,
    data:
      typeof response.data === "string"
        ? response.data.slice(0, 5000)
        : JSON.stringify(response.data).slice(0, 5000)
  };
}
