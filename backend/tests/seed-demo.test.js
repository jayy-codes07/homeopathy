// Runs the demo seed against an in-memory MongoDB. Never touches a real
// database: the URI comes from mongodb-memory-server, not the environment.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.ACCESS_TOKEN_EXPIRE = "1h";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.REFRESH_TOKEN_EXPIRE = "1d";
process.env.NODE_ENV = "test";

const DEMO_PASSWORD = "test-only-demo-password";

let mongod;
let server;
let baseUrl;
let seed;
let models;

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

const counts = async (doctorId) => {
  const patients = await models.Patient.find({ doctor: doctorId }, "_id");
  return {
    doctors: await models.Doctor.countDocuments({ email: seed.DEMO_EMAIL }),
    patients: patients.length,
    cases: await models.Case.countDocuments({ doctor: doctorId }),
    followups: await models.FollowUP.countDocuments({
      patient: { $in: patients.map((p) => p._id) },
    }),
  };
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  // Connect up front so direct model calls in the tests do not buffer.
  await mongoose.connect(process.env.MONGODB_URI);
  const { app } = await import("../src/app.js");
  seed = await import("../scripts/seed-demo.js");
  models = {
    Doctor: (await import("../src/models/doctor.model.js")).Doctor,
    Patient: (await import("../src/models/patient.model.js")).Patient,
    Case: (await import("../src/models/case.model.js")).Case,
    FollowUP: (await import("../src/models/followUP.model.js")).FollowUP,
  };
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongod.stop();
});

test("seeding twice leaves exactly one demo set and touches nothing else", async () => {
  // An unrelated doctor with one patient must survive both seed runs.
  const other = await models.Doctor.create({
    fullname: "Dr Other",
    email: "other@example.com",
    password: "other-password",
    degree: "BHMS",
  });
  const otherPatient = await models.Patient.create({
    doctor: other._id,
    patientName: "Keep Me",
    age: 40,
    gender: "OTHER",
    diagnosis: "x",
    medicine: "y",
    phoneNumber: "9111111111",
  });

  const uri = mongod.getUri();
  const first = await seed.seedDemo({ uri, password: DEMO_PASSWORD });
  const afterFirst = await counts(first.doctorId);
  assert.equal(afterFirst.doctors, 1);
  assert.ok(afterFirst.patients >= 10 && afterFirst.patients <= 12, "10 to 12 patients");
  assert.ok(afterFirst.cases >= afterFirst.patients, "at least one case per patient");
  assert.ok(afterFirst.followups > 0);

  const second = await seed.seedDemo({ uri, password: DEMO_PASSWORD });
  assert.equal(String(second.doctorId), String(first.doctorId), "doctor reused, not recreated");
  assert.deepEqual(second.removed, {
    patients: afterFirst.patients,
    cases: afterFirst.cases,
    followups: afterFirst.followups,
  });
  assert.deepEqual(await counts(second.doctorId), afterFirst, "no duplicates after second run");

  const phones = (await models.Patient.find({ doctor: second.doctorId }, "phoneNumber")).map((p) => p.phoneNumber);
  assert.equal(new Set(phones).size, phones.length, "phone numbers unique");
  assert.ok(phones.every((p) => /^90000000(0[1-9]|1[0-2])$/.test(p)), "phones in 9000000001..9000000012");

  assert.ok(await models.Patient.findById(otherPatient._id), "other doctor's patient untouched");
  assert.equal(await models.Doctor.countDocuments(), 2);
});

test("demo follow-up dates cover overdue, due today and upcoming", async () => {
  const doctor = await models.Doctor.findOne({ email: seed.DEMO_EMAIL });
  const patients = await models.Patient.find({ doctor: doctor._id });
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const dated = patients.filter((p) => p.followUpDate);
  const overdue = dated.filter((p) => p.followUpDate.getTime() < now);
  const dueSoon = dated.filter((p) => {
    const diff = Math.ceil((p.followUpDate.getTime() - now) / day);
    return diff >= 0 && diff <= 3;
  });
  const later = dated.filter((p) => p.followUpDate.getTime() - now > 3 * day);
  assert.ok(overdue.length > 0, "some overdue");
  assert.ok(dueSoon.length > 0, "some due within 3 days");
  assert.ok(later.length > 0, "some upcoming");
});

test("demo doctor can log in through the real login endpoint", async () => {
  const login = await json("/doctor/login", {
    method: "POST",
    body: { email: seed.DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  assert.ok(login.body.data.Accesstoken);

  const list = await json("/patient/all-patient?limit=20", { token: login.body.data.Accesstoken });
  assert.equal(list.status, 200);
  assert.equal(list.body.data.patient.length, list.body.data.totalPatients);
  assert.ok(list.body.data.totalPatients >= 10);

  const wrong = await json("/doctor/login", {
    method: "POST",
    body: { email: seed.DEMO_EMAIL, password: "not-the-demo-password" },
  });
  assert.equal(wrong.status, 400);
});

test("another doctor cannot see the demo patients", async () => {
  const reg = await json("/doctor/register", {
    method: "POST",
    body: { fullname: "Dr Outsider", email: "outsider@example.com", password: "pw123456", degree: "BHMS" },
  });
  assert.equal(reg.status, 201);
  const login = await json("/doctor/login", {
    method: "POST",
    body: { email: "outsider@example.com", password: "pw123456" },
  });
  const token = login.body.data.Accesstoken;

  const list = await json("/patient/all-patient", { token });
  assert.deepEqual(list.body.data, [], "outsider sees no patients");

  const demoDoctor = await models.Doctor.findOne({ email: seed.DEMO_EMAIL });
  const demoPatient = await models.Patient.findOne({ doctor: demoDoctor._id });
  const read = await json(`/patient/${demoPatient._id}`, { token });
  assert.equal(read.status, 404);
  const cases = await json(`/case/patient-case/${demoPatient._id}`, { token });
  assert.equal(cases.status, 404);
});
