// Seeds a demo doctor with fake patients, cases and follow-ups.
//
//   npm run seed:demo             prints the target host and exits (dry run)
//   npm run seed:demo -- --confirm  writes the data
//
// Idempotent: the demo doctor is created only if missing, and every run
// deletes and recreates only the patients, cases and follow-ups that belong
// to that doctor. Nothing owned by any other doctor is touched.
//
// All data below is invented. Names, phone numbers (9000000001..9000000012)
// and clinical notes are generic placeholders, not real people or records.
import { pathToFileURL } from "node:url";
import mongoose from "mongoose";
import { Doctor } from "../src/models/doctor.model.js";
import { Patient } from "../src/models/patient.model.js";
import { Case } from "../src/models/case.model.js";
import { FollowUP } from "../src/models/followUP.model.js";

export const DEMO_EMAIL = "demo@example.com";
export const DEFAULT_DEMO_PASSWORD = "homeo-demo-2026";

const DAY = 24 * 60 * 60 * 1000;
// Relative to "now" so the dashboard always shows overdue, due-today and
// upcoming follow-ups no matter when the seed is run.
const daysFromNow = (days) => new Date(Date.now() + days * DAY);
const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return d;
};

// followUpOffset: days from now for patient.followUpDate (null = none).
// history: past follow-up visits, days ago.
export const DEMO_PATIENTS = [
  { patientName: "Aarav Demo", age: 34, gender: "MALE", diagnosis: "Recurrent headache", medicine: "Belladonna 30", diet: "VEG", occupation: "Teacher", familySize: 4, followUpOffset: -5, history: [30, 15] },
  { patientName: "Diya Sample", age: 27, gender: "FEMALE", diagnosis: "Seasonal allergy", medicine: "Allium cepa 30", diet: "MIXED", occupation: "Designer", familySize: 2, followUpOffset: 0, history: [21] },
  { patientName: "Kabir Placeholder", age: 61, gender: "MALE", diagnosis: "Joint stiffness", medicine: "Rhus tox 30", diet: "NON VEG", occupation: "Retired", familySize: 3, followUpOffset: 2, history: [45, 30, 14] },
  { patientName: "Meera Example", age: 45, gender: "FEMALE", diagnosis: "Acidity", medicine: "Nux vomica 30", diet: "VEG", occupation: "Accountant", familySize: 5, followUpOffset: -12, history: [20] },
  { patientName: "Rohan Test", age: 8, gender: "MALE", diagnosis: "Recurrent cold", medicine: "Pulsatilla 30", diet: "VEG", occupation: "Student", familySize: 4, followUpOffset: 7, history: [10] },
  { patientName: "Sana Fictional", age: 52, gender: "FEMALE", diagnosis: "Disturbed sleep", medicine: "Coffea cruda 30", diet: "MIXED", occupation: "Shop owner", familySize: 3, followUpOffset: 1, history: [28, 7] },
  { patientName: "Vihaan Dummy", age: 19, gender: "MALE", diagnosis: "Acne", medicine: "Sulphur 30", diet: "NON VEG", occupation: "Student", familySize: 4, followUpOffset: 14, history: [] },
  { patientName: "Anaya Mock", age: 39, gender: "FEMALE", diagnosis: "Low back pain", medicine: "Bryonia 30", diet: "VEG", occupation: "Nurse", familySize: 2, followUpOffset: -2, history: [16] },
  { patientName: "Ishaan Specimen", age: 70, gender: "MALE", diagnosis: "Dry cough", medicine: "Drosera 30", diet: "VEG", occupation: "Retired", familySize: 2, followUpOffset: 3, history: [12, 6] },
  { patientName: "Zara Stand-in", age: 31, gender: "FEMALE", diagnosis: "Hair fall", medicine: "Lycopodium 30", diet: "MIXED", occupation: "Engineer", familySize: 3, followUpOffset: null, history: [] },
  { patientName: "Alex Sampleton", age: 24, gender: "OTHER", diagnosis: "Exam anxiety", medicine: "Gelsemium 30", diet: "VEG", occupation: "Student", familySize: 5, followUpOffset: 0, history: [9] },
  { patientName: "Nila Testcase", age: 48, gender: "FEMALE", diagnosis: "Indigestion", medicine: "Carbo veg 30", diet: "NON VEG", occupation: "Driver", familySize: 6, followUpOffset: 21, history: [40, 25, 11] },
].map((p, i) => ({ ...p, phoneNumber: `90000000${String(i + 1).padStart(2, "0")}` }));

const THERMALS = ["HOT", "CHILLY", "AMBITHERMAL"];

