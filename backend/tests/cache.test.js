// Patient-list cache behaviour on the real Express app. Uses a real Redis when
// REDIS_URL is set (CI), otherwise the in-memory driver, so it never needs
// Docker or a local redis-server.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.ACCESS_TOKEN_EXPIRE = "1h";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.REFRESH_TOKEN_EXPIRE = "1d";
process.env.NODE_ENV = "test";
process.env.CACHE_DRIVER = process.env.REDIS_URL ? "redis" : "memory";

let mongod;
let server;
let baseUrl;
let cacheModule;
let cacheReady = false;

const json = async (path, { method = "GET", token, body } = {}) => {
  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: res.status,
    body: await res.json(),
    headers: Object.fromEntries(res.headers),
  };
};

const registerAndLogin = async (email) => {
  const doctor = { fullname: "Dr Cache", email, password: "secret123", degree: "BHMS" };
  const reg = await json("/doctor/register", { method: "POST", body: doctor });
  assert.equal(reg.status, 201, JSON.stringify(reg.body));
  const login = await json("/doctor/login", {
    method: "POST",
    body: { email, password: doctor.password },
  });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  return login.body.data.Accesstoken;
};

const validPatient = {
  patientName: "Asha Patel",
  age: 34,
  gender: "FEMALE",
  diagnosis: "Migraine",
  medicine: "Belladonna 30",
  phoneNumber: "9876543210",
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  const { app } = await import("../src/app.js");
  cacheModule = await import("../src/cache/index.js");
  // Not asserted here: a throw inside before() skips after(), which would
  // leave the Redis client and Mongo open and hang the process instead of
  // failing fast. The first test asserts it instead.
  cacheReady = await cacheModule.getCache().ready(3000);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await cacheModule.closeCache();
  await mongoose.disconnect();
  await mongod.stop();
});

test("cache driver is connected before the cache tests run", () => {
  assert.equal(cacheReady, true, `cache driver ${cacheModule.getCache().name} not ready`);
});

test("second identical list request is served from the cache", async () => {
  const token = await registerAndLogin("hit@example.com");
  await json("/patient/register", { method: "POST", token, body: validPatient });

  const first = await json("/patient/all-patient", { token });
  assert.equal(first.status, 200);
  assert.equal(first.headers["x-cache"], "MISS");

  const second = await json("/patient/all-patient", { token });
  assert.equal(second.status, 200);
  assert.equal(second.headers["x-cache"], "HIT");
  assert.deepEqual(second.body, first.body, "hit replays identical JSON");
});

test("a different page or search term is a separate cache entry", async () => {
  const token = await registerAndLogin("miss@example.com");
  await json("/patient/register", { method: "POST", token, body: validPatient });

  await json("/patient/all-patient", { token });
  const page2 = await json("/patient/all-patient?page=2", { token });
  assert.equal(page2.headers["x-cache"], "MISS");
  const searched = await json("/patient/all-patient?search=asha", { token });
  assert.equal(searched.headers["x-cache"], "MISS");
  // Case-insensitive search: same results, so the same cache entry.
  const searchedUpper = await json("/patient/all-patient?search=ASHA", { token });
  assert.equal(searchedUpper.headers["x-cache"], "HIT");
  assert.deepEqual(searchedUpper.body, searched.body);
});

test("creating, updating and deleting a patient invalidates the list", async () => {
  const token = await registerAndLogin("invalidate@example.com");

  const empty = await json("/patient/all-patient", { token });
  assert.deepEqual(empty.body.data, []);
  assert.equal((await json("/patient/all-patient", { token })).headers["x-cache"], "HIT");

  const created = await json("/patient/register", { method: "POST", token, body: validPatient });
  assert.equal(created.status, 201);
  const afterCreate = await json("/patient/all-patient", { token });
  assert.equal(afterCreate.headers["x-cache"], "MISS", "create cleared the cache");
  assert.equal(afterCreate.body.data.totalPatients, 1);
  assert.equal((await json("/patient/all-patient", { token })).headers["x-cache"], "HIT");

  const id = created.body.data._id;
  const updated = await json(`/patient/${id}`, { method: "PATCH", token, body: { diagnosis: "Vertigo" } });
  assert.equal(updated.status, 200);
  const afterUpdate = await json("/patient/all-patient", { token });
  assert.equal(afterUpdate.headers["x-cache"], "MISS", "update cleared the cache");
  assert.equal(afterUpdate.body.data.patient[0].diagnosis, "Vertigo");
  assert.equal((await json("/patient/all-patient", { token })).headers["x-cache"], "HIT");

  const deleted = await json(`/patient/${id}`, { method: "DELETE", token });
  assert.equal(deleted.status, 200);
  const afterDelete = await json("/patient/all-patient", { token });
  assert.equal(afterDelete.headers["x-cache"], "MISS", "delete cleared the cache");
  assert.deepEqual(afterDelete.body.data, []);
});

test("cache entries are isolated per doctor", async () => {
  const tokenA = await registerAndLogin("iso-a@example.com");
  const tokenB = await registerAndLogin("iso-b@example.com");

  await json("/patient/register", { method: "POST", token: tokenA, body: validPatient });
  const a1 = await json("/patient/all-patient", { token: tokenA });
  assert.equal(a1.headers["x-cache"], "MISS");
  assert.equal((await json("/patient/all-patient", { token: tokenA })).headers["x-cache"], "HIT");

  // Same URL, other doctor: must not hit A's entry.
  const b1 = await json("/patient/all-patient", { token: tokenB });
  assert.equal(b1.headers["x-cache"], "MISS");
  assert.deepEqual(b1.body.data, [], "B never sees A's patient");
  assert.equal((await json("/patient/all-patient", { token: tokenB })).headers["x-cache"], "HIT");

  // A's write only clears A's namespace.
  await json("/patient/register", {
    method: "POST",
    token: tokenA,
    body: { ...validPatient, phoneNumber: "9000000002" },
  });
  const a2 = await json("/patient/all-patient", { token: tokenA });
  assert.equal(a2.headers["x-cache"], "MISS");
  assert.equal(a2.body.data.totalPatients, 2);
  const b2 = await json("/patient/all-patient", { token: tokenB });
  assert.equal(b2.headers["x-cache"], "HIT");
  assert.deepEqual(b2.body.data, []);
});

test("memory driver expires entries by ttl", async () => {
  const { createMemoryCache } = await import("../src/cache/memoryCache.js");
  const mem = createMemoryCache();
  await mem.set("ns", "f", { v: 1 }, 60);
  assert.deepEqual(await mem.get("ns", "f"), { v: 1 });
  await mem.set("ns", "g", { v: 2 }, 0);
  assert.equal(await mem.get("ns", "g"), null, "ttl 0 is already expired");
  await mem.invalidate("ns");
  assert.equal(await mem.get("ns", "f"), null);
});
