import { createHmac, timingSafeEqual } from "node:crypto";

export type StripeEventObject = {
  id?: string;
  email?: string;
  customer?: string;
  customer_email?: string;
  customer_details?: {
    email?: string;
  };
};

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: StripeEventObject;
  };
};

function parseStripeSignatureHeader(signatureHeader: string) {
  const parts = signatureHeader.split(",").map((part) => part.trim());
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    if (part.startsWith("t=")) {
      timestamp = part.slice(2);
    }

    if (part.startsWith("v1=")) {
      signatures.push(part.slice(3));
    }
  }

  return { timestamp, signatures };
}

function secureEquals(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string, secret: string) {
  const parsed = parseStripeSignatureHeader(signatureHeader);

  if (!parsed.timestamp || parsed.signatures.length === 0) {
    return false;
  }

  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  return parsed.signatures.some((signature) => secureEquals(expected, signature));
}

export function extractAccessGrantFromStripeEvent(event: StripeWebhookEvent) {
  const obj = event.data.object;
  const email = obj.customer_details?.email ?? obj.customer_email ?? obj.email;

  if (!email) {
    return null;
  }

  const deactivateEventTypes = new Set([
    "customer.subscription.deleted",
    "invoice.payment_failed",
    "customer.subscription.paused"
  ]);

  return {
    email,
    stripeCustomerId: obj.customer ?? null,
    checkoutSessionId: obj.id ?? null,
    active: !deactivateEventTypes.has(event.type)
  };
}
