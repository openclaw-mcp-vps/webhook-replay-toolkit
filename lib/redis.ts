import { createClient } from "redis";

export type ReplayQueueJob = {
  id: string;
  webhookId: string;
  targetUrl: string;
  queuedAt: string;
};

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;
let connectingPromise: Promise<RedisClient | null> | null = null;

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (client?.isOpen) {
    return client;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    const redis = createClient({ url: process.env.REDIS_URL });
    redis.on("error", (error) => {
      console.error("Redis connection error", error);
    });

    await redis.connect();
    client = redis;
    return redis;
  })().finally(() => {
    connectingPromise = null;
  });

  return connectingPromise;
}

export async function enqueueReplayJob(job: ReplayQueueJob) {
  const redis = await getRedisClient();

  if (!redis) {
    return false;
  }

  await redis.lPush("webhook-replay:jobs", JSON.stringify(job));
  return true;
}
