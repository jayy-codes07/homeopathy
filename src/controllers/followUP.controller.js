import mongoose from "mongoose";
import { FollowUP } from "../models/followUP.model.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { Patient } from "../models/patient.model.js";

const createFollowup = asyncHandler(async (req, res) => {
  const { followUpDate, symptoms, advise, medicine } = req.body;
  const { patientId } = req.params;

  if (
    !followUpDate ||
    !symptoms?.trim() ||
    !advise?.trim() ||
    !medicine?.trim()
  ) {
    throw new ApiError(400, "needed to provide all details");
  }

  const followUP = await FollowUP.create({
    patient: patientId,
    followUpDate,
    symptoms: symptoms?.trim(),
    advise: advise?.trim(),
    medicine: medicine?.trim(),
  });

  if (!followUP) {
    throw new ApiError(500, "something went wrong while creating followup");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, followUP, "followup created successfully"));
});

const getPatientFollowup = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "provide valid patientId");
  }
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "patient does not exist in database");
  }

  //   const followUp = await FollowUP.find({ patient: patientId });
  const followUp = await FollowUP.aggregate([
    { $match: { patient: new mongoose.Types.ObjectId(patientId) } },
    {
      $sort: {
        createdAt: 1,
      },
    },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ]);

  if (followUp.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "there is no followup of this patient"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, followUp, "all followup fetched successfully"));
});

const updatePatientFollowup = asyncHandler(async (req, res) => {
  const { followupId } = req.params;
  const { symptoms, advise, medicine } = req.body;

  if (!isValidObjectId(followupId)) {
    throw new ApiError(400, "provide valid followupId");
  }

  const updateField = {};

  if (symptoms?.trim()) updateField.symptoms = symptoms.trim();
  if (advise?.trim()) updateField.advise = advise.trim();
  if (medicine?.trim()) updateField.medicine = medicine.trim();

  const updatedFollowUP = await FollowUP.findByIdAndUpdate(
    followupId,
    { $set: updateField },
    { new: true },
  );

  if (!updatedFollowUP) {
    throw new ApiError(400, "followup does not found in database");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedFollowUP, "followup updated successfully"),
    );
});

export { createFollowup, getPatientFollowup, updatePatientFollowup };
