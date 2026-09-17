import mongoose from "mongoose";

const str = { type: String, trim: true };

// 1.1 Presenting Complaint — the four columns of the paper form's table.
// Single entry by design; multi-row entries are not supported yet.
const presentingComplaintSchema = new mongoose.Schema(
  {
    locationExtension: str,
    sensation: str,
    modalities: str,
    concomitants: str,
  },
  { _id: false },
);

const personalHistorySchema = new mongoose.Schema(
  {
    thermalReactivity: {
      type: String,
      enum: ["HOT", "CHILLY", "AMBITHERMAL"],
    },
    appetite: str,
    desires: str,
    aversion: str,
    intolerance: str,
    thirst: str,
    bowel: str,
    urine: str,
    sleep: str,
    dream: str,
    perspiration: str,
    addiction: str,
    menses: str,
    mentals: str,
  },
  { _id: false },
);

// 1. Interrogation. Later sections (physical examination, diagnosis, treatment)
// follow this same shape: their own sub-schema nested on the Case.
const interrogationSchema = new mongoose.Schema(
  {
    presentingComplaint: presentingComplaintSchema,
    historyOfPresentIllness: str,
    pastHistory: str,
    personalHistory: personalHistorySchema,
  },
  { _id: false },
);

// One consultation record for a patient. Every interrogation field is optional:
// a case is valid with nothing but the chief complaint.
const caseSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    chiefComplaint: { type: String, required: true, trim: true },
    interrogation: interrogationSchema,
  },
  { timestamps: true },
);

export const Case = mongoose.model("Case", caseSchema);
