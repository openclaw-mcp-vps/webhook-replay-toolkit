import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPaidAccess } from "@/lib/paywall";
import { replaySchema, replayWebhook } from "@/lib/webhook-replay";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paid = await hasPaidAccess(session.user.id);
    if (!paid) {
      return NextResponse.json({ error: "Upgrade required" }, { status: 402 });
    }

    const parsed = replaySchema.parse(await request.json());

    const event = await db.webhookEvent.findUnique({ where: { id: parsed.webhookId } });
    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const replayResult = await replayWebhook(parsed);
    return NextResponse.json(replayResult);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Replay failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
