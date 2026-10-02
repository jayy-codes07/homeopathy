// Redis configured but unreachable: requests must still succeed from MongoDB
// with exactly one warning. Separate file because node --test gives each file
// its own process, so the dead REDIS_URL cannot leak into the other tests.
import { test, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.ACCESS_TOKEN_EXPIRE = "1h";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.REFRESH_TOKEN_EXPIRE = "1d";
process.env.NODE_ENV = "test";
process.env.REDIS_URL = "redis://127.0.0.1:1"; // nothing listens on port 1
process.env.CACHE_DRIVER = "redis";

let mongod;
let server;
let baseUrl;
let cacheModule;
const warn = mock.method(console, "warn");

const json = async (path, { method = "GET", token, body } = {}) => {
  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json(), headers: Object.fromEntries(res.headers) };
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  const { app } = await import("../src/app.js");
  cacheModule = await import("../src/cache/index.js");
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await cacheModule.closeCache(); // stops the reconnect timers so the process exits
  await mongoose.disconnect();
  await mongod.stop();
});

test("requests succeed from MongoDB with one warning when Redis is unreachable", async () => {
  const doctor = { fullname: "Dr Down", email: "down@example.com", password: "secret123", degree: "BHMS" };
  await json("/doctor/register", { method: "POST", body: doctor });
  const login = await json("/doctor/login", {
    method: "POST",
    body: { email: doctor.email, password: doctor.password },
  });
  const token = login.body.data.Accesstoken;

  const patient = {
    patientName: "Asha Patel",
    age: 34,
    gender: "FEMALE",
    diagnosis: "Migraine",
    medicine: "Belladonna 30",
    phoneNumber: "9876543210",
  };
  const created = await json("/patient/register", { method: "POST", token, body: patient });
  assert.equal(created.status, 201, "a failed invalidate must not break writes");

  const first = await json("/patient/all-patient", { token });
  assert.equal(first.status, 200);
  assert.equal(first.headers["x-cache"], "BYPASS");
  assert.equal(first.body.data.totalPatients, 1);

  const second = await json("/patient/all-patient", { token });
  assert.equal(second.status, 200);
  assert.equal(second.headers["x-cache"], "BYPASS");
  assert.deepEqual(second.body, first.body);

  const health = await fetch(`${baseUrl}/api/health`).then((r) => r.json());
  assert.equal(health.cache, "redis");
  assert.equal(health.cacheReady, false);

  const redisWarnings = warn.mock.calls.filter((c) =>
    String(c.arguments[0]).startsWith("Redis unavailable"),
  );
  assert.equal(redisWarnings.length, 1, "exactly one warning for the outage");
});
