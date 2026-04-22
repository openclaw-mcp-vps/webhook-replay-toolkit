import { NextRequest, NextResponse } from "next/server";

import { listWebhooks } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") ?? undefined;
  const search = searchParams.get("q") ?? undefined;
  const limitParam = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitParam) ? limitParam : 50;

  try {
    const items = await listWebhooks({
      provider,
      search,
      limit
    });

    return NextResponse.json({
      items,
      count: items.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not load webhook events"
      },
      { status: 500 }
    );
  }
}