// One to three cases per patient. Only the first carries a full interrogation;
// later ones are shorter, as a real record would be.
const casesFor = (p, index) => {
  const count = (index % 3) + 1;
  const cases = [
    {
      chiefComplaint: `${p.diagnosis} for several weeks`,
      interrogation: {
        presentingComplaint: {
          locationExtension: "Generalised, no specific extension",
          sensation: "Dull, dragging",
          modalities: "Worse in the evening, better with rest",
          concomitants: "Mild tiredness",
        },
        historyOfPresentIllness: "Gradual onset, no single trigger identified.",
        pastHistory: "Nothing significant reported.",
        personalHistory: {
          thermalReactivity: THERMALS[index % THERMALS.length],
          appetite: "Normal",
          desires: "Warm food",
          aversion: "Milk",
          thirst: "Moderate",
          bowel: "Regular",
          urine: "Normal",
          sleep: "Sound",
          dream: "Not remembered",
          perspiration: "Normal",
          addiction: "None",
          mentals: "Calm, mildly anxious about symptoms",
        },
      },
    },
    { chiefComplaint: "Review visit, symptoms partly improved" },
    {
      chiefComplaint: "New complaint: occasional fatigue",
      interrogation: { historyOfPresentIllness: "Started after a change in routine." },
    },
  ];
  return cases.slice(0, count);
};

const followupsFor = (p) =>
  p.history.map((daysAgo, i) => ({
    followUpDate: daysFromNow(-daysAgo),
    symptoms: i === 0 ? "Symptoms as at first visit" : "Reported some improvement",
    medicine: p.medicine,
    advise: "Continue medicine, avoid known triggers, review as scheduled",
  }));

const describeHost = (uri) => {
  try {
    const u = new URL(uri);
    return `${u.protocol}//${u.host}${u.pathname || ""}`;
  } catch {
    return "(unparseable URI)";
  }
};

export const seedDemo = async ({ uri, password = DEFAULT_DEMO_PASSWORD, log = () => {} }) => {
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);

  let doctor = await Doctor.findOne({ email: DEMO_EMAIL });
  if (!doctor) {
    // Doctor.create runs the pre-save hook that bcrypt-hashes the password.
    doctor = await Doctor.create({
      fullname: "Dr. Demo Doctor",
      email: DEMO_EMAIL,
      password,
      degree: "BHMS (demo account)",
    });
    log(`created demo doctor ${DEMO_EMAIL}`);
  } else {
    log(`demo doctor ${DEMO_EMAIL} already exists, keeping it`);
  }

  // Scope every delete to the demo doctor's own records.
  const ownedPatientIds = (await Patient.find({ doctor: doctor._id }, "_id")).map((p) => p._id);
  const removed = {
    followups: (await FollowUP.deleteMany({ patient: { $in: ownedPatientIds } })).deletedCount,
    cases: (await Case.deleteMany({ doctor: doctor._id })).deletedCount,
    patients: (await Patient.deleteMany({ doctor: doctor._id })).deletedCount,
  };
  log(`removed previous demo data: ${JSON.stringify(removed)}`);

  const created = { patients: 0, cases: 0, followups: 0 };
  for (const [index, p] of DEMO_PATIENTS.entries()) {
    const { followUpOffset, history, ...fields } = p;
    const followUpDate =
      followUpOffset === null ? undefined
      : followUpOffset === 0 ? endOfToday()
      : daysFromNow(followUpOffset);

    const patient = await Patient.create({ ...fields, followUpDate, doctor: doctor._id });
    created.patients += 1;

    for (const c of casesFor(p, index)) {
      await Case.create({ ...c, patient: patient._id, doctor: doctor._id });
      created.cases += 1;
    }
    for (const f of followupsFor(p)) {
      await FollowUP.create({ ...f, patient: patient._id });
      created.followups += 1;
    }
  }
  log(`created: ${JSON.stringify(created)}`);
  return { doctorId: doctor._id, removed, created };
};

const main = async () => {
  const { default: dotenv } = await import("dotenv");
  dotenv.config();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Nothing written.");
    process.exit(1);
  }

  console.log(`Target database: ${describeHost(uri)}`);
  console.log(`Demo login: ${DEMO_EMAIL} / ${process.env.DEMO_PASSWORD ? "(DEMO_PASSWORD from env)" : DEFAULT_DEMO_PASSWORD}`);

  if (!process.argv.includes("--confirm")) {
    console.log("Dry run. Re-run with --confirm to write the demo data.");
    process.exit(0);
  }

  try {
    await seedDemo({ uri, password: process.env.DEMO_PASSWORD, log: console.log });
    console.log("Done.");
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
}
