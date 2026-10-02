// In-process cache with the same shape as the Redis driver: one namespace per
// doctor holding fields, each field stamped with its own expiry. Used by the
// tests when no Redis is available.
export const createMemoryCache = () => {
  const store = new Map();

  return {
    name: "memory",
    status: "ready",
    async get(ns, field) {
      const entry = store.get(ns)?.get(field);
      if (!entry) return null;
      if (entry.expiresAt <= Date.now()) {
        store.get(ns).delete(field);
        return null;
      }
      return entry.value;
    },
    async set(ns, field, value, ttlSeconds) {
      if (!store.has(ns)) store.set(ns, new Map());
      store.get(ns).set(field, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    },
    async invalidate(ns) {
      store.delete(ns);
    },
    async ready() {
      return true;
    },
    async close() {
      store.clear();
    },
  };
};
