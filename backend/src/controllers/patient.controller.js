import mongoose, { isValidObjectId } from "mongoose";

import { Patient } from "../models/patient.model.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { getCache } from "../cache/index.js";
import {
  PATIENT_LIST_TTL,
  patientListNamespace,
  patientListField,
  invalidatePatientList,
} from "../cache/patientList.js";

// Cache invalidation note: only patient create/update/delete clear the list
// cache. The list and the dashboard's due counts read Patient documents only,
// and the case and follow-up controllers never modify a Patient, so their
// writes cannot change what this list returns.

const registerPatient = asyncHandler(async (req, res) => {
  const {
    patientName,
    age,
    gender,
    diagnosis,
    medicine,
    address,
    diet,
    familySize,
    occupation,
    followUpDate,
    phoneNumber,
  } = req.body;

  if (
    !patientName ||
    !age ||
    !gender ||
    !diagnosis ||
    !medicine ||
    !phoneNumber
  ) {
    throw new ApiError(400, "provide all required details");
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new ApiError(400, "provide valid phone number");
  }

  const existingPatient = await Patient.findOne({
    phoneNumber: phoneNumber?.trim(),
    doctor: req.doctor._id,
  });
  if (existingPatient) {
    throw new ApiError(400, "patient already exist");
  }

  const newPatient = await Patient.create({
    patientName,
    age,
    gender,
    diagnosis,
    medicine,
    address,
    diet,
    phoneNumber,
    familySize,
    occupation,
    followUpDate,
    doctor: req.doctor._id,
  });
  if (!newPatient) {
    throw new ApiError(500, "there is problem in registering Patient");
  }
  await invalidatePatientList(req.doctor._id);

  return res
    .status(201)
    .json(new ApiResponse(201, newPatient, "patient registered successfully"));
});

// Escapes user input so it is matched literally inside $regex.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fetchAllPatient = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const filter = { doctor: req.doctor._id };
  const term = typeof search === "string" ? search.trim() : "";
  if (term) {
    const pattern = { $regex: escapeRegex(term), $options: "i" };
    filter.$or = [{ patientName: pattern }, { phoneNumber: pattern }];
  }
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const cache = getCache();
  const ns = patientListNamespace(req.doctor._id);
  const field = patientListField({ page: pageNum, limit: limitNum, term });

  const cached = await cache.get(ns, field);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res
      .status(200)
      .json(new ApiResponse(200, cached.data, cached.message));
  }
  res.set("X-Cache", cache.status === "ready" ? "MISS" : "BYPASS");

  const allPatient = await Patient.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $skip: (pageNum - 1) * limitNum },
    { $limit: limitNum },
  ]);
  const totalPatients = await Patient.countDocuments(filter);

  // Both response shapes are cached as-is so a hit replays identical JSON.
  let data;
  let message;
  if (allPatient.length === 0) {
    data = [];
    message = "No patients found. Please register new patients.";
  } else {
    data = {
      patient: allPatient,
      totalPatients,
      currentPage: pageNum,
      totalPages: Math.ceil(totalPatients / limitNum),
    };
    message = "all patients fetched successfully";
  }
  // Fire-and-forget: the driver never throws, and a failed write is only a miss.
  cache.set(ns, field, { data, message }, PATIENT_LIST_TTL);

  return res.status(200).json(new ApiResponse(200, data, message));
});

const findOnePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "provide valid objectId");
  }

  const patient = await Patient.findOne({
    _id: patientId,
    doctor: req.doctor._id,
  });

  if (!patient) {
    throw new ApiError(404, "patient does not exist in database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "here is particular patient"));
});

const updatePatientDetails = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const {
    patientName,
    age,
    gender,
    diagnosis,
    medicine,
    address,
    diet,
    familySize,
    occupation,
    followUpDate,
  } = req.body;
  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "provide valid objectId");
  }

  if (Object.keys(req.body).length === 0) {
    throw new ApiError(400, "provide patient details");
  }

  let updateField = {};

  if (patientName?.trim()) {
    updateField.patientName = patientName?.trim();
  }
  if (age) {
    updateField.age = age;
  }
  if (gender?.trim()) {
    updateField.gender = gender?.trim();
  }
  if (diagnosis?.trim()) {
    updateField.diagnosis = diagnosis?.trim();
  }
  if (medicine?.trim()) {
    updateField.medicine = medicine?.trim();
  }
  if (address?.trim()) {
    updateField.address = address?.trim();
  }
  if (diet?.trim()) {
    updateField.diet = diet?.trim();
  }
  if (familySize) {
    updateField.familySize = familySize;
  }
  if (occupation?.trim()) {
    updateField.occupation = occupation?.trim();
  }
  if (followUpDate) {
    updateField.followUpDate = followUpDate;
  }

  const patient = await Patient.findOneAndUpdate(
    { _id: patientId, doctor: req.doctor._id },
    { $set: updateField },
    { new: true },
  );

  if (!patient) {
    throw new ApiError(404, "patient does not exist in database");
  }
  await invalidatePatientList(req.doctor._id);
  return res
    .status(200)
    .json(new ApiResponse(200, patient, "patient updated successfully "));
});

const deletePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "provide valid objectId");
  }

  const patient = await Patient.findOneAndDelete({
    _id: patientId,
    doctor: req.doctor._id,
  });

  if (!patient) {
    throw new ApiError(404, "patient does not exist in database");
  }
  await invalidatePatientList(req.doctor._id);

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "patient deleted successfully "));
});

const searchPatient = asyncHandler(async (req, res) => {
  const { patientName, diagnosis, medicine, phoneNumber } = req.query;

  if (
    !patientName?.trim() &&
    !diagnosis?.trim() &&
    !medicine?.trim() &&
    !phoneNumber?.trim()
  ) {
    throw new ApiError(400, "provide at least one search field");
  }

  let conditions = [];

  if (patientName?.trim())
    conditions.push({
      patientName: { $regex: escapeRegex(patientName.trim()), $options: "i" },
    });

  if (diagnosis?.trim())
    conditions.push({
      diagnosis: { $regex: escapeRegex(diagnosis.trim()), $options: "i" },
    });

  if (medicine?.trim())
    conditions.push({
      medicine: { $regex: escapeRegex(medicine.trim()), $options: "i" },
    });
  if (phoneNumber?.trim())
    conditions.push({
      phoneNumber: { $regex: escapeRegex(phoneNumber.trim()), $options: "i" },
    });

  const filterPatients = await Patient.aggregate([
    {
      $match: {
        doctor: req.doctor._id,
        $or: conditions,
      },
    },
  ]);

  if (filterPatients.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "no matching result found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, filterPatients, "here is all matching results"));
});

export {
  registerPatient,
  fetchAllPatient,
  findOnePatient,
  updatePatientDetails,
  deletePatient,
  searchPatient,
};