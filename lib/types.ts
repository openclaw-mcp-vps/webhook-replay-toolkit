export type AppUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  captureSubdomain: string;
  createdAt: string;
};

export type CapturedWebhook = {
  id: string;
  userId: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  bodyText: string;
  bodyBase64?: string;
  sourceHint: "stripe" | "shopify" | "github" | "unknown";
  contentType: string;
  receivedAt: string;
  ipAddress: string;
};

export type ReplayLog = {
  id: string;
  webhookId: string;
  userId: string;
  targetUrl: string;
  statusCode: number;
  responseBody: string;
  durationMs: number;
  createdAt: string;
};

export type StoreData = {
  users: AppUser[];
  webhooks: CapturedWebhook[];
  replayLogs: ReplayLog[];
};
