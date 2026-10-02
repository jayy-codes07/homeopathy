import mongoose from "mongoose";
import { FollowUP } from "../models/followUP.model.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { findOwnedPatient } from "../utility/ownedPatient.js";

// Loads a follow-up only if its patient belongs to the logged in doctor.
const findOwnedFollowup = async (followupId, doctorId) => {
  if (!isValidObjectId(followupId)) {
    throw new ApiError(400, "provide valid followupId");
  }
  const followUp = await FollowUP.findById(followupId);
  if (!followUp) {
    throw new ApiError(404, "followup does not found in database");
  }
  await findOwnedPatient(followUp.patient, doctorId);
  return followUp;
};

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

  await findOwnedPatient(patientId, req.doctor._id);

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

  await findOwnedPatient(patientId, req.doctor._id);

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

  await findOwnedFollowup(followupId, req.doctor._id);

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
    throw new ApiError(404, "followup does not found in database");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedFollowUP, "followup updated successfully"),
    );
});

const deltePatientFollowup = asyncHandler(async (req, res) => {
  const { followupId } = req.params;
  await findOwnedFollowup(followupId, req.doctor._id);
  const followUP = await FollowUP.findByIdAndDelete(followupId);

  if (!followUP) {
    throw new ApiError(404, "followup does not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, followUP, "follow up deleted successfully"));
});

export {
  createFollowup,
  getPatientFollowup,
  updatePatientFollowup,
  deltePatientFollowup,
};
