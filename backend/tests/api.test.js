// API tests on the real Express app against an in-memory MongoDB.
// Runs with Node's built-in test runner: `npm test`.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Must be set before app.js is imported: dotenv does not override values
// that already exist, so the real .env (if present) cannot leak in.
process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.ACCESS_TOKEN_EXPIRE = "1h";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.REFRESH_TOKEN_EXPIRE = "1d";
process.env.NODE_ENV = "test";

let mongod;
let server;
let baseUrl;

const json = async (path, { method = "GET", token, body } = {}) => {
  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
};

// Returns both the access token and the doctor's own id.
const loginFull = async (email) => {
  const doctor = { fullname: "Dr Test", email, password: "secret123", degree: "BHMS" };
  const reg = await json("/doctor/register", { method: "POST", body: doctor });
  assert.equal(reg.status, 201, JSON.stringify(reg.body));
  const login = await json("/doctor/login", {
    method: "POST",
    body: { email, password: doctor.password },
  });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  return { token: login.body.data.Accesstoken, doctorId: login.body.data.doctor._id };
};

const registerAndLogin = async (email) => (await loginFull(email)).token;

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
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  // With REDIS_URL set (as in CI) the first request opened a Redis client;
  // an open socket keeps the process alive, so it must be closed here.
  await (await import("../src/cache/index.js")).closeCache();
  await mongoose.disconnect();
  await mongod.stop();
});

test("register then login returns an access token", async () => {
  const token = await registerAndLogin("login@example.com");
  assert.ok(token.split(".").length === 3, "expected a JWT");

  const login = await json("/doctor/login", {
    method: "POST",
    body: { email: "login@example.com", password: "secret123" },
  });
  assert.equal(login.body.success, true);
  assert.equal(login.body.data.doctor.email, "login@example.com");
  assert.equal(login.body.data.doctor.password, undefined, "password must not be returned");
});

test("login with the wrong password is rejected", async () => {
  await registerAndLogin("wrongpw@example.com");
  const login = await json("/doctor/login", {
    method: "POST",
    body: { email: "wrongpw@example.com", password: "nope" },
  });
  assert.equal(login.status, 400);
  assert.equal(login.body.success, false);
  assert.equal(login.body.data, undefined);
});

test("protected routes answer 401 for missing, invalid and expired tokens", async () => {
  const missing = await json("/patient/all-patient");
  assert.equal(missing.status, 401);
  assert.equal(missing.body.success, false);

  const invalid = await json("/patient/all-patient", { token: "not-a-jwt" });
  assert.equal(invalid.status, 401);

  const jwt = (await import("jsonwebtoken")).default;
  const expired = jwt.sign({ id: "000000000000000000000000" }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: -10,
  });
  const expiredRes = await json("/patient/all-patient", { token: expired });
  assert.equal(expiredRes.status, 401);
  assert.equal(expiredRes.body.message, "jwt expired");
});

test("patient creation validates required fields and phone number", async () => {
  const token = await registerAndLogin("validation@example.com");

  const missing = await json("/patient/register", {
    method: "POST",
    token,
    body: { patientName: "No Phone" },
  });
  assert.equal(missing.status, 400);
  assert.match(missing.body.message, /required/i);

  const badPhone = await json("/patient/register", {
    method: "POST",
    token,
    body: { ...validPatient, phoneNumber: "12345" },
  });
  assert.equal(badPhone.status, 400);
  assert.match(badPhone.body.message, /phone/i);

  const ok = await json("/patient/register", { method: "POST", token, body: validPatient });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.data.patientName, validPatient.patientName);

  const duplicate = await json("/patient/register", { method: "POST", token, body: validPatient });
  assert.equal(duplicate.status, 400, "same phone number twice for one doctor");
});

test("a doctor cannot see another doctor's patients", async () => {
  const tokenA = await registerAndLogin("doctor-a@example.com");
  const tokenB = await registerAndLogin("doctor-b@example.com");

  const created = await json("/patient/register", {
    method: "POST",
    token: tokenA,
    body: { ...validPatient, phoneNumber: "9000000001" },
  });
  assert.equal(created.status, 201);
  const patientId = created.body.data._id;

  const ownRead = await json(`/patient/${patientId}`, { token: tokenA });
  assert.equal(ownRead.status, 200);

  const crossRead = await json(`/patient/${patientId}`, { token: tokenB });
  assert.equal(crossRead.status, 404);

  const crossUpdate = await json(`/patient/${patientId}`, {
    method: "PATCH",
    token: tokenB,
    body: { diagnosis: "tampered" },
  });
  assert.equal(crossUpdate.status, 404);

  const listB = await json("/patient/all-patient", { token: tokenB });
  assert.equal(listB.status, 200);
  assert.deepEqual(listB.body.data, [], "doctor B has no patients");
});

