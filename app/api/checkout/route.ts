import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { getHostedCheckoutUrl } from "@/lib/lemonsqueezy";

export async function POST() {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkoutUrl = getHostedCheckoutUrl(session.user.id);
  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID environment variable." },
      { status: 500 }
    );
  }

  return NextResponse.json({ checkoutUrl });
}
