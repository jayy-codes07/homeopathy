import { isValidObjectId } from "mongoose";
import { Patient } from "../models/patient.model.js";
import { ApiError } from "./apiError.js";

// Scopes the lookup to the logged in doctor so one doctor cannot read or write
// records against another doctor's patient. Returns the patient document.
export const findOwnedPatient = async (patientId, doctorId) => {
  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "provide valid patientId");
  }

  const patient = await Patient.findOne({ _id: patientId, doctor: doctorId });
  if (!patient) {
    throw new ApiError(404, "patient does not exist in database");
  }

  return patient;
};