test("patient list filters by search term and keeps pagination counts", async () => {
  const token = await registerAndLogin("search@example.com");
  const names = ["Ravi Kumar", "Priya Sharma", "ravina Desai"];
  for (const [i, patientName] of names.entries()) {
    const res = await json("/patient/register", {
      method: "POST",
      token,
      body: { ...validPatient, patientName, phoneNumber: `91000000${i}0` },
    });
    assert.equal(res.status, 201);
  }

  const all = await json("/patient/all-patient?limit=2", { token });
  assert.equal(all.body.data.totalPatients, 3);
  assert.equal(all.body.data.totalPages, 2);
  assert.equal(all.body.data.patient.length, 2);

  const byName = await json("/patient/all-patient?search=RAVI", { token });
  assert.equal(byName.body.data.totalPatients, 2, "case-insensitive name match");
  assert.deepEqual(
    byName.body.data.patient.map((p) => p.patientName).sort(),
    ["Ravi Kumar", "ravina Desai"],
  );

  const byPhone = await json("/patient/all-patient?search=9100000010", { token });
  assert.equal(byPhone.body.data.patient[0].patientName, "Priya Sharma");

  const regexChars = await json("/patient/all-patient?search=.*", { token });
  assert.deepEqual(regexChars.body.data, [], "regex metacharacters are matched literally");
});

test("a doctor cannot modify or delete another doctor's account", async () => {
  const a = await loginFull("owner@example.com");
  const b = await loginFull("attacker@example.com");

  const details = await json(`/doctor/Details/${a.doctorId}`, {
    method: "PATCH",
    token: b.token,
    body: { fullname: "Hijacked" },
  });
  assert.equal(details.status, 403);

  const password = await json(`/doctor/Password/${a.doctorId}`, {
    method: "PATCH",
    token: b.token,
    body: { password: "newpass123" },
  });
  assert.equal(password.status, 403);

  const avatar = await json(`/doctor/Avatar/${a.doctorId}`, {
    method: "PATCH",
    token: b.token,
    body: {},
  });
  assert.equal(avatar.status, 403);

  const del = await json(`/doctor/doctor/${a.doctorId}`, {
    method: "DELETE",
    token: b.token,
  });
  assert.equal(del.status, 403);

  // Doctor A is untouched and can still log in with the original password.
  const login = await json("/doctor/login", {
    method: "POST",
    body: { email: "owner@example.com", password: "secret123" },
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.data.doctor.fullname, "Dr Test");

  // The owner can still update their own details.
  const own = await json(`/doctor/Details/${a.doctorId}`, {
    method: "PATCH",
    token: a.token,
    body: { fullname: "Dr Owner" },
  });
  assert.equal(own.status, 200);
  assert.equal(own.body.data.fullname, "Dr Owner");
});

test("follow-ups are scoped to the patient's own doctor", async () => {
  const a = await loginFull("fu-owner@example.com");
  const b = await loginFull("fu-other@example.com");

  const created = await json("/patient/register", {
    method: "POST",
    token: a.token,
    body: { ...validPatient, phoneNumber: "9000000099" },
  });
  const patientId = created.body.data._id;
  const followup = { followUpDate: "2026-01-01", symptoms: "better", advise: "rest", medicine: "Nux 30" };

  const ownCreate = await json(`/followup/create-followup/${patientId}`, {
    method: "POST",
    token: a.token,
    body: followup,
  });
  assert.equal(ownCreate.status, 201);
  const followupId = ownCreate.body.data._id;

  const crossCreate = await json(`/followup/create-followup/${patientId}`, {
    method: "POST",
    token: b.token,
    body: followup,
  });
  assert.equal(crossCreate.status, 404);

  const crossList = await json(`/followup/patient-followup/${patientId}`, { token: b.token });
  assert.equal(crossList.status, 404);

  const crossUpdate = await json(`/followup/patient-followup/${followupId}`, {
    method: "PATCH",
    token: b.token,
    body: { symptoms: "tampered" },
  });
  assert.equal(crossUpdate.status, 404);

  const crossDelete = await json(`/followup/patient-followup/${followupId}`, {
    method: "DELETE",
    token: b.token,
  });
  assert.equal(crossDelete.status, 404);

  const ownList = await json(`/followup/patient-followup/${patientId}`, { token: a.token });
  assert.equal(ownList.status, 200);
  assert.equal(ownList.body.data.length, 1, "follow-up survived the cross-doctor attempts");
  assert.equal(ownList.body.data[0].symptoms, "better");

  const ownDelete = await json(`/followup/patient-followup/${followupId}`, {
    method: "DELETE",
    token: a.token,
  });
  assert.equal(ownDelete.status, 200);
});

test("login sets accessToken and refreshToken cookies that the middleware accepts", async () => {
  await registerAndLogin("cookie@example.com");
  const res = await fetch(`${baseUrl}/api/v1/doctor/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "cookie@example.com", password: "secret123" }),
  });
  assert.equal(res.status, 200);
  const cookies = res.headers.getSetCookie();
  const access = cookies.find((c) => c.startsWith("accessToken="));
  const refresh = cookies.find((c) => c.startsWith("refreshToken="));
  assert.ok(access, "accessToken cookie set");
  assert.ok(refresh, "refreshToken cookie set");
  assert.match(access, /HttpOnly/i);

  // The cookie alone, with no Authorization header, must authenticate.
  const list = await fetch(`${baseUrl}/api/v1/patient/all-patient`, {
    headers: { cookie: access.split(";")[0] },
  });
  assert.equal(list.status, 200);
});
