import crypto from "node:crypto";

export type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      user_email?: string;
      customer_email?: string;
      first_subscription_item?: {
        subscription_id?: number;
      };
      custom_data?: {
        user_id?: string;
      };
    };
  };
};

export function verifyLemonSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function getLemonCheckoutUrl(userId: string) {
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;

  if (!productId || !storeId) {
    return null;
  }

  const base = `https://checkout.lemonsqueezy.com/buy/${productId}`;
  const params = new URLSearchParams({
    "checkout[custom][user_id]": userId,
    "checkout[media]": "0",
    "checkout[dark]": "1",
    "checkout[embed]": "1",
    "checkout[logo]": "0",
    "checkout[desc]": "0",
    "checkout[store_id]": storeId,
  });

  return `${base}?${params.toString()}`;
}

export function inferSubscriptionState(eventName: string, payload: LemonWebhookPayload) {
  if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
    return "inactive";
  }

  if (eventName === "subscription_updated") {
    const status = payload.data?.attributes?.status;
    return status === "cancelled" || status === "expired" ? "inactive" : "active";
  }

  if (eventName === "order_created" || eventName === "subscription_created") {
    return "active";
  }

  return "unknown";
}
