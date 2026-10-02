// Used when REDIS_URL is unset (or CACHE_DRIVER=none): every read misses and
// every write is dropped, so the API behaves exactly as it did before caching.
export const createNoopCache = () => ({
  name: "none",
  status: "disabled",
  async get() {
    return null;
  },
  async set() {},
  async invalidate() {},
  async ready() {
    return false;
  },
  async close() {},
});
