import { NextResponse, type NextRequest } from "next/server";
import {
  getUserByCaptureKey,
  getUserById,
  getUserBySubdomain,
  insertWebhook
} from "@/lib/db";
import {
  detectWebhookProvider,
  getSourceIp,
  getSubdomainFromHost,
  normalizeHeadersForStorage
} from "@/lib/webhook-proxy";

type Params = {
  userId: string;
};

async function resolveCaptureUser(captureIdentifier: string, req: NextRequest) {
  const byCapture = await getUserByCaptureKey(captureIdentifier);

  if (byCapture) {
    return byCapture;
  }

  const byId = await getUserById(captureIdentifier);

  if (byId) {
    return byId;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const subdomain = getSubdomainFromHost(host);

  if (!subdomain) {
    return null;
  }

  return getUserBySubdomain(subdomain);
}

async function captureWebhook(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { userId } = await params;

  const user = await resolveCaptureUser(userId, request);

  if (!user) {
    return NextResponse.json(
      { error: "Capture route does not map to a valid user" },
      { status: 404 }
    );
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? ""
      : await request.text();

  const url = new URL(request.url);
  const headers = normalizeHeadersForStorage(request.headers);
  const provider = detectWebhookProvider(headers);

  const webhook = await insertWebhook({
    userId: user.id,
    provider,
    method: request.method,
    path: url.pathname,
    query: url.search,
    headers,
    body,
    sourceIp: getSourceIp(request.headers)
  });

  return NextResponse.json(
    {
      received: true,
      webhookId: webhook.id,
      provider,
      capturedAt: webhook.received_at
    },
    { status: 200 }
  );
}

export { captureWebhook as GET };
export { captureWebhook as HEAD };
export { captureWebhook as POST };
export { captureWebhook as PUT };
export { captureWebhook as PATCH };
export { captureWebhook as DELETE };
export { captureWebhook as OPTIONS };
