import mongoose from "mongoose";

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
  } = req.body;

  if (!PatientName || !age || !gender || !diagnosis || !medicine) {
    throw new ApiError(400, "provide all required details");
  }

  const existingPatient = await Patient.findOne({
    PatientName: PatientName,
    age: age,
    gender: gender,
    diagnosis: diagnosis,
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
    familySize,
    occupation,
    followUpDate,
  });
  if (!newPatient) {
    throw new ApiError(500, "there is problem in registering Patient");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "patient registered successfully"));
});

export { registerPatient };
