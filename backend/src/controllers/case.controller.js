import { isValidObjectId } from "mongoose";
import { Case } from "../models/case.model.js";
import { Patient } from "../models/patient.model.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";

// Scopes the lookup to the logged in doctor so one doctor cannot read or write
// cases against another doctor's patient.
const findOwnedPatient = async (patientId, doctorId) => {
  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "provide valid patientId");
  }

  const patient = await Patient.findOne({ _id: patientId, doctor: doctorId });
  if (!patient) {
    throw new ApiError(404, "patient does not exist in database");
  }

  return patient;
};

const PRESENTING_COMPLAINT_FIELDS = [
  "locationExtension",
  "sensation",
  "modalities",
  "concomitants",
];

const PERSONAL_HISTORY_FIELDS = [
  "thermalReactivity",
  "appetite",
  "desires",
  "aversion",
  "intolerance",
  "thirst",
  "bowel",
  "urine",
  "sleep",
  "dream",
  "perspiration",
  "addiction",
  "menses",
  "mentals",
];

// Keeps only the whitelisted keys that actually carry text, so a case saved with
// nothing but a chief complaint does not store a tree of empty strings.
const pickFilled = (source, fields) => {
  const picked = {};
  for (const field of fields) {
    const value = source?.[field];
    if (typeof value === "string" && value.trim()) {
      picked[field] = value.trim();
    }
  }
  return Object.keys(picked).length ? picked : undefined;
};

const THERMAL_REACTIVITY = ["HOT", "CHILLY", "AMBITHERMAL"];

const buildInterrogation = (raw) => {
  if (!raw || typeof raw !== "object") return undefined;

  // Checked here so an out-of-range value comes back as a 400 rather than
  // surfacing as a 500 from the schema validator.
  const thermal = raw.personalHistory?.thermalReactivity;
  if (thermal?.trim() && !THERMAL_REACTIVITY.includes(thermal.trim())) {
    throw new ApiError(400, "provide valid thermal reactivity");
  }

  const interrogation = {};

  const presentingComplaint = pickFilled(
    raw.presentingComplaint,
    PRESENTING_COMPLAINT_FIELDS,
  );
  if (presentingComplaint) interrogation.presentingComplaint = presentingComplaint;

  const personalHistory = pickFilled(
    raw.personalHistory,
    PERSONAL_HISTORY_FIELDS,
  );
  if (personalHistory) interrogation.personalHistory = personalHistory;

  const topLevel = pickFilled(raw, [
    "historyOfPresentIllness",
    "pastHistory",
  ]);
  Object.assign(interrogation, topLevel);

  return Object.keys(interrogation).length ? interrogation : undefined;
};

const createCase = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { chiefComplaint, interrogation } = req.body;

  await findOwnedPatient(patientId, req.doctor._id);

  if (!chiefComplaint?.trim()) {
    throw new ApiError(400, "provide chief complaint");
  }

  const newCase = await Case.create({
    patient: patientId,
    doctor: req.doctor._id,
    chiefComplaint: chiefComplaint.trim(),
    interrogation: buildInterrogation(interrogation),
  });

  if (!newCase) {
    throw new ApiError(500, "something went wrong while creating case");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newCase, "case created successfully"));
});

const getPatientCases = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  await findOwnedPatient(patientId, req.doctor._id);

  const cases = await Case.find({ patient: patientId }).sort({ createdAt: -1 });

  if (cases.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "there is no case of this patient"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cases, "all cases fetched successfully"));
});

export { createCase, getPatientCases };
