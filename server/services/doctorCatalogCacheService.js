import crypto from "crypto";

import { getRedisClient } from "./redisClient.js";

const DOCTOR_CATALOG_KEY_PREFIX = "doctor-catalog";
const DOCTOR_CATALOG_QUERY_PREFIX = `${DOCTOR_CATALOG_KEY_PREFIX}:query`;
const DOCTOR_CATALOG_DOCTOR_SET_PREFIX = `${DOCTOR_CATALOG_KEY_PREFIX}:doctor`;
const DOCTOR_CATALOG_TTL_SECONDS =
  Number(process.env.DOCTOR_CATALOG_CACHE_TTL_SECONDS) || 300;

const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const sortedKeys = Object.keys(value).sort();
    const serialized = sortedKeys.map(
      (key) => `"${key}":${stableStringify(value[key])}`,
    );
    return `{${serialized.join(",")}}`;
  }
  return JSON.stringify(value);
};

const createQueryHash = (payload) =>
  crypto.createHash("sha1").update(stableStringify(payload)).digest("hex");

const getDoctorSetKey = (doctorId) =>
  `${DOCTOR_CATALOG_DOCTOR_SET_PREFIX}:${doctorId}`;

const scanKeys = async (redis, pattern) => {
  let cursor = "0";
  const keys = [];

  do {
    const [nextCursor, batch] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      200,
    );
    cursor = nextCursor;
    if (Array.isArray(batch) && batch.length > 0) {
      keys.push(...batch);
    }
  } while (cursor !== "0");

  return keys;
};

export const buildDoctorCatalogCacheKey = (queryPayload) => {
  const queryHash = createQueryHash(queryPayload);
  return `${DOCTOR_CATALOG_QUERY_PREFIX}:${queryHash}`;
};

export const getDoctorCatalogFromCache = async (cacheKey) => {
  try {
    const redis = await getRedisClient();
    if (!redis) return null;

    const serialized = await redis.get(cacheKey);
    if (!serialized) return null;

    try {
      return JSON.parse(serialized);
    } catch (error) {
      console.error("Failed to parse cached doctor catalog payload:", error);
      return null;
    }
  } catch (error) {
    console.warn(
      "Doctor catalog cache read failed; falling back to MongoDB.",
      error?.message || error,
    );
    return null;
  }
};

export const setDoctorCatalogCache = async ({
  cacheKey,
  payload,
  doctorIds = [],
  ttlSeconds = DOCTOR_CATALOG_TTL_SECONDS,
}) => {
  try {
    const redis = await getRedisClient();
    if (!redis) return;

    const normalizedDoctorIds = [...new Set(doctorIds.filter(Boolean))];
    const serialized = JSON.stringify(payload);
    const pipeline = redis.pipeline();

    pipeline.set(cacheKey, serialized, "EX", ttlSeconds);
    normalizedDoctorIds.forEach((doctorId) => {
      const doctorSetKey = getDoctorSetKey(doctorId.toString());
      pipeline.sadd(doctorSetKey, cacheKey);
      pipeline.expire(doctorSetKey, ttlSeconds);
    });

    await pipeline.exec();
  } catch (error) {
    console.warn(
      "Doctor catalog cache write failed; continuing without cache.",
      error?.message || error,
    );
  }
};

export const invalidateDoctorCatalogByDoctorId = async (doctorId) => {
  if (!doctorId) return;

  try {
    const redis = await getRedisClient();
    if (!redis) return;

    const doctorSetKey = getDoctorSetKey(doctorId.toString());
    const linkedCacheKeys = await redis.smembers(doctorSetKey);

    if (!linkedCacheKeys.length) {
      await redis.del(doctorSetKey);
      return;
    }

    const pipeline = redis.pipeline();
    linkedCacheKeys.forEach((key) => pipeline.del(key));
    pipeline.del(doctorSetKey);
    await pipeline.exec();
  } catch (error) {
    console.warn(
      "Doctor catalog cache invalidation failed; continuing without cache cleanup.",
      error?.message || error,
    );
  }
};

export const invalidateAllDoctorCatalogCache = async () => {
  try {
    const redis = await getRedisClient();
    if (!redis) return;

    const queryKeys = await scanKeys(redis, `${DOCTOR_CATALOG_QUERY_PREFIX}:*`);
    const doctorSetKeys = await scanKeys(
      redis,
      `${DOCTOR_CATALOG_DOCTOR_SET_PREFIX}:*`,
    );
    const allKeys = [...queryKeys, ...doctorSetKeys];

    if (!allKeys.length) {
      return;
    }

    await redis.del(...allKeys);
  } catch (error) {
    console.warn(
      "Doctor catalog cache flush failed; continuing without cache cleanup.",
      error?.message || error,
    );
  }
};
