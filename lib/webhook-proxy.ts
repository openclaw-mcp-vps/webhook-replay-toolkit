import axios from "axios";
import { type WebhookRecord } from "@/lib/db";

const hopByHopHeaders = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "x-forwarded-host",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-vercel-id",
  "x-vercel-ip-city",
  "x-vercel-ip-country",
  "x-vercel-ip-continent",
  "x-vercel-ip-latitude",
  "x-vercel-ip-longitude",
  "x-vercel-ip-timezone"
]);

export function detectWebhookProvider(headers: Record<string, string>): string {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  if (normalized["stripe-signature"]) {
    return "stripe";
  }

  if (normalized["x-shopify-topic"] || normalized["x-shopify-hmac-sha256"]) {
    return "shopify";
  }

  if (normalized["x-github-event"] || normalized["x-hub-signature-256"]) {
    return "github";
  }

  if (normalized["x-slack-signature"]) {
    return "slack";
  }

  if (normalized["x-resend-signature"]) {
    return "resend";
  }

  if (normalized["x-postmark-signature"]) {
    return "postmark";
  }

  return "custom";
}

export function getSourceIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return headers.get("x-real-ip") || null;
}

export function normalizeHeadersForStorage(
  headers: Headers
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    result[key.toLowerCase()] = value;
  }

  return result;
}

function normalizeHeadersForReplay(
  headers: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();

    if (!hopByHopHeaders.has(lower)) {
      result[key] = value;
    }
  }

  return result;
}

function toResponseHeaders(
  headers:
    | Record<string, string>
    | Record<string, string[]>
    | Record<string, unknown>
    | undefined
): Record<string, string> {
  if (!headers) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(", ") : String(value)
    ])
  );
}

export async function replayCapturedWebhook(input: {
  webhook: WebhookRecord;
  targetUrl: string;
  timeoutMs?: number;
}): Promise<{
  success: boolean;
  statusCode: number | null;
  durationMs: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  errorMessage: string | null;
}> {
  const startedAt = Date.now();

  try {
    const response = await axios.request({
      url: input.targetUrl,
      method: input.webhook.method,
      headers: normalizeHeadersForReplay(input.webhook.headers),
      data: input.webhook.body,
      timeout: input.timeoutMs ?? 15_000,
      maxBodyLength: 5 * 1024 * 1024,
      validateStatus: () => true
    });

    const durationMs = Date.now() - startedAt;
    const responseBody =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data, null, 2);

    return {
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      durationMs,
      responseHeaders: toResponseHeaders(response.headers),
      responseBody,
      errorMessage: null
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        statusCode: error.response?.status ?? null,
        durationMs,
        responseHeaders: toResponseHeaders(error.response?.headers),
        responseBody:
          typeof error.response?.data === "string"
            ? error.response.data
            : JSON.stringify(error.response?.data ?? {}, null, 2),
        errorMessage: error.message
      };
    }

    return {
      success: false,
      statusCode: null,
      durationMs,
      responseHeaders: {},
      responseBody: "",
      errorMessage: "Unknown replay error"
    };
  }
}

export function buildCaptureUrls(input: {
  captureKey: string;
  subdomain: string;
  appUrl: string;
}): { pathUrl: string; subdomainUrl: string | null } {
  const app = new URL(input.appUrl);
  const pathUrl = `${app.origin}/api/webhooks/capture/${input.captureKey}`;

  const rootDomain = process.env.NEXT_PUBLIC_CAPTURE_ROOT_DOMAIN;

  if (!rootDomain) {
    return { pathUrl, subdomainUrl: null };
  }

  const scheme = app.protocol || "https:";
  const subdomainUrl = `${scheme}//${input.subdomain}.${rootDomain}/api/webhooks/capture/${input.captureKey}`;

  return { pathUrl, subdomainUrl };
}

export function getSubdomainFromHost(host: string | null): string | null {
  if (!host) {
    return null;
  }

  const withoutPort = host.split(":")[0];
  const root = process.env.NEXT_PUBLIC_CAPTURE_ROOT_DOMAIN;

  if (!root || !withoutPort.endsWith(root)) {
    return null;
  }

  const subdomainPart = withoutPort.slice(0, -root.length).replace(/\.$/, "");

  return subdomainPart || null;
}
