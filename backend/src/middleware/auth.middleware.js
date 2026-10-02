import jwt from "jsonwebtoken";
import { ApiError } from "../utility/apiError.js";
import { Doctor } from "../models/doctor.model.js";
import { asyncHandler } from "../utility/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "unauthorized user");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    // Covers malformed, tampered and expired tokens alike.
    throw new ApiError(401, err.name === "TokenExpiredError" ? "jwt expired" : "invalid token");
  }

  const doctor = await Doctor.findById(payload.id).select(
    "-password -refreshToken",
  );

  if (!doctor) {
    throw new ApiError(401, "doctor does not found");
  }

  req.doctor = doctor;

  next();
});
