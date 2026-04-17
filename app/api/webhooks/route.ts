import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppSession } from "@/lib/auth";
import { listWebhooks } from "@/lib/db";
import { hasPaidAccess } from "@/lib/paywall";

const querySchema = z.object({
  source: z.enum(["stripe", "shopify", "github", "unknown"]).optional(),
  q: z.string().optional()
});

export async function GET(request: Request) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasPaidAccess(session.user.id))) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 402 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    source: url.searchParams.get("source") ?? undefined,
    q: url.searchParams.get("q") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const all = await listWebhooks(session.user.id);
  const filtered = all.filter((w) => {
    if (parsed.data.source && w.sourceHint !== parsed.data.source) return false;
    if (parsed.data.q) {
      const term = parsed.data.q.toLowerCase();
      return (
        w.path.toLowerCase().includes(term) ||
        w.method.toLowerCase().includes(term) ||
        JSON.stringify(w.headers).toLowerCase().includes(term) ||
        w.bodyText.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return NextResponse.json({ webhooks: filtered });
}
