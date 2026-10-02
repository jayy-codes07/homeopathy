import { isValidObjectId } from "mongoose";
import { Case } from "../models/case.model.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { findOwnedPatient } from "../utility/ownedPatient.js";

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

const updateCase = asyncHandler(async (req, res) => {
  const { caseId } = req.params;
  const { chiefComplaint, interrogation } = req.body;

  if (!isValidObjectId(caseId)) {
    throw new ApiError(400, "provide valid caseId");
  }

  const existingCase = await Case.findOne({
    _id: caseId,
    doctor: req.doctor._id,
  });
  if (!existingCase) {
    throw new ApiError(404, "case does not exist in database");
  }

  const update = {};

  if (chiefComplaint !== undefined) {
    if (!chiefComplaint?.trim()) {
      throw new ApiError(400, "provide chief complaint");
    }
    update.chiefComplaint = chiefComplaint.trim();
  }

  const operations = { $set: update };

  // The edit form always submits the whole section, so the interrogation is
  // replaced rather than merged — otherwise a field the doctor cleared would
  // survive. Cleared down to nothing, the key is removed entirely.
  if ("interrogation" in req.body) {
    const built = buildInterrogation(interrogation);
    if (built) {
      update.interrogation = built;
    } else {
      operations.$unset = { interrogation: "" };
    }
  }

  const updatedCase = await Case.findByIdAndUpdate(caseId, operations, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCase, "case updated successfully"));
});

export { createCase, getPatientCases, updateCase };
