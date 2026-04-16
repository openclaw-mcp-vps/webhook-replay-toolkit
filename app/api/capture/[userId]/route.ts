import { NextResponse } from "next/server";
import { z } from "zod";
import { recordWebhookCapture } from "@/lib/webhook-capture";

const paramsSchema = z.object({
  userId: z.string().min(1)
});

async function handleCapture(request: Request, context: { params: Promise<{ userId: string }> }) {
  const params = paramsSchema.parse(await context.params);
  const body = await request.text();
  const requestUrl = new URL(request.url);

  const event = await recordWebhookCapture({
    userId: params.userId,
    method: request.method,
    path: requestUrl.pathname,
    query: requestUrl.search,
    body,
    headers: request.headers
  });

  return NextResponse.json({
    status: "captured",
    id: event.id,
    receivedAt: event.createdAt.toISOString()
  });
}

export const dynamic = "force-dynamic";

export { handleCapture as GET, handleCapture as POST, handleCapture as PUT, handleCapture as PATCH, handleCapture as DELETE };
