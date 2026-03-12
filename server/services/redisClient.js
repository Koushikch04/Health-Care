import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;
const REDIS_ENABLED = process.env.REDIS_ENABLED !== "false";
const REDIS_CONNECT_TIMEOUT_MS =
  Number(process.env.REDIS_CONNECT_TIMEOUT_MS) || 10_000;

let redisClient = null;
let isRedisReady = false;
let hasLoggedRedisDisabled = false;

const createRedisClient = () => {
  if (!REDIS_ENABLED || !REDIS_URL) {
    if (!hasLoggedRedisDisabled) {
      console.warn(
        "Redis cache is disabled. Set REDIS_URL and REDIS_ENABLED=true to enable it.",
      );
      hasLoggedRedisDisabled = true;
    }
    return null;
  }

  const client = new Redis(REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
    retryStrategy: (times) => Math.min(times * 200, 3000),
  });

  client.on("ready", () => {
    isRedisReady = true;
  });

  client.on("end", () => {
    isRedisReady = false;
  });

  client.on("error", (error) => {
    isRedisReady = false;
    console.error("Redis error:", error?.message || error);
  });

  return client;
};

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }

  if (!redisClient) {
    return null;
  }

  if (!isRedisReady && redisClient.status !== "connecting") {
    try {
      await redisClient.connect();
      isRedisReady = true;
    } catch (error) {
      console.error("Redis connection failed:", error?.message || error);
      return null;
    }
  }

  if (!isRedisReady && redisClient.status === "connecting") {
    return null;
  }

  return redisClient;
};

export const isRedisCacheAvailable = async () => Boolean(await getRedisClient());
