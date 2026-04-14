import mongoose, { isValidObjectId } from "mongoose";

import { Patient } from "../models/patient.model.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";

const registerPatient = asyncHandler(async (req, res) => {
  const {
    PatientName,
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
    !PatientName ||
    !age ||
    !gender ||
    !diagnosis ||
    !medicine ||
    !phoneNumber
  ) {
    throw new ApiError(400, "provide all required details");
  }

  const existingPatient = await Patient.findOne({
    phoneNumber: phoneNumber?.trim(),
  });
  if (existingPatient) {
    throw new ApiError(400, "patient already exist");
  }

  const newPatient = await Patient.create({
    PatientName,
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
  });
  if (!newPatient) {
    throw new ApiError(500, "there is problem in registering Patient");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newPatient, "patient registered successfully"));
});

const fetchAllPatient = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  // const allPatient = await Patient.find();
  const allPatient = await Patient.aggregate([
    { $sort: { createdAt: -1 } },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ]);
  const totalPatients = await Patient.countDocuments();

  if (allPatient.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          [],
          "No patients found. Please register new patients.",
        ),
      );
  }
  const patientData = {
    patient: allPatient,
    totalPatients,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalPatients / parseInt(limit)),
  };
  return res
    .status(200)
    .json(
      new ApiResponse(200, patientData, "all patients fetched successfully"),
    );
});

const findOnePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "provide valid objectId");
  }

  const patient = await Patient.findById(patientId);

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
    PatientName,
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

  if (PatientName?.trim()) {
    updateField.PatientName = PatientName?.trim();
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

  const patient = await Patient.findByIdAndUpdate(
    patientId,
    {
      $set: updateField,
    },
    { new: true },
  );

  if (!patient) {
    throw new ApiError(404, "patient does not exist in database");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, patient, "patient updated successfully "));
});

const deletePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "provide valid objectId");
  }

  const patient = await Patient.findByIdAndDelete(patientId);

  if (!patient) {
    throw new ApiError(404, "patient does not exist in database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "patient deleted successfully "));
});

export {
  registerPatient,
  fetchAllPatient,
  findOnePatient,
  updatePatientDetails,
  deletePatient,
};
