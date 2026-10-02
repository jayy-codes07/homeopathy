import Redis from "ioredis";

// Redis-backed cache. One hash per namespace (a doctor), one field per cached
// query. Every method swallows errors: a Redis outage must never turn into an
// API error, only into a cache miss and a single warning per outage.
export const createRedisCache = (url) => {
  const client = new Redis(url, {
    enableOfflineQueue: false, // fail fast while disconnected instead of queueing
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    commandTimeout: 250,
    retryStrategy: (times) => Math.min(times * 500, 5000),
  });

  let warned = false;
  const warn = (err) => {
    if (warned) return;
    warned = true;
    console.warn("Redis unavailable, serving from MongoDB:", err?.message || err);
  };

  // Without an error listener ioredis would emit an unhandled 'error' and crash.
  client.on("error", warn);
  client.on("ready", () => {
    warned = false;
  });

  const cache = {
    name: "redis",
    get status() {
      return client.status === "ready" ? "ready" : "down";
    },
    async get(ns, field) {
      try {
        const raw = await client.hget(ns, field);
        if (!raw) return null;
        const { at, ttlMs, value } = JSON.parse(raw);
        // The per-entry stamp is the real TTL; the hash EXPIRE below is only
        // garbage collection and may be refreshed by later writes.
        if (Date.now() - at > ttlMs) return null;
        return value;
      } catch (err) {
        warn(err);
        return null;
      }
    },
    async set(ns, field, value, ttlSeconds) {
      try {
        const payload = JSON.stringify({ at: Date.now(), ttlMs: ttlSeconds * 1000, value });
        await client.multi().hset(ns, field, payload).expire(ns, ttlSeconds).exec();
      } catch (err) {
        warn(err);
      }
    },
    async invalidate(ns) {
      try {
        await client.del(ns);
      } catch (err) {
        warn(err);
      }
    },
    // Resolves true once connected, false after timeoutMs. Tests use this so the
    // first request is not a spurious miss while the socket is still opening.
    ready(timeoutMs = 2000) {
      if (client.status === "ready") return Promise.resolve(true);
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          client.off("ready", onReady);
          resolve(false);
        }, timeoutMs);
        const onReady = () => {
          clearTimeout(timer);
          resolve(true);
        };
        client.once("ready", onReady);
      });
    },
    // Always resolves. disconnect() is synchronous, drops the socket and, unlike
    // quit(), does not wait for a reply or schedule a reconnect, so nothing is
    // left to keep the event loop alive. quit() would reject while offline
    // because enableOfflineQueue is false.
    async close() {
      try {
        client.removeAllListeners("ready");
        client.disconnect();
      } catch {
        // already closed
      }
    },
  };

  return cache;
};
