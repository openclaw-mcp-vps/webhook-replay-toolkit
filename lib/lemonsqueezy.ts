import { createHmac } from "crypto";
import { createCheckout, lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function signCheckoutToken(userId: string): string {
  return createHmac("sha256", getRequiredEnv("LEMON_SQUEEZY_WEBHOOK_SECRET")).update(userId).digest("hex");
}

export function verifyCheckoutToken(userId: string, sig: string): boolean {
  return signCheckoutToken(userId) === sig;
}

export async function createLemonCheckoutUrl(userId: string, email: string, origin: string): Promise<string> {
  const apiKey = getRequiredEnv("LEMON_SQUEEZY_API_KEY");
  const storeId = Number(getRequiredEnv("NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID"));
  const productId = Number(getRequiredEnv("NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID"));

  lemonSqueezySetup({ apiKey, onError: (error) => console.error("Lemon Squeezy setup failed", error) });

  const sig = signCheckoutToken(userId);
  const checkout = await createCheckout(storeId, productId, {
    checkoutOptions: {
      embed: true,
      media: false,
      logo: false
    },
    checkoutData: {
      email,
      custom: {
        user_id: userId
      }
    },
    productOptions: {
      enabledVariants: [],
      redirectUrl: `${origin}/api/checkout?success=1&user=${encodeURIComponent(userId)}&sig=${sig}`
    }
  });

  const checkoutUrl = checkout.data?.data?.attributes?.url;
  if (!checkoutUrl) {
    throw new Error("Unable to create Lemon Squeezy checkout URL");
  }

  return checkoutUrl;
}
