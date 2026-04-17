import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function initLemonSqueezy(): void {
  lemonSqueezySetup({});
}

export function getHostedCheckoutUrl(userId: string): string {
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!productId) {
    return "";
  }

  const base = `https://checkout.lemonsqueezy.com/buy/${productId}`;
  const params = new URLSearchParams({
    "checkout[custom][user_id]": userId,
    "checkout[success_url]": `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard?paid=1`
  });

  return `${base}?${params.toString()}`;
}
