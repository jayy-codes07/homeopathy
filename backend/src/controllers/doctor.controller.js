import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { asyncHandler } from "../utility/asyncHandler.js";

const registerDoctor = asyncHandler(async (req, res) => {
  const { fullname, email, password, avatar, degree } = req.body;
  if (!fullname?.trim() || !email?.trim() || !password?.trim() || !degree?.trim()) {
    throw new ApiError(400, "all fields are required")
  }

  const existingDoctor = await Doctor.findOne({ email: email.trim() })

  if (existingDoctor) {
    throw new ApiError(400, "this email is already used")
  }
  const uploadedAvatar = await uploadtocloudinary(avatar)

  const doctor = await Doctor.create({ fullname: fullname.trim(), avatar: uploadedAvatar, email: email.trim(), password: password.trim(), degree: degree.trim() })

  const createdDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken")
  if (!createdDoctor) {
    throw new ApiError(500, "problem in registering doctor")
  }

  return res.status(201).json(new ApiResponse(201, createdDoctor, "doctor registerd successfully"))

});

export { registerDoctor };
