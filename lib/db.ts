import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AppUser, CapturedWebhook, ReplayLog, StoreData } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureStore(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(STORE_PATH, "utf-8");
  } catch {
    const initial: StoreData = { users: [], webhooks: [], replayLogs: [] };
    await writeFile(STORE_PATH, JSON.stringify(initial, null, 2));
  }
}

export async function readStore(): Promise<StoreData> {
  await ensureStore();
  const raw = await readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw) as StoreData;
}

export async function writeStore(mutator: (data: StoreData) => StoreData): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const current = await readStore();
    const updated = mutator(current);
    await writeFile(STORE_PATH, JSON.stringify(updated, null, 2));
  });

  await writeQueue;
}

export async function createUser(params: {
  email: string;
  name: string;
  passwordHash: string;
  captureSubdomain: string;
}): Promise<AppUser> {
  const user: AppUser = {
    id: randomUUID(),
    email: params.email.toLowerCase(),
    name: params.name,
    passwordHash: params.passwordHash,
    captureSubdomain: params.captureSubdomain,
    createdAt: new Date().toISOString()
  };

  await writeStore((data) => ({ ...data, users: [user, ...data.users] }));
  return user;
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const store = await readStore();
  return store.users.find((u) => u.email === email.toLowerCase()) ?? null;
}

export async function findUserById(userId: string): Promise<AppUser | null> {
  const store = await readStore();
  return store.users.find((u) => u.id === userId) ?? null;
}

export async function findUserByCaptureIdentifier(identifier: string): Promise<AppUser | null> {
  const store = await readStore();
  return (
    store.users.find((u) => u.id === identifier || u.captureSubdomain === identifier.toLowerCase()) ?? null
  );
}

export async function saveWebhook(
  payload: Omit<CapturedWebhook, "id" | "receivedAt">
): Promise<CapturedWebhook> {
  const webhook: CapturedWebhook = {
    ...payload,
    id: randomUUID(),
    receivedAt: new Date().toISOString()
  };

  await writeStore((data) => ({ ...data, webhooks: [webhook, ...data.webhooks] }));
  return webhook;
}

export async function listWebhooks(userId: string): Promise<CapturedWebhook[]> {
  const store = await readStore();
  return store.webhooks
    .filter((w) => w.userId === userId)
    .sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));
}

export async function getWebhookById(
  userId: string,
  webhookId: string
): Promise<CapturedWebhook | null> {
  const store = await readStore();
  return store.webhooks.find((w) => w.userId === userId && w.id === webhookId) ?? null;
}

export async function addReplayLog(log: Omit<ReplayLog, "id" | "createdAt">): Promise<ReplayLog> {
  const replay: ReplayLog = {
    ...log,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  };

  await writeStore((data) => ({ ...data, replayLogs: [replay, ...data.replayLogs] }));
  return replay;
}

export async function listReplayLogs(userId: string, webhookId?: string): Promise<ReplayLog[]> {
  const store = await readStore();
  return store.replayLogs
    .filter((r) => r.userId === userId && (!webhookId || r.webhookId === webhookId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
