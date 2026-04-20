import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createCheckoutStateToken } from "@/lib/paywall";

export async function POST(request: Request) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;

  if (!productId || !storeId) {
    return NextResponse.json(
      {
        error:
          "Missing Lemon Squeezy public env vars. Add NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID and NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID before checkout."
      },
      { status: 500 }
    );
  }

  const requestUrl = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;
  const checkoutState = createCheckoutStateToken(session.user.id);
  const successUrl = `${baseUrl}/api/checkout/success?state=${encodeURIComponent(checkoutState)}`;

  const checkoutUrl = new URL(`https://checkout.lemonsqueezy.com/buy/${productId}`);
  checkoutUrl.searchParams.set("checkout[embed]", "1");
  checkoutUrl.searchParams.set("checkout[media]", "0");
  checkoutUrl.searchParams.set("checkout[logo]", "0");
  checkoutUrl.searchParams.set("checkout[desc]", "0");
  checkoutUrl.searchParams.set("checkout[custom][store_id]", storeId);
  checkoutUrl.searchParams.set("checkout[success_url]", successUrl);
  checkoutUrl.searchParams.set("checkout[custom][user_id]", session.user.id);

  return NextResponse.json({ checkoutUrl: checkoutUrl.toString() });
}
