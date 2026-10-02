import { createRedisCache } from "./redisCache.js";
import { createMemoryCache } from "./memoryCache.js";
import { createNoopCache } from "./noopCache.js";

// Driver selection:
//   CACHE_DRIVER=redis|memory|none wins when set (tests and debugging);
//   otherwise redis when REDIS_URL is set, else none.
// The instance is created lazily and shared, like the Mongo connection in db.js,
// so warm serverless invocations and a long-running server both reuse it.
let cache = null;

const pickDriver = () => {
  const explicit = process.env.CACHE_DRIVER;
  if (explicit) return explicit;
  return process.env.REDIS_URL ? "redis" : "none";
};

export const getCache = () => {
  if (cache) return cache;
  const driver = pickDriver();
  if (driver === "redis") {
    if (!process.env.REDIS_URL) {
      console.warn("CACHE_DRIVER=redis but REDIS_URL is not set, caching disabled");
      cache = createNoopCache();
    } else {
      cache = createRedisCache(process.env.REDIS_URL);
    }
  } else if (driver === "memory") {
    cache = createMemoryCache();
  } else {
    cache = createNoopCache();
  }
  console.log(`cache driver: ${cache.name}`);
  return cache;
};

export const closeCache = async () => {
  if (!cache) return;
  await cache.close();
  cache = null;
};
